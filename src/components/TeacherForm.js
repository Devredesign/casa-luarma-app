// src/components/TeacherForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const TeacherForm = ({ onAddTeacher = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    availability: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTeacher(formData);
    setFormData({ name: '', email: '', phone: '', specialty: '', availability: '' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6">Registrar un Profesor</Typography>
      <TextField label="Nombre" name="name" value={formData.name} onChange={handleChange} fullWidth required margin="normal" />
      <TextField label="Correo" name="email" value={formData.email} onChange={handleChange} fullWidth required margin="normal" />
      <TextField label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} fullWidth required margin="normal" />
      <TextField label="Especialidad" name="specialty" value={formData.specialty} onChange={handleChange} fullWidth required margin="normal" />
      <TextField label="Disponibilidad" name="availability" value={formData.availability} onChange={handleChange} fullWidth required margin="normal" />
      <Button type="submit" variant="contained" color="primary">Guardar Profesor</Button>
    </Box>
  );
};

export default TeacherForm;

