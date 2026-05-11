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

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
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

    // 3) Ingreso alquileres (robusto con campos distintos)
    const rentalsAgg = await Rental.aggregate([
      {
        $addFields: {
          _date: {
            $ifNull: [
              '$startDateTime',
              { $ifNull: [
                '$startTime',
                { $ifNull: [
                  '$start',
                  { $ifNull: [
                    '$startDate',
                    { $ifNull: [
                      '$date',
                      { $ifNull: ['$rentalDate', '$createdAt'] }
                    ] }
                  ] }
                ] }
              ] }
            ]
          },
          _amountRaw: {
            $ifNull: [
              '$amount',
              { $ifNull: [
                '$price',
                { $ifNull: ['$total', 0] }
              ] }
            ]
          }
        }
      },
      { $match: { _date: { $gte: start, $lt: end } } },
      {
        $addFields: {
          _amount: {
            $convert: { input: '$_amountRaw', to: 'double', onError: 0, onNull: 0 }
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$_amount' } } }
    ]);

    const incomeRentals = Number(rentalsAgg?.[0]?.total || 0);

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

    // 5) Ganancias
    const grossProfit = (incomeClasses + incomeRentals) - costTeachers;
    const realProfit = grossProfit - totalCosts;

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
