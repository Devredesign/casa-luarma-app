// src/components/SpaceForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function SpaceForm({ onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    pricePerHour: '',
    squareMeters: '',
    description: '',
    color: ''
  });

  // Sync for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        pricePerHour: initialData.pricePerHour?.toString() || '',
        squareMeters: initialData.squareMeters?.toString() || '',
        description: initialData.description || '',
        color: initialData.color?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        pricePerHour: '',
        squareMeters: '',
        description: '',
        color: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      pricePerHour: Number(formData.pricePerHour),
      squareMeters: Number(formData.squareMeters)
    };

    if (typeof onSave !== 'function') {
      console.warn('[SpaceForm] onSave no es función:', onSave);
      return;
    }

    onSave(payload);

    // solo limpiar si es “crear”
    if (!initialData) {
      setFormData({
        name: '',
        pricePerHour: '',
        squareMeters: '',
        description: '',
        color: ''
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Espacio' : 'Registrar un Espacio'}
      </Typography>

      <TextField
        label="Nombre del Espacio"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Precio por Hora"
        name="pricePerHour"
        type="number"
        value={formData.pricePerHour}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Metros Cuadrados"
        name="squareMeters"
        type="number"
        value={formData.squareMeters}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth required margin="normal">
        <InputLabel>Color</InputLabel>
        <Select
          name="color"
          value={formData.color}
          onChange={handleChange}
          label="Color"
        >
          <MenuItem value="">
            <em>Seleccione un color</em>
          </MenuItem>
          <MenuItem value="9">Azul</MenuItem>
          <MenuItem value="10">Verde</MenuItem>
          <MenuItem value="11">Rojo</MenuItem>
          <MenuItem value="6">Naranja</MenuItem>
          <MenuItem value="3">Morado</MenuItem>
          <MenuItem value="5">Amarillo</MenuItem>
        </Select>
      </FormControl>

      <Button type="submit" variant="contained">
        {initialData ? 'Actualizar Espacio' : 'Guardar Espacio'}
      </Button>
    </Box>
  );
}
