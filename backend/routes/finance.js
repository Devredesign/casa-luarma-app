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
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { m, y, start, end };
}

router.get('/summary', async (req, res) => {
  try {
    const { m: month, y: year, start, end } = monthRange(req.query.month, req.query.year);

    // 1) Ingreso por clases (pagos pagados en el rango)
    const paidPayments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      status: 'paid'
    }).lean();

    const incomeClasses = paidPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    // 2) Costo profesores: teacherPay por sesión (desde modalidad)
    //    (robusto: si en el futuro Payment trae modalityId, se puede priorizar eso)
    const classIds = [...new Set(paidPayments.map(p => String(p.classId)).filter(Boolean))];

    const classes = await Class.find({ _id: { $in: classIds } })
      .populate('modality')
      .lean();

    const classMap = Object.fromEntries(classes.map(c => [String(c._id), c]));

    let costTeachers = 0;
    for (const p of paidPayments) {
      const cls = classMap[String(p.classId)];
      const sessions = Number(p.sessions || 1) || 1;

      const teacherPay =
        Number(cls?.modality?.teacherPay) ||
        0;

      costTeachers += teacherPay * sessions;
    }

    // 3) Ingreso alquileres (robusto con nombres de campos)
    const rentalsAgg = await Rental.aggregate([
      {
        $addFields: {
          _date: {
            $ifNull: [
              '$startDateTime',
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
            $convert: {
              input: '$_amountRaw',
              to: 'double',
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$_amount' } } }
    ]);

    const incomeRentals = Number(rentalsAgg?.[0]?.total || 0);

    // 4) Costos operativos:
    //    - recurrentes mensuales: recurrence='monthly'
    //    - variables: dateIncurred dentro del mes y recurrence null
    const fixedAgg = await Cost.aggregate([
      { $match: { recurrence: 'monthly' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const variableAgg = await Cost.aggregate([
      {
        $match: {
          $and: [
            { dateIncurred: { $gte: start, $lt: end } },
            {
              $or: [
                { recurrence: null },
                { recurrence: { $exists: false } }
              ]
            }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const fixedMonthly = Number(fixedAgg?.[0]?.total || 0);
    const variableMonthly = Number(variableAgg?.[0]?.total || 0);
    const totalCosts = fixedMonthly + variableMonthly;

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
