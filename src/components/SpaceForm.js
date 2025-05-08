// src/components/SpaceForm.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SpaceForm = ({ onAddSpace }) => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerHour: '',
    squareMeters: '',
    description: '',
    color: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSpace(formData);
    setFormData({
      name: '',
      pricePerHour: '',
      squareMeters: '',
      description: '',
      color: ''
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Registrar un Espacio
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
          {/* Agrega más opciones si lo deseas */}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Guardar Espacio
      </Button>
    </Box>
  );
};

export default SpaceForm;
