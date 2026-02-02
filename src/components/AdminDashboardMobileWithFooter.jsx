// src/components/AdminDashboardMobileWithFooter.jsx
import React from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function AdminDashboardMobileWithFooter({
  logoSrc,
  tabIndex,
  setTabIndex,
  children,
}) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header simple */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#1976d3',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {logoSrc && (
          <Box component="img" src={logoSrc} alt="Casa Luarma" sx={{ height: 28, width: 'auto' }} />
        )}
      </Box>

      {/* Content (dejamos espacio para footer sticky) */}
      <Box sx={{ p: 2, pb: 10 }}>
        {children}
      </Box>

      {/* Sticky footer */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        <BottomNavigation
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          showLabels
        >
          <BottomNavigationAction label="Overview" icon={<DashboardIcon />} value={0} />
          <BottomNavigationAction label="Matrícula" icon={<SchoolIcon />} value={1} />
          <BottomNavigationAction label="Alquileres" icon={<MeetingRoomIcon />} value={2} />
          <BottomNavigationAction label="Finanzas" icon={<AttachMoneyIcon />} value={3} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
