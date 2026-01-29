// src/components/PaymentForm.js
import React, { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';

export default function PaymentForm({ classesList = [], students = [], modalities = [], onSubmit }) {
  const [form, setForm] = useState({
    classId: '',
    modalityId: '',
    studentId: '',
    date: '',
    method: '',
    sessions: 1
  });

  const safeClasses = useMemo(() => (Array.isArray(classesList) ? classesList : []), [classesList]);
  const safeStudents = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const safeModalities = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  const selectedMod = useMemo(() => {
    return safeModalities.find(m => String(m._id) === String(form.modalityId));
  }, [safeModalities, form.modalityId]);

  const previewAmount = useMemo(() => {
    const price = Number(selectedMod?.price || 0);
    const sessions = Number(form.sessions || 1);
    return price * sessions;
  }, [selectedMod, form.sessions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const price = Number(selectedMod?.price || 0);
    const amount = price * Number(form.sessions || 1);

    onSubmit({
      classId: form.classId,
      modalityId: form.modalityId,
      studentId: form.studentId,
      date: form.date,
      method: form.method,
      sessions: Number(form.sessions || 1),
      amount
    });

    setForm({
      classId: '',
      modalityId: '',
      studentId: '',
      date: '',
      method: '',
      sessions: 1
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <FormControl fullWidth required margin="normal">
        <InputLabel>Clase</InputLabel>
        <Select name="classId" value={form.classId} onChange={handleChange} label="Clase">
          <MenuItem value="">
            <em>Seleccione clase</em>
          </MenuItem>
          {safeClasses.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ✅ Modalidad ahora se elige aquí */}
      <FormControl fullWidth required margin="normal">
        <InputLabel>Modalidad (para este pago)</InputLabel>
        <Select
          name="modalityId"
          value={form.modalityId}
          onChange={handleChange}
          label="Modalidad (para este pago)"
        >
          <MenuItem value="">
            <em>Seleccione modalidad</em>
          </MenuItem>
          {safeModalities.map(m => (
            <MenuItem key={m._id} value={m._id}>
              {m.name} — ₡{Number(m.price || 0).toLocaleString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Número de sesiones"
        name="sessions"
        type="number"
        value={form.sessions}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputProps={{ inputProps: { min: 1 } }}
      />

      <FormControl fullWidth required margin="normal">
        <InputLabel>Estudiante</InputLabel>
        <Select name="studentId" value={form.studentId} onChange={handleChange} label="Estudiante">
          <MenuItem value="">
            <em>Seleccione estudiante</em>
          </MenuItem>
          {safeStudents.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.name} {s.cedula ? `(${s.cedula})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Fecha de pago"
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <FormControl fullWidth required margin="normal">
        <InputLabel>Método</InputLabel>
        <Select name="method" value={form.method} onChange={handleChange} label="Método">
          <MenuItem value="Efectivo">Efectivo</MenuItem>
          <MenuItem value="SINPE Móvil">SINPE Móvil</MenuItem>
          <MenuItem value="Transferencia">Transferencia</MenuItem>
        </Select>
      </FormControl>

      <Typography sx={{ mt: 1, opacity: 0.8 }}>
        Monto estimado: <b>₡{Number(previewAmount || 0).toLocaleString()}</b>
      </Typography>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Registrar Pago
      </Button>
    </Box>
  );
}
