// src/components/CostForm.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const CostForm = ({ onSubmit, initial }) => {
  const [form, setForm] = useState({
    name:        initial?.name || '',
    amount:      initial?.amount || 0,
    type:        initial?.type || 'fixed',
    recurrence:  initial?.recurrence || 'monthly',
    dateIncurred: initial?.dateIncurred
      ? initial.dateIncurred.slice(0,10)
      : new Date().toISOString().slice(0,10)
  });

  // Sólo actualizamos por completo cuando cambia `initial`
  useEffect(() => {
    if (initial) {
      setForm({
        name:        initial.name,
        amount:      initial.amount,
        type:        initial.type,
        recurrence:  initial.recurrence || 'monthly',
        dateIncurred: initial.dateIncurred.slice(0,10)
      });
    }
  }, [initial]);

  const handle = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // Si cambio el tipo, ajusto la recurrencia
      if (name === 'type') {
        if (value === 'variable') next.recurrence = null;
        if (value === 'fixed')    next.recurrence = 'monthly';
      }
      return next;
    });
  };

  const submit = e => {
    e.preventDefault();
    onSubmit({
      name:       form.name,
      amount:     Number(form.amount),
      type:       form.type,
      recurrence: form.recurrence,
      dateIncurred: new Date(form.dateIncurred)
    });
    // Si no estoy editando, limpio el formulario
    if (!initial) {
      setForm({
        name:        '',
        amount:      0,
        type:        'fixed',
        recurrence:  'monthly',
        dateIncurred: new Date().toISOString().slice(0,10)
      });
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
      <Typography variant="h6">
        {initial ? 'Editar Costo' : 'Nuevo Costo'}
      </Typography>

      <TextField
        label="Descripción"
        name="name"
        value={form.name}
        onChange={handle}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Monto ₡"
        name="amount"
        type="number"
        value={form.amount}
        onChange={handle}
        fullWidth
        required
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo</InputLabel>
        <Select
          name="type"
          value={form.type}
          onChange={handle}
          label="Tipo"
        >
          <MenuItem value="fixed">Fijo</MenuItem>
          <MenuItem value="variable">Variable</MenuItem>
        </Select>
      </FormControl>

      {form.type === 'fixed' && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Recurrencia</InputLabel>
          <Select
            name="recurrence"
            value={form.recurrence}
            onChange={handle}
            label="Recurrencia"
          >
            <MenuItem value="monthly">Mensual</MenuItem>
          </Select>
        </FormControl>
      )}

      {form.type === 'variable' && (
        <TextField
          label="Fecha de gasto"
          name="dateIncurred"
          type="date"
          value={form.dateIncurred}
          onChange={handle}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      )}

      <Button type="submit" variant="contained" sx={{ mt:1 }}>
        {initial ? 'Actualizar' : 'Agregar'}
      </Button>
    </Box>
  );
};

export default CostForm;

