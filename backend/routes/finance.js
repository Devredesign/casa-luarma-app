// backend/routes/finance.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Cost = require('../models/Cost');
const Class = require('../models/Class');
const Modality = require('../models/Modality');

// Helpers
function normalizeDateOnly(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  // Normalize to midnight local
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function inRange(d, start, end) {
  if (!d) return false;
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);

    if (!start || !end) {
      return res.status(400).json({ error: 'startDate y endDate son requeridos' });
    }

    // End inclusive
    end.setHours(23, 59, 59, 999);

    // Pagos
    const payments = await Payment.find({
      date: { $gte: start, $lte: end }
    }).lean();

    // Alquileres
    const rentals = await Rental.find({
      startTime: { $gte: start, $lte: end }
    }).lean();

    // Costos
    const costs = await Cost.find({
      date: { $gte: start, $lte: end }
    }).lean();

    // Modalidades (para precios)
    const modalities = await Modality.find().lean();
    const modalityById = new Map(modalities.map(m => [String(m._id), m]));

    // Clases (para saber modalidad asociada si el pago no trae una)
    const classes = await Class.find().lean();
    const classById = new Map(classes.map(c => [String(c._id), c]));

    // Ingresos por pagos (clases)
    const paymentsIncome = payments.reduce((sum, p) => {
      const sessions = Number(p.sessions || 1);
      let modality = null;

      if (p.modality) {
        modality = modalityById.get(String(p.modality));
      } else if (p.class) {
        const cls = classById.get(String(p.class));
        if (cls?.modality) modality = modalityById.get(String(cls.modality));
      }

      const pricePerSession = Number(modality?.price || 0);
      return sum + (pricePerSession * sessions);
    }, 0);

    // Ingresos por alquileres: horas * tarifa del espacio si existiera
    // Nota: si Rental ya guarda amount, usarlo. Si no, estimar (amount || 0).
    const rentalsIncome = rentals.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const totalIncome = paymentsIncome + rentalsIncome;

    // Egresos por costos
    const totalCosts = costs.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const net = totalIncome - totalCosts;

    res.json({
      startDate: start,
      endDate: end,
      income: {
        payments: paymentsIncome,
        rentals: rentalsIncome,
        total: totalIncome
      },
      costs: totalCosts,
      net
    });
  } catch (err) {
    console.error('Error en /api/finance/summary:', err);
    res.status(500).json({ error: 'Error al calcular resumen financiero' });
  }
});

module.exports = router;
