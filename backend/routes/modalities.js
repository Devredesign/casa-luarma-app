const express  = require('express');
const router   = express.Router();
const Modality = require('../models/Modality');

// GET /api/modalities
router.get('/', async (req, res) => {
  try {
    const list = await Modality.find().sort('name');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/modalities
router.post('/', async (req, res) => {
  const { name, price, teacherPay } = req.body;
  try {
    const mod = new Modality({ name, price, teacherPay });
    const saved = await mod.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/modalities/:id
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Modality.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Modalidad no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/modalities/:id
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Modality.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Modalidad no encontrada' });
    res.json({ message: 'Modalidad eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
