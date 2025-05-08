// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Función para abrir/cerrar el Drawer
  const toggleDrawer = (open) => (event) => {
    // Permitir teclas Tab y Shift sin cerrar el menú
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Opciones del menú
  const menuItems = [
    { text: 'Inicio', path: '/' },
    { text: 'Login', path: '/login' },
    { text: 'Dashboard', path: '/dashboard' },
    // Agrega más rutas según necesites
  ];

  // Función que retorna el contenido del Drawer con un botón de cierre y divisores
  const list = () => (
    <Box
      sx={{ width: 300 }}
      role="presentation"
      // Se cierra el Drawer al hacer clic en cualquier parte del contenido
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {/* Sección del header del Drawer con el botón "Cerrar" */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem button component={Link} to={item.path}>
              <ListItemText primary={item.text} sx={{ color: 'black' }} />
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ color: 'black',backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo a la izquierda */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/logo.png" alt="Casa Luarma" style={{ height: 80, marginRight: 8 }} />
            <Typography variant="h6" component="div">
              Casa Luarma
            </Typography>
          </Box>
          {/* Botón de menú (hamburguesa) a la derecha */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Drawer anclado a la derecha con estilos personalizados */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: '#f5f5f5',
           
          }
        }}
      >
        {list()}
      </Drawer>
    </>
  );
};

export default Navbar;
