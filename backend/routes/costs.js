const express = require('express');
const router  = express.Router();
const Cost    = require('../models/Cost');

// GET /api/costs
router.get('/', async (req, res) => {
  try {
    const costs = await Cost.find().sort('-dateIncurred');
    res.json(costs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/costs
router.post('/', async (req, res) => {
  const { name, amount, type, recurrence, dateIncurred } = req.body;
  const newCost = new Cost({ name, amount, type, recurrence, dateIncurred });
  try {
    const saved = await newCost.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/costs/:id
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Cost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Costo no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/costs/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Costo no encontrado' });
    res.json({ message: 'Costo eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
