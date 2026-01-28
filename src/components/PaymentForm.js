// src/components/PaymentForm.js
import React, { useMemo, useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

export default function PaymentForm({ classesList = [], students = [], modalities = [], onSubmit }) {
  const [form, setForm] = useState({
    classId: '',
    studentId: '',
    modalityId: '',
    date: '',
    method: '',
    sessions: 1
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const selectedModality = useMemo(
    () => modalities.find(m => m._id === form.modalityId),
    [modalities, form.modalityId]
  );

  const sessionsNum = Math.max(1, Number(form.sessions || 1));
  const previewAmount = (Number(selectedModality?.price || 0) * sessionsNum);

  const handleSubmit = e => {
    e.preventDefault();

    onSubmit({
      classId: form.classId,
      studentId: form.studentId,
      modalityId: form.modalityId,
      date: form.date,
      method: form.method,
      sessions: sessionsNum
      // ✅ NO mandamos amount: backend lo calcula
    });

    setForm({ classId:'', studentId:'', modalityId:'', date:'', method:'', sessions: 1 });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <FormControl fullWidth required margin="normal">
        <InputLabel>Clase</InputLabel>
        <Select name="classId" value={form.classId} onChange={handleChange} label="Clase">
          <MenuItem value=""><em>Seleccione clase</em></MenuItem>
          {classesList.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required margin="normal">
        <InputLabel>Modalidad (del pago)</InputLabel>
        <Select name="modalityId" value={form.modalityId} onChange={handleChange} label="Modalidad (del pago)">
          <MenuItem value=""><em>Seleccione modalidad</em></MenuItem>
          {modalities.map(m => (
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

      {form.modalityId && (
        <Typography sx={{ mt: 1 }}>
          Monto estimado: <b>₡{Number(previewAmount || 0).toLocaleString()}</b>
        </Typography>
      )}

      <FormControl fullWidth required margin="normal">
        <InputLabel>Estudiante</InputLabel>
        <Select name="studentId" value={form.studentId} onChange={handleChange} label="Estudiante">
          <MenuItem value=""><em>Seleccione estudiante</em></MenuItem>
          {students.map(s => (
            <MenuItem key={s._id} value={s._id}>{s.name} ({s.cedula})</MenuItem>
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
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Registrar Pago
      </Button>
    </Box>
  );
}
