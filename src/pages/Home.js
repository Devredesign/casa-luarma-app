// src/components/Home.js
import React from 'react';
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar
  
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatLilo from '../components/ChatLilo';

export default function Home({ onLoginClick, onQuickAction }) {
  useEffect(() => console.log('[Home] ChatLilo montado'), []);
  return (
    <Box>
      {/* HERO con CTA de Log In */}
      <Box
        sx={{
          height: { xs: 600, md: 500 },
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
          <Typography variant="h2" sx={{ mt: 2 }} gutterBottom>
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
        {/* Sección del Asistente Lilo */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Chatea con Lilo
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Avatar
            src="/lilo-avatar.jpg"  // Coloca aquí la ruta de la foto de Lilo
            alt="Lilo"
            sx={{ width: 80, height: 80 }}
          />
          <Typography variant="h6">
            ¡Hola! Soy Lilo, tu asistente virtual de Casa Luarma.
          </Typography>
        </Box>
        <ChatLilo />
      </Box>
      {/* Acordeón explicativo */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
         
            <Typography variant="h6">¿Cómo usar la aplicación?</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography paragraph>
              1. Regístrate o inicia sesión.<br/>
              2. Gestiona tus espacios, clases y pagos desde el Dashboard.<br/>
              3. Conecta tu Google Calendar para ver tus eventos.<br/>
              4. Usa el botón de “Acciones Rápidas” para matricular, alquilar o pagar en un clic.
            </Typography>
            <Typography paragraph>
              Explora los distintos módulos: Espacios, Clases, Alquileres, Pagos, Estudiantes y Profesores.
            </Typography>
            </Box>
         </Box> 
      
        
        
       
      </Container>
    </Box>
  );
}