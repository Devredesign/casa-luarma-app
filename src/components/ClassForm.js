// src/components/ClassForm.js
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

export default function ClassForm({
  initialData,
  onSubmit,
  teachers = [],
  spaces = [],
  modalities = []
}) {
  // ✅ SAFE arrays (evita map/find si viene raro)
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  // Helpers: soporta modalidad como objeto o como string id
  const getModalityId = (m) => {
    if (!m) return '';
    if (typeof m === 'string') return m;
    return m?._id || '';
  };

  const getSpaceId = (s) => {
    if (!s) return '';
    if (typeof s === 'string') return s;
    return s?._id || '';
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    modalityId: getModalityId(initialData?.modality),
    professor: initialData?.professor || '',
    schedule: initialData?.schedule ? initialData.schedule.substring(0, 16) : '',
    spaceId: getSpaceId(initialData?.space),
    isRecurring: Boolean(initialData?.isRecurring)
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData?.title || '',
        modalityId: getModalityId(initialData?.modality),
        professor: initialData?.professor || '',
        schedule: initialData?.schedule ? initialData.schedule.substring(0, 16) : '',
        spaceId: getSpaceId(initialData?.space),
        isRecurring: Boolean(initialData?.isRecurring)
      });
    } else {
      // si cambias de editar -> nuevo
      setFormData({
        title: '',
        modalityId: '',
        professor: '',
        schedule: '',
        spaceId: '',
        isRecurring: false
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

    // ✅ Busca modalidad (SAFE)
    const mod = modalitiesArr.find((m) => String(m._id) === String(formData.modalityId));
    const pricePerSession = Number(mod?.price ?? 0);

    // ✅ Evita crash si schedule vacío
    const scheduleISO = formData.schedule
      ? new Date(formData.schedule).toISOString()
      : null;

    onSubmit({
      title: formData.title,
      modality: formData.modalityId,
      price: pricePerSession,
      professor: formData.professor,
      schedule: scheduleISO,
      space: formData.spaceId,
      isRecurring: formData.isRecurring
    });

    // Limpia solo si es creación (en edición normalmente el padre decide)
    if (!initialData) {
      setFormData({
        title: '',
        modalityId: '',
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

          {modalitiesArr.map((mod) => {
            const price = Number(mod?.price ?? 0);
            return (
              <MenuItem key={mod._id} value={mod._id}>
                {mod?.name || 'Sin nombre'} — ₡{price.toLocaleString()}
              </MenuItem>
            );
          })}
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

          {teachersArr.map((t) => (
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

          {spacesArr.map((s) => {
            const p = Number(s?.pricePerHour ?? 0);
            return (
              <MenuItem key={s._id} value={s._id}>
                {s?.name || 'Sin nombre'} — ₡{p.toLocaleString()}/h
              </MenuItem>
            );
          })}
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
