// src/components/AdminDashboardDesktopWithSidebar.jsx
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const drawerWidth = 260;
const miniWidth = 72;

const SIDEBAR_HEADER_BG = '#1976d3';
const SIDEBAR_HEADER_TEXT = '#FFFFFF';

export default function AdminDashboardDesktopWithSidebar({
  logoSrc,
  tabIndex,
  setTabIndex,
  children,
  contentMaxWidth = 1400,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: 'Overview', icon: <DashboardIcon />, index: 0 },
    { label: 'Matrícula', icon: <SchoolIcon />, index: 1 },
    { label: 'Alquileres', icon: <MeetingRoomIcon />, index: 2 },
    { label: 'Finanzas', icon: <AttachMoneyIcon />, index: 3 },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? miniWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? miniWidth : drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }
        }}
      >
        {/* Header celeste + logo blanco */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: SIDEBAR_HEADER_BG,
            color: SIDEBAR_HEADER_TEXT,
          }}
        >
          {logoSrc && (
            <Box
              component="img"
              src={logoSrc}
              alt="Casa Luarma"
              sx={{ height: 34, width: 'auto' }}
            />
          )}

          {!collapsed && (
            <Typography fontWeight={800} sx={{ color: SIDEBAR_HEADER_TEXT }}>
              Casa Luarma
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          <IconButton
            onClick={() => setCollapsed(v => !v)}
            sx={{ color: SIDEBAR_HEADER_TEXT }}
            aria-label="Colapsar barra lateral"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          {items.map((it) => (
            <Tooltip key={it.label} title={collapsed ? it.label : ''} placement="right">
              <ListItemButton
                selected={tabIndex === it.index}
                onClick={() => setTabIndex(it.index)}
                sx={{ py: 1.2 }}
              >
                <ListItemIcon>{it.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={it.label} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Drawer>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ maxWidth: contentMaxWidth, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
