// backend/routes/financeTeachers.js
const express = require('express');
const router  = express.Router();
const Payment = require('../models/Payment');
const Class   = require('../models/Class');

router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth()+1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const start = new Date(
  Date.UTC(year, month - 1, 1)
);

const end = new Date(
  Date.UTC(year, month, 1)
);

    const payments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      status: 'paid'
    });

    const classIds = [...new Set(payments.map(p => p.classId.toString()))];
    const classes  = await Class.find({ _id: { $in: classIds } });
    const classMap = Object.fromEntries(classes.map(c => [c._id.toString(), c]));

    const summary = {};

    payments.forEach(p => {
      const cls = classMap[p.classId.toString()];
      const prof = cls?.professor || 'Sin profesor';

      const ingress = Number(p.amount || 0);
      const sessions = Number(p.sessions || 1);
      const payPerSession = Number(p.teacherPayPerSession || 0); // ✅ viene de modalidad en el pago
      const toPay = payPerSession * sessions;

      if (!summary[prof]) summary[prof] = { professor: prof, totalIngress: 0, totalToPay: 0 };
      summary[prof].totalIngress += ingress;
      summary[prof].totalToPay += toPay;
    });

    const IVA_RATE = 0.13;

const result = Object.values(summary).map(item => {
  const totalIngress = Number(
    item.totalIngress || 0
  );

  const totalToPay = Number(
    item.totalToPay || 0
  );

  const totalVat = Math.round(
    totalToPay * IVA_RATE
  );

  const totalToPayWithVat =
    totalToPay + totalVat;

  return {
    professor: item.professor,
    totalIngress,
    totalToPay,

    // IVA correspondiente al pago del profesor
    totalVat,

    // Total que Casa Luarma debe desembolsar
    totalToPayWithVat,

    // Conservamos la ganancia actual sin modificar
    totalProfit:
      totalIngress - totalToPay
  };
});

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generando desglose por profesor' });
  }
});

module.exports = router;
