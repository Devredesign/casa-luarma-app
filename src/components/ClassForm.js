// src/components/ClassForm.js
import React, { useState, useEffect } from 'react';
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

export default function ClassForm({
  initialData,
  onSubmit,
  teachers = [],
  spaces = []
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    professor: initialData?.professor || '',
    schedule: initialData?.schedule ? initialData.schedule.substring(0, 16) : '',
    spaceId:
      (typeof initialData?.space === 'object' ? initialData?.space?._id : initialData?.space) || '',
    isRecurring: initialData?.isRecurring || false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        professor: initialData.professor || '',
        schedule: initialData.schedule ? initialData.schedule.substring(0, 16) : '',
        spaceId:
          (typeof initialData.space === 'object' ? initialData.space?._id : initialData.space) || '',
        isRecurring: Boolean(initialData.isRecurring)
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((fd) => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      title: formData.title,
      professor: formData.professor,
      schedule: new Date(formData.schedule).toISOString(),
      space: formData.spaceId,
      isRecurring: formData.isRecurring
    });

    // reset (solo si NO estás editando)
    if (!initialData) {
      setFormData({
        title: '',
        professor: '',
        schedule: '',
        spaceId: '',
        isRecurring: false
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6">
        {initialData ? 'Editar Clase' : 'Registrar Nueva Clase'}
      </Typography>

      <TextField
        label="Nombre del curso"
        name="title"
        value={formData.title}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <FormControl fullWidth required margin="normal">
        <InputLabel>Profesor</InputLabel>
        <Select
          name="professor"
          value={formData.professor}
          onChange={handleChange}
          label="Profesor"
        >
          <MenuItem value="">
            <em>Seleccione profesor</em>
          </MenuItem>
          {teachers.map((t) => (
            <MenuItem key={t._id} value={t.name}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required margin="normal">
        <InputLabel>Espacio</InputLabel>
        <Select
          name="spaceId"
          value={formData.spaceId}
          onChange={handleChange}
          label="Espacio"
        >
          <MenuItem value="">
            <em>Seleccione espacio</em>
          </MenuItem>
          {spaces.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.name} — ₡{Number(s.pricePerHour || 0).toLocaleString()}/h
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Horario"
        name="schedule"
        type="datetime-local"
        value={formData.schedule}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <FormControlLabel
        control={
          <Checkbox
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
          />
        }
        label="Recurrente (evento semanal)"
      />

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {initialData ? 'Actualizar Clase' : 'Guardar Clase'}
      </Button>
    </Box>
  );
}
