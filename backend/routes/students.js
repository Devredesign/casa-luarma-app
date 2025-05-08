// backend/routes/students.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/students  → crea un estudiante (incluyendo cedula)
router.post('/', async (req, res) => {
  const { name, cedula, email, phone } = req.body;    // ← aquí añadimos cedula
  const newStudent = new Student({ name, cedula, email, phone });
  try {
    const saved = await newStudent.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/students/:id  → actualiza datos (incluyendo cedula)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,            // aquí puede venir { cedula: '...' } junto con otros campos
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json({ message: 'Estudiante eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;