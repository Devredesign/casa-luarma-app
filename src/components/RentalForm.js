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

  // ✅ calcular monto en vivo
  const selectedSpace = useMemo(
    () => spacesArray.find(s => s._id === formData.space) || null,
    [spacesArray, formData.space]
  );

  const hoursNum = useMemo(() => {
    const n = Number(formData.hours);
    return Number.isFinite(n) ? n : 0;
  }, [formData.hours]);

  const pricePerHour = useMemo(() => {
    // Por si tu modelo usa otro nombre (price, hourlyRate, etc.)
    const raw =
      selectedSpace?.pricePerHour ??
      selectedSpace?.pricePerhour ??
      selectedSpace?.hourlyRate ??
      selectedSpace?.price ??
      0;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [selectedSpace]);

  const computedAmount = useMemo(() => {
    if (!pricePerHour || !hoursNum) return 0;
    return Math.round(pricePerHour * hoursNum);
  }, [pricePerHour, hoursNum]);

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

    if (!formData.space) {
      toast.error('Seleccioná un espacio');
      return;
    }

    if (!hoursNum || hoursNum <= 0) {
      toast.error('Horas debe ser mayor a 0');
      return;
    }

    if (!formData.startTime) {
      toast.error('Seleccioná fecha y hora de inicio');
      return;
    }

    const startISO = new Date(formData.startTime).toISOString();

    const payload = {
      space: formData.space,
      tenantName: formData.tenantName,
      activityName: formData.activityName,
      hours: hoursNum,
      startTime: startISO,
      isRecurring: formData.isRecurring,

      // ✅ ENVIAMOS amount ya calculado
      amount: computedAmount
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
        inputProps={{ min: 1, step: 0.5 }}
      />

      {/* ✅ Monto calculado visible */}
      <TextField
        label="Monto (calculado)"
        value={`₡${Number(computedAmount || 0).toLocaleString()}`}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
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
