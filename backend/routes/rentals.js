// backend/routes/rentals.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');

// Obtener todos los alquileres
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    console.error('Error al obtener alquileres:', err);
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo alquiler
router.post('/', async (req, res) => {
  const { space, tenantName, activityName, hours, startTime } = req.body;
  const newRental = new Rental({ space, tenantName, activityName, hours, startTime });
  try {
    const savedRental = await newRental.save();
    res.status(201).json(savedRental);
  } catch (err) {
    console.error('Error al crear alquiler:', err);
    res.status(400).json({ message: err.message });
  }
});

// Actualizar un alquiler (por ejemplo, para guardar eventId)
router.patch('/:id', async (req, res) => {
  try {
    const updatedRental = await Rental.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRental) return res.status(404).json({ message: 'Alquiler no encontrado' });
    res.json(updatedRental);
  } catch (err) {
    console.error('Error al actualizar alquiler:', err);
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un alquiler
router.delete('/:id', async (req, res) => {
  try {
    const deletedRental = await Rental.findByIdAndDelete(req.params.id);
    if (!deletedRental) return res.status(404).json({ message: 'Alquiler no encontrado' });
    res.json({ message: 'Alquiler eliminado' });
  } catch (err) {
    console.error('Error al eliminar alquiler:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

