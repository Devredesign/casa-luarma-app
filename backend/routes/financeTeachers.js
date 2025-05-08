// backend/routes/financeTeachers.js
const express = require('express');
const router  = express.Router();
const Payment = require('../models/Payment');
const Class   = require('../models/Class');

// Costos según modalidad
const teacherCost = {
  individual: 35000,
  pareja:     20000,
  grupal:     18000
};

/**
 * GET /api/finance/teachers?month=MM&year=YYYY
 * Devuelve un array de { professor, totalIngress, totalToPay, profit }
 */
router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth()+1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const start = new Date(year, month-1, 1);
    const end   = new Date(year, month,   1);

    // 1) Traer pagos de clases pagados en el rango
    const payments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      status:      'paid'
    });

    // 2) Cargar info de clases referenciadas
    const classIds = [...new Set(payments.map(p => p.classId.toString()))];
    const classes  = await Class.find({ _id: { $in: classIds } });
    const classMap = Object.fromEntries(classes.map(c => [c._id.toString(), c]));

    // 3) Agregar por profesor
    const summary = {};
    payments.forEach(p => {
      const cls      = classMap[p.classId.toString()];
      const prof     = cls?.professor || 'Sin profesor';
      const mod      = cls?.modality;
      const ingress  = p.amount;
      const cost     = teacherCost[mod] || 0;

      if (!summary[prof]) summary[prof] = { professor: prof, totalIngress: 0, totalToPay: 0 };
      summary[prof].totalIngress += ingress;
      summary[prof].totalToPay   += cost;
    });

    // 4) Crear array y calcular ganancia por profe
    const result = Object.values(summary).map(item => ({
      professor:    item.professor,
      totalIngress: item.totalIngress,
      totalToPay:   item.totalToPay,
      profit:       item.totalIngress - item.totalToPay
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generando desglose por profesor' });
  }
});

module.exports = router;
