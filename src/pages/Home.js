// src/components/Home.js
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import ChatLilo from '../components/ChatLilo';
export default function Home({ onLoginClick, onQuickAction }) {
  return (
    <Box>
      {/* HERO con CTA de Log In */}
      <Box
        sx={{
          height: { xs: 300, md: 500 },
          background: 'url(/hero-bg.jpg) center/cover no-repeat',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'common.white',
          textAlign: 'center',
          px: 2
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.6)'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" gutterBottom>
            Bienvenidos a Casa Luarma
          </Typography>
          <Typography variant="h5" gutterBottom>
            Espacios y clases de música y danza para que vivas la experiencia.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={onLoginClick}
            sx={{ mt: 3, px: 4 }} 
            href="/login"
          >
            Log In
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {/* Acordeón explicativo */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">¿Cómo usar la aplicación?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              1. Regístrate o inicia sesión.<br/>
              2. Gestiona tus espacios, clases y pagos desde el Dashboard.<br/>
              3. Conecta tu Google Calendar para ver tus eventos.<br/>
              4. Usa el botón de “Acciones Rápidas” para matricular, alquilar o pagar en un clic.
            </Typography>
            <Typography paragraph>
              Explora los distintos módulos: Espacios, Clases, Alquileres, Pagos, Estudiantes y Profesores.
              Cada uno tiene su propio asistente y listado para CRUD rápido.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Sección de Lilo Asistente 
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Hablá con Lilo, tu asistente
        </Typography>
        <ChatLilo />   
      </Container> 
      */}
       
      </Container>
    </Box>
  );
}