// backend/routes/classes.js
const express  = require('express');
const router   = express.Router();
const Class    = require('../models/Class');
const Modality = require('../models/Modality');

// Helper: recarga el documento desde la base con populate
async function fetchAndPopulate(classId) {
  return await Class.findById(classId)
    .populate('modality', 'name price teacherPay')
    .populate('space',    'name pricePerHour color')
    .exec();
}

// GET /api/classes - Obtener todas las clases
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('modality', 'name price teacherPay')
      .populate('space',    'name pricePerHour color')
      .exec();
    res.json(classes);
  } catch (err) {
    console.error('GET /api/classes error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/classes - Crear una nueva clase
router.post('/', async (req, res) => {
  // 1) Desestructura TODOS los campos que envía el cliente
  const {
    title,
    modality,
    numberOfClasses,
    professor,
    schedule,
    space,
    isRecurring
  } = req.body;

  // 2) Valida que la modalidad exista
  let mod;
  try {
    mod = await Modality.findById(modality);
  } catch {
    return res.status(400).json({ message: 'ID de modalidad inválido' });
  }
  if (!mod) {
    return res.status(400).json({ message: 'Modalidad no encontrada' });
  }

  // 3) Crea el documento
  const newClass = new Class({
    title,
    modality,
    numberOfClasses,
    professor,
    schedule,
    space,
    isRecurring
  });

  // 4) Guarda y luego repopula antes de responder
  try {
    const saved = await newClass.save();
    const populated = await fetchAndPopulate(saved._id);
    res.status(201).json(populated);
  } catch (err) {
    console.error('POST /api/classes error:', err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/classes/:id - Actualizar una clase existente
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }
    const populated = await fetchAndPopulate(updated._id);
    res.json(populated);
  } catch (err) {
    console.error('PATCH /api/classes/:id error:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/classes/:id - Eliminar una clase
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }
    res.json({ message: 'Clase eliminada correctamente' });
  } catch (err) {
    console.error('DELETE /api/classes/:id error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
