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
  Tooltip,
  Button
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 260;
const miniWidth = 72;

export default function AdminDashboardDesktopWithSidebar({
  logoSrc,
  tabIndex,
  setTabIndex,
  onQuickAction,
  children
}) {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: 'Matrícula', icon: <SchoolIcon />, index: 0 },
    { label: 'Alquileres', icon: <MeetingRoomIcon />, index: 1 },
    { label: 'Finanzas', icon: <AttachMoneyIcon />, index: 2 },
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
            overflowX: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {logoSrc && (
            <Box
              component="img"
              src={logoSrc}
              alt="Casa Luarma"
              sx={{ height: 36, width: 'auto' }}
            />
          )}
          {!collapsed && <Typography fontWeight={800}>Casa Luarma</Typography>}
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={() => setCollapsed(v => !v)}>
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

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Tooltip title={collapsed ? 'Acción rápida' : ''} placement="right">
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onQuickAction}
              sx={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              {!collapsed && 'Acción rápida'}
            </Button>
          </Tooltip>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
