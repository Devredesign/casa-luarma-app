// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    console.error('Error al obtener pagos:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  // Desestructura **TODOS** los campos que tu modelo requiere
  const { classId, studentId, amount, method, paymentDate, sessions } = req.body;
  const newPayment = new Payment({ classId, studentId, amount, method, paymentDate, sessions });
  try {
    const saved = await newPayment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error al crear pago:', err);
    res.status(400).json({ message: err.message });
  }
});

// (Opcional) PATCH /api/payments/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Pago no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar pago:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Pago no encontrado' });
    res.json({ message: 'Pago eliminado' });
  } catch (err) {
    console.error('Error al eliminar pago:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
