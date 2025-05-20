// backend/routes/teachers.js
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

// Obtener todos los profesores
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo profesor
router.post('/', async (req, res) => {
  const { name, email, phone, specialty, availability } = req.body;
  const newTeacher = new Teacher({ name, email, phone, specialty, availability });
  try {
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar un profesor existente
router.patch('/:id', async (req, res) => {
  const updates = req.body;
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    res.json(updatedTeacher);
  } catch (err) {
    console.error('Error al actualizar profesor:', err);
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un profesor
router.delete('/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profesor eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
