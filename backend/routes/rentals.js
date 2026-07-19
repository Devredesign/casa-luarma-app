// backend/routes/rentals.js
const express = require('express');

const router = express.Router();

const Rental = require('../models/Rental');
const Space = require('../models/Space');

async function calculateRentalPrice(spaceId, hours) {
  const numericHours = Number(hours);

  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    const error = new Error('La cantidad de horas debe ser mayor a cero');
    error.status = 400;
    throw error;
  }

  const space = await Space.findById(spaceId).select(
    'name pricePerHour'
  );

  if (!space) {
    const error = new Error('El espacio seleccionado no existe');
    error.status = 404;
    throw error;
  }

  const pricePerHour = Number(space.pricePerHour);

  if (!Number.isFinite(pricePerHour) || pricePerHour < 0) {
    const error = new Error(
      'El espacio seleccionado no tiene un precio válido'
    );
    error.status = 400;
    throw error;
  }

  return {
    numericHours,
    pricePerHourSnapshot: pricePerHour,
    amount: Math.round(numericHours * pricePerHour),
  };
}

// Obtener todos los alquileres
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find().sort({ startTime: -1 });

    res.json(rentals);
  } catch (err) {
    console.error('Error al obtener alquileres:', err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Crear un nuevo alquiler
router.post('/', async (req, res) => {
  try {
    const {
      space,
      tenantName,
      activityName,
      hours,
      startTime,
      isRecurring = false,
      eventId = null,
    } = req.body;

    if (!space) {
      return res.status(400).json({
        message: 'Debes seleccionar un espacio',
      });
    }

    if (!tenantName?.trim()) {
      return res.status(400).json({
        message: 'Debes indicar el nombre del arrendatario',
      });
    }

    if (!activityName?.trim()) {
      return res.status(400).json({
        message: 'Debes indicar el nombre de la actividad',
      });
    }

    const parsedStartTime = new Date(startTime);

    if (Number.isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({
        message: 'La fecha del alquiler no es válida',
      });
    }

    /*
     * El monto se calcula en el servidor.
     * No confiamos únicamente en el valor enviado por el navegador.
     */
    const {
      numericHours,
      pricePerHourSnapshot,
      amount,
    } = await calculateRentalPrice(space, hours);

    const newRental = new Rental({
      space,
      tenantName: tenantName.trim(),
      activityName: activityName.trim(),
      hours: numericHours,
      startTime: parsedStartTime,
      pricePerHourSnapshot,
      amount,
      isRecurring: Boolean(isRecurring),
      eventId,
    });

    const savedRental = await newRental.save();

    res.status(201).json(savedRental);
  } catch (err) {
    console.error('Error al crear alquiler:', err);

    res.status(err.status || 400).json({
      message: err.message,
    });
  }
});

// Actualizar un alquiler
router.patch('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: 'Alquiler no encontrado',
      });
    }

    const nextSpace = req.body.space ?? rental.space;
    const nextHours = req.body.hours ?? rental.hours;

    const needsPriceRecalculation =
      req.body.space !== undefined ||
      req.body.hours !== undefined ||
      !Number(rental.amount) ||
      !Number(rental.pricePerHourSnapshot);

    // Evita que el navegador modifique manualmente estos valores.
    const updates = { ...req.body };

    delete updates.amount;
    delete updates.pricePerHourSnapshot;

    if (updates.startTime !== undefined) {
      const parsedStartTime = new Date(updates.startTime);

      if (Number.isNaN(parsedStartTime.getTime())) {
        return res.status(400).json({
          message: 'La fecha del alquiler no es válida',
        });
      }

      updates.startTime = parsedStartTime;
    }

    Object.assign(rental, updates);

    if (needsPriceRecalculation) {
      const {
        numericHours,
        pricePerHourSnapshot,
        amount,
      } = await calculateRentalPrice(nextSpace, nextHours);

      rental.space = nextSpace;
      rental.hours = numericHours;
      rental.pricePerHourSnapshot = pricePerHourSnapshot;
      rental.amount = amount;
    }

    const updatedRental = await rental.save();

    res.json(updatedRental);
  } catch (err) {
    console.error('Error al actualizar alquiler:', err);

    res.status(err.status || 400).json({
      message: err.message,
    });
  }
});

// Eliminar un alquiler
router.delete('/:id', async (req, res) => {
  try {
    const deletedRental = await Rental.findByIdAndDelete(
      req.params.id
    );

    if (!deletedRental) {
      return res.status(404).json({
        message: 'Alquiler no encontrado',
      });
    }

    res.json({
      message: 'Alquiler eliminado',
    });
  } catch (err) {
    console.error('Error al eliminar alquiler:', err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
