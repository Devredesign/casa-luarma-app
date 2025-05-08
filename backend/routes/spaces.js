  // backend/routes/spaces.js
const express = require('express');
const router = express.Router();
const Space = require('../models/Space');

// Obtener todos los espacios
router.get('/', async (req, res) => {
  try {
    const spaces = await Space.find();
    res.json(spaces); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo espacio
router.post('/', async (req, res) => {
  const { name, pricePerHour, squareMeters, description, color } = req.body;
  const newSpace = new Space({ name, pricePerHour, squareMeters, description, color });
  try {
    const savedSpace = await newSpace.save();
    res.status(201).json(savedSpace);
  } catch (err) {
    console.error('Error creating space:', err);
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un espacio
router.delete('/:id', async (req, res) => {
  try {
    await Space.findByIdAndDelete(req.params.id);
    res.json({ message: 'Espacio eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
