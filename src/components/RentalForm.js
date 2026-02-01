// src/components/RentalForm.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { toast } from 'react-toastify';

export default function RentalForm({
  onAddRental,
  onSubmit,
  onSave,
  initialData,
  spaces,
  quick
}) {
  const [formData, setFormData] = useState({
    space: '',
    tenantName: '',
    activityName: '',
    hours: '',
    startTime: '',
    isRecurring: false
  });

  const spacesArray = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        space: initialData.space || '',
        tenantName: initialData.tenantName || '',
        activityName: initialData.activityName || '',
        hours: initialData.hours?.toString?.() || '',
        startTime: initialData.startTime ? initialData.startTime.substring(0, 16) : '',
        isRecurring: Boolean(initialData.isRecurring)
      });
    } else {
      setFormData({
        space: '',
        tenantName: '',
        activityName: '',
        hours: '',
        startTime: '',
        isRecurring: false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitFn = onAddRental || onSubmit || onSave;

    if (!submitFn) {
      console.error('RentalForm: falta handler (onAddRental/onSubmit/onSave)');
      toast.error('Error: el formulario no tiene handler de guardado');
      return;
    }

    const startISO = formData.startTime
      ? new Date(formData.startTime).toISOString()
      : null;

    const payload = {
      ...formData,
      hours: Number(formData.hours),
      startTime: startISO
    };

    await submitFn(payload);

    if (!initialData) {
      setFormData({
        space: '',
        tenantName: '',
        activityName: '',
        hours: '',
        startTime: '',
        isRecurring: false
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6">
        {initialData ? 'Editar Alquiler' : 'Registrar Alquiler'}
      </Typography>

      <FormControl fullWidth required margin="normal">
        <InputLabel>Espacio a alquilar</InputLabel>
        <Select
          name="space"
          value={formData.space}
          onChange={handleChange}
          label="Espacio a alquilar"
        >
          <MenuItem value="">
            <em>Seleccione un espacio</em>
          </MenuItem>

          {spacesArray.map((space) => (
            <MenuItem key={space._id} value={space._id}>
              {space.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Nombre del arrendatario"
        name="tenantName"
        value={formData.tenantName}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Nombre de la actividad"
        name="activityName"
        value={formData.activityName}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Cantidad de horas"
        name="hours"
        type="number"
        value={formData.hours}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        inputProps={{ min: 1 }}
      />

      <TextField
        label="Fecha y hora de inicio"
        name="startTime"
        type="datetime-local"
        value={formData.startTime}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.isRecurring}
            onChange={handleCheckboxChange}
            name="isRecurring"
            color="primary"
          />
        }
        label="Evento recurrente"
      />

      <Button type="submit" variant="contained" color="primary">
        {initialData
          ? (quick ? 'Siguiente' : 'Actualizar Alquiler')
          : (quick ? 'Siguiente' : 'Registrar Alquiler')}
      </Button>
    </Box>
  );
}
