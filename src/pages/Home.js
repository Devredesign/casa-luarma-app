// src/components/Home.js
import React from 'react';
import { Container, Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Sección Hero */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Bienvenidos a Casa Luarma
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Espacios y clases de música y danza para que vivas la experiencia.
        </Typography>
        <Button variant="contained" size="large" color="primary">
          Conoce Más
        </Button>
      </Box>

      {/* Sección de Información */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Nuestros Espacios
              </Typography>
              <Typography variant="body1">
                Contamos con seis espacios diferentes para alquilar o para impartir clases, ya sea de música o danza. Todos ellos están diseñados para adaptarse a tus necesidades y brindar el ambiente perfecto para tus eventos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Clases y Eventos
              </Typography>
              <Typography variant="body1">
                Ofrecemos una amplia variedad de clases, desde lecciones individuales hasta grupales. También puedes reservar nuestros espacios para eventos especiales. Nuestro sistema de gestión optimizado te permitirá coordinar horarios y pagos de manera sencilla.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Contacto o Llamado a la Acción */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          ¿Listo para comenzar?
        </Typography>
        <Button variant="contained" size="large" color="secondary">
          Contáctanos
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
