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
    spaces    = [],
    modalities = []
  }) {
  const [formData, setFormData] = useState({
    title:       initialData?.title || '',
    modalityId:  initialData?.modality?._id || '',
    professor:   initialData?.professor || '',
    schedule:    initialData?.schedule ? initialData.schedule.substring(0,16) : '',
    spaceId:     initialData?.space || '',
    isRecurring: initialData?.isRecurring || false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title:       initialData.title,
        modalityId:  initialData.modality?._id || '',
        professor:   initialData.professor,
        schedule:    initialData.schedule.substring(0,16),
        spaceId:     initialData.space || '',
        isRecurring: initialData.isRecurring || false
      });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Busca la modalidad seleccionada para obtener su precio
    const mod = modalities.find(m => m._id === formData.modalityId);
    const pricePerSession = mod ? mod.price : 0;

    onSubmit({
      title:       formData.title,
      modality:    formData.modalityId,
      price:       pricePerSession,
      professor:   formData.professor,
      schedule:    new Date(formData.schedule).toISOString(),
      space:       formData.spaceId,
      isRecurring: formData.isRecurring
    });

    // Limpia el formulario
    setFormData({
      title:       '',
      modalityId:  '',
      professor:   '',
      schedule:    '',
      spaceId:     '',
      isRecurring: false
    });
  };
  console.log('modalities en ClassForm:', modalities);

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
        <InputLabel>Modalidad</InputLabel>
        <Select
          name="modalityId"
          value={formData.modalityId}
          onChange={handleChange}
          label="Modalidad"
        >
          <MenuItem value="">
            <em>Seleccione modalidad</em>
          </MenuItem>
          {modalities.map(mod => (
            <MenuItem key={mod._id} value={mod._id}>
              {mod.name} — ₡{mod.price.toLocaleString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          {teachers.map(t => (
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
          {spaces.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.name} — ₡{s.pricePerHour.toLocaleString()}/h
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

