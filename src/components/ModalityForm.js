// src/components/ModalityForm.js
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function ModalityForm({ onSubmit, initial }) {
  const [form, setForm] = useState({ name: '', price: '', teacherPay: ''});

  useEffect(() => {
    if (initial) setForm({ name: initial.name, price: initial.price, teacherPay: initial?.teacherPay });
  }, [initial]);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = e => {
    e.preventDefault();
    onSubmit({ name: form.name, price: Number(form.price), teacherPay:Number(form.teacherPay) });
    if (!initial) setForm({ name: '', price: '', teacherPay: ''});
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mt:2 }}>
      <Typography variant="h6">{initial ? 'Editar Modalidad' : 'Nueva Modalidad'}</Typography>
      <TextField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handle}
        fullWidth required margin="normal"
      />
      <TextField
        label="Precio por sesión"
        name="price"
        type="number"
        value={form.price}
        onChange={handle}
        fullWidth required margin="normal"
      />
      <TextField
        label="Pago al profesor por sesión"
        name="teacherPay"
        type="number"
        value={form.teacherPay}
        onChange={handle}
        fullWidth
        required
        margin="normal"
        />
      <Button type="submit" variant="contained" sx={{ mt:1 }}>
        {initial ? 'Actualizar' : 'Agregar'}
      </Button>
    </Box>
  );
}
