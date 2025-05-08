// ---------- src/components/StudentForm.js ----------
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const StudentForm = ({ onSave, initialData }) => {
  const data = initialData || {};
  const [form, setForm] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    cedula: data.cedula || ''
  });

  useEffect(() => {
    const init = initialData || {};
    setForm({
      name: init.name || '',
      email: init.email || '',
      phone: init.phone || '',
      cedula: init.cedula || ''
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    if (!initialData) {
      setForm({ name: '', email: '', phone: '', cedula: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialData?._id ? 'Editar Estudiante' : 'Registrar Estudiante'}
      </Typography>
      <TextField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth required margin="normal"
      />
      <TextField
        label="Cédula"
        name="cedula"
        value={form.cedula}
        onChange={handleChange}
        fullWidth required margin="normal"
      />
      <TextField
        label="Correo"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth required margin="normal"
      />
      <TextField
        label="Teléfono"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        fullWidth margin="normal"
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Guardar Estudiante
      </Button>
    </Box>
  );
};

export default StudentForm;