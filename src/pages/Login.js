// src/components/Login.js
import React, { useState, useContext } from 'react';
import { Container, Paper, Grid, TextField, Button, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Definición de credenciales estáticas para el admin (para desarrollo)
const adminCredentials = {
  email: 'admin@casaluarma.com',
  password: '1234'
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que los campos estén completos
    if (!formData.email || !formData.password) {
      toast.error('Por favor, complete todos los campos.');
      return;
    }

    // Comparar las credenciales ingresadas con las definidas para el administrador
    if (
      formData.email === adminCredentials.email &&
      formData.password === adminCredentials.password
    ) {
      // Si las credenciales son correctas, se "inicia sesión" (simulado)
      // Aquí se llama a la función login del AuthContext para establecer el usuario
      login({ email: formData.email, role: 'admin' });
      toast.success('Inicio de sesión exitoso');
      navigate('/admin'); // Redirige al dashboard del admin
    } else {
      toast.error('Credenciales inválidas');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Ingresar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
