// backend/routes/finance.js
const express = require('express');
const router = express.Router();

const Payment = require('../models/Payment');
const Class = require('../models/Class');
const Modality = require('../models/Modality');
const Cost = require('../models/Cost');
const Rental = require('../models/Rental');

function monthRange(month, year) {
  const m = parseInt(month, 10) || (new Date().getMonth() + 1);
  const y = parseInt(year, 10) || new Date().getFullYear();

  if (m < 1 || m > 12 || y < 2000 || y > 3000) return null;

  const start = new Date(
  Date.UTC(y, m - 1, 1)
);

const end = new Date(
  Date.UTC(y, m, 1)
);
  return { m, y, start, end };
}

function parseDate(d) {
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

router.get('/summary', async (req, res) => {
  try {
    // ✅ Compatibilidad:
    // - Si viene month/year (lo que usa tu frontend) -> usamos eso
    // - Si vienen startDate/endDate -> también lo aceptamos
    let start, end, month, year;

    if (req.query.month || req.query.year) {
      const r = monthRange(req.query.month, req.query.year);
      if (!r) return res.status(400).json({ message: 'month/year inválidos' });
      ({ start, end } = r);
      month = r.m;
      year = r.y;
    } else if (req.query.startDate && req.query.endDate) {
      start = parseDate(req.query.startDate);
      end = parseDate(req.query.endDate);
      if (!start || !end) return res.status(400).json({ message: 'startDate/endDate inválidos' });

      // end exclusivo: sumamos 1 día al end para incluirlo completo si viene como "date-only"
      const endExclusive = new Date(end.getTime());
      endExclusive.setHours(23, 59, 59, 999);
      end = new Date(endExclusive.getTime() + 1);

      month = start.getMonth() + 1;
      year = start.getFullYear();
    } else {
      return res.status(400).json({ message: 'Debes enviar month/year o startDate/endDate' });
    }

    // 1) Pagos en rango (robusto: soporta paymentDate o date)
    const paidPayments = await Payment.find({
      $and: [
        {
          $or: [
            { paymentDate: { $gte: start, $lt: end } },
            { date: { $gte: start, $lt: end } }
          ]
        },
        {
          $or: [
            { status: 'paid' },
            { status: { $exists: false } } // por si tu schema no usa status
          ]
        }
      ]
    }).lean();

    // Ingreso por clases: si existe amount lo usamos; si no, lo calculamos con pricePerSession/modality
    let incomeClasses = 0;
    for (const p of paidPayments) {
      const sessions = Number(p.sessions || 1) || 1;

      const amount = Number(p.amount);
      if (Number.isFinite(amount) && amount > 0) {
        incomeClasses += amount;
        continue;
      }

      const priceSnap = Number(p.pricePerSession);
      if (Number.isFinite(priceSnap) && priceSnap > 0) {
        incomeClasses += priceSnap * sessions;
        continue;
      }

      // fallback: modalityId / modality
      const modId = p.modalityId || p.modality;
      if (modId) {
        const mod = await Modality.findById(modId).lean();
        incomeClasses += Number(mod?.price || 0) * sessions;
      }
    }

    // 2) Costo profesores: teacherPayPerSession si existe; si no, buscamos modalidad
    let costTeachers = 0;
    for (const p of paidPayments) {
      const sessions = Number(p.sessions || 1) || 1;

      const teacherSnap = Number(p.teacherPayPerSession);
      if (Number.isFinite(teacherSnap) && teacherSnap > 0) {
        costTeachers += teacherSnap * sessions;
        continue;
      }

      const modId = p.modalityId || p.modality;
      if (modId) {
        const mod = await Modality.findById(modId).lean();
        costTeachers += Number(mod?.teacherPay || 0) * sessions;
        continue;
      }

      // ultra-fallback: si solo hay classId, intentamos modalidad desde la clase
      const classId = p.classId || p.class;
      if (classId) {
        const cls = await Class.findById(classId).populate('modality').lean();
        costTeachers += Number(cls?.modality?.teacherPay || 0) * sessions;
      }
    }

   // 3) Ingreso de alquileres
const rentals = await Rental.find({
  startTime: {
    $gte: start,
    $lt: end,
  },
})
  .populate({
    path: 'space',
    select: 'pricePerHour',
  })
  .lean();

const incomeRentals = rentals.reduce((total, rental) => {
  const storedAmount = Number(rental.amount);

  // Alquileres nuevos: usamos el monto guardado.
  if (Number.isFinite(storedAmount) && storedAmount > 0) {
    return total + storedAmount;
  }

  const hours = Number(rental.hours);

  const snapshotPrice = Number(
    rental.pricePerHourSnapshot
  );

  const currentSpacePrice = Number(
    rental.space?.pricePerHour
  );

  /*
   * Para registros anteriores:
   * 1. Intentamos usar el precio histórico.
   * 2. Si no existe, usamos el precio actual del espacio.
   */
  const pricePerHour =
    Number.isFinite(snapshotPrice) && snapshotPrice > 0
      ? snapshotPrice
      : currentSpacePrice;

  if (
    !Number.isFinite(hours) ||
    hours <= 0 ||
    !Number.isFinite(pricePerHour) ||
    pricePerHour <= 0
  ) {
    return total;
  }

  return total + Math.round(hours * pricePerHour);
}, 0);

    // 4) Costos: fijos mensuales + variables del mes
    const fixedAgg = await Cost.aggregate([
      { $match: { recurrence: 'monthly' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const variableAgg = await Cost.aggregate([
      {
        $match: {
          $and: [
            { dateIncurred: { $gte: start, $lt: end } },
            { $or: [{ recurrence: null }, { recurrence: { $exists: false } }] }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalCosts = Number(fixedAgg?.[0]?.total || 0) + Number(variableAgg?.[0]?.total || 0);

    // 5) Resultados financieros

// Todo el dinero ingresado durante el mes,
// antes de pagar profesores y costos operativos.
const grossProfit =
  incomeClasses +
  incomeRentals;

// Dinero restante después de pagar
// profesores y costos operativos.
const realProfit =
  grossProfit -
  costTeachers -
  totalCosts;

    return res.json({
      month,
      year,
      incomeClasses,
      incomeRentals,
      costTeachers,
      totalCosts,
      grossProfit,
      realProfit
    });
  } catch (err) {
    console.error('Error /finance/summary:', err);
    res.status(500).json({ message: 'Error generando resumen financiero' });
  }
});

module.exports = router;
