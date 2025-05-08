// src/components/PaymentForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function PaymentForm({ classesList = [], students = [], onSubmit }) {
  const [form, setForm] = useState({
    classId:   '',
    studentId: '',
    date:      '',
    method:    '',
    sessions:  1
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Busca la clase seleccionada para calcular el monto
    const cls = classesList.find(c => c._id === form.classId);
    const pricePerSession = cls?.modality?.price || 0;
    const amount = pricePerSession * Number(form.sessions);

    // Construye el payload final
    onSubmit({
      classId:   form.classId,
      studentId: form.studentId,
      date:      form.date,
      method:    form.method,
      sessions:  Number(form.sessions),
      amount
    });

    // Resetea el formulario
    setForm({
      classId:   '',
      studentId: '',
      date:      '',
      method:    '',
      sessions:  1
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <FormControl fullWidth required margin="normal">
        <InputLabel>Clase</InputLabel>
        <Select
          name="classId"
          value={form.classId}
          onChange={handleChange}
          label="Clase"
        >
          <MenuItem value="">
            <em>Seleccione clase</em>
          </MenuItem>
          {classesList.map(c => {
       // Ahora mostramos c.modality.price en lugar de c.price
       const price = typeof c.modality?.price === 'number'
         ? c.modality.price
         : 0;
         return (
           <MenuItem key={c._id} value={c._id}>
             {c.title} — ₡{price.toLocaleString()}
           </MenuItem>
         );
       })}
        </Select>
      </FormControl>

      <TextField
        label="Número de Clases"
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
        <Select
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          label="Estudiante"
        >
          <MenuItem value="">
            <em>Seleccione estudiante</em>
          </MenuItem>
          {students.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.name} ({s.cedula})
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
        <Select
          name="method"
          value={form.method}
          onChange={handleChange}
          label="Método"
        >
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

