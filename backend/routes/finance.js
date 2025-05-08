// backend/routes/finance.js
const express = require('express');
const router  = express.Router();
const Payment = require('../models/Payment');
const Rental  = require('../models/Rental');
const Class   = require('../models/Class');
const Cost = require('../models/Cost');

// GET /api/finance/summary?month=MM&year=YYYY
router.get('/summary', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date()).getMonth() + 1;
    const year  = parseInt(req.query.year)  || (new Date()).getFullYear();
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month,     1);

    // 1) INGRESOS por clases
    const payments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      status:      'paid'
    });

    let incomeClasses = 0;
    let costTeachers  = 0;

    // Precarga de clases para no hacer N queries
    const classIds = [...new Set(payments.map(p => p.classId.toString()))];
    const classes  = await Class.find({ _id: { $in: classIds } })
      .populate('modality', 'teacherPay')
      .exec();
    const classMap = Object.fromEntries(classes.map(c => [c._id.toString(), c]));

    payments.forEach(p => {
      incomeClasses += p.amount;

      // ← aquí tomamos sessions del pago
      const sessions = p.sessions != null ? p.sessions : 1;

      const cls      = classMap[p.classId.toString()];
      const teacherPay = cls?.modality?.teacherPay || 0;
      const payToPro  = teacherPay * sessions;
      costTeachers   += payToPro;
    });

    // 2) INGRESOS por alquileres
    const rentals = await Rental.find({
      startTime: { $gte: start, $lt: end }
    }).populate('space', 'pricePerHour'); // carga pricePerHour
    const incomeRentals = rentals.reduce((sum, r) =>
      sum + (r.hours * (r.space?.pricePerHour || 0))
    , 0);
    // 3) COSTOS OPERATIVOS en el rango
        const costs = await Cost.find({
            dateIncurred: { $gte: start, $lt: end }
        });
        const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
    
    // 4) GANANCIA BRUTA (antes grossProfit) y NETA (realProfit)
    const grossProfit = (incomeClasses + incomeRentals) - costTeachers;
    const realProfit  = grossProfit - totalCosts;

    res.json({
              incomeClasses,
              incomeRentals,
              costTeachers,
              totalCosts,
              grossProfit,
              realProfit
            });
  } catch (err) {
    console.error('Error generando summary:', err);
    res.status(500).json({ message: 'Error generando resumen financiero' });
  }
});

// GET /api/finance/teachers?month=MM&year=YYYY
router.get('/teachers', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date()).getMonth() + 1;
    const year  = parseInt(req.query.year)  || (new Date()).getFullYear();
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month,     1);

    // 1) Pagos de clases 'paid' en ese rango
    const payments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      status:      'paid'
    });
    // 2bis) COSTOS OPERATIVOS (fijos + variables) en el rango
    const costs = await Cost.find({
        date: { $gte: start, $lt: end }
    });
    const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
    // 2) Precarga de clases con modalidad poblada (incluye teacherPay)
    const classIds = [...new Set(payments.map(p => p.classId.toString()))];
    const classes  = await Class.find({ _id: { $in: classIds } })
      .populate('modality', 'teacherPay')
      .exec();
    const classMap = Object.fromEntries(classes.map(c => [c._id.toString(), c]));

    // 3) Agrupamiento por profesor
    const byTeacher = {};

    payments.forEach(p => {
      // sesiones del pago (por defecto 1)
      const sessions = p.sessions != null ? p.sessions : 1;

      const cls    = classMap[p.classId.toString()];
      if (!cls) return;

      const prof    = cls.professor;
      const ingress = p.amount;
      const teacherPay = cls.modality?.teacherPay || 0;
      const toPay   = teacherPay * sessions;
      const profit  = ingress - toPay;

      if (!byTeacher[prof]) {
        byTeacher[prof] = {
          professor:    prof,
          totalIngress: 0,
          totalToPay:   0,
          totalProfit:  0
        };
      }
      byTeacher[prof].totalIngress += ingress;
      byTeacher[prof].totalToPay   += toPay;
      byTeacher[prof].totalProfit  += profit;
    });

    res.json(Object.values(byTeacher));
  } catch (err) {
    console.error('Error generando teachers breakdown:', err);
    res.status(500).json({ message: 'Error generando desglose de profesores' });
  }
});

module.exports = router;


