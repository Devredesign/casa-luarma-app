// src/components/AdminDashboardMobile.jsx
import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function AdminDashboardMobile({
  logoSrc,
  tabIndex,
  setTabIndex,
  onQuickAction,
  children
}) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          {logoSrc && (
            <Box component="img" src={logoSrc} alt="Casa Luarma" sx={{ height: 28 }} />
          )}
          <Typography sx={{ flex: 1 }} fontWeight={800}>
            Admin
          </Typography>
          <IconButton color="inherit" onClick={onQuickAction} aria-label="Acción rápida">
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {children}
      </Box>

      <BottomNavigation
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        showLabels
      >
        <BottomNavigationAction label="Matrícula" icon={<SchoolIcon />} />
        <BottomNavigationAction label="Alquileres" icon={<MeetingRoomIcon />} />
        <BottomNavigationAction label="Finanzas" icon={<AttachMoneyIcon />} />
      </BottomNavigation>
    </Box>
  );
}
