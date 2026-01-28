// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Modality = require('../models/Modality');

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
  try {
    const { classId, studentId, modalityId, method, paymentDate, sessions } = req.body;

    if (!classId || !studentId || !modalityId || !method || !paymentDate) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const sessionsNum = Math.max(1, Number(sessions || 1));

    const modality = await Modality.findById(modalityId);
    if (!modality) return res.status(400).json({ message: 'Modalidad inválida.' });

    const pricePerSession = Number(modality.price || 0);
    const teacherPayPerSession = Number(modality.teacherPay || 0);
    const amount = pricePerSession * sessionsNum;

    const newPayment = new Payment({
      classId,
      studentId,
      modalityId,
      pricePerSession,
      teacherPayPerSession,
      amount,
      method,
      paymentDate,
      sessions: sessionsNum
    });

    const saved = await newPayment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error al crear pago:', err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/payments/:id
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
