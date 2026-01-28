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

// ✅ Celeste exacto solicitado
const SIDEBAR_HEADER_BG = '#1976d3';
const SIDEBAR_HEADER_TEXT = '#FFFFFF';

export default function AdminDashboardDesktopWithSidebar({
  logoSrc,
  tabIndex,
  setTabIndex,
  onQuickAction,
  children,
  contentMaxWidth = 1400,
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
            overflowX: 'hidden',
            borderRight: '1px solid rgba(0,0,0,0.08)',
          }
        }}
      >
        {/* ✅ HEADER celeste con letras blancas */}
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

        {/* ✅ Menú */}
        <List sx={{ pt: 1 }}>
          {items.map((it) => (
            <Tooltip key={it.label} title={collapsed ? it.label : ''} placement="right">
              <ListItemButton
                selected={tabIndex === it.index}
                onClick={() => setTabIndex(it.index)}
                sx={{
                  py: 1.2,
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 211, 0.12)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(25, 118, 211, 0.18)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 'auto' : 40,
                    color: tabIndex === it.index ? '#1976d3' : 'rgba(0,0,0,0.65)',
                    justifyContent: 'center',
                  }}
                >
                  {it.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{
                      fontWeight: tabIndex === it.index ? 700 : 600,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* ✅ Footer del sidebar */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Tooltip title={collapsed ? 'Acción rápida' : ''} placement="right">
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onQuickAction}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
              }}
            >
              {!collapsed && 'Acción rápida'}
            </Button>
          </Tooltip>
        </Box>
      </Drawer>

      {/* ✅ Contenido */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ maxWidth: contentMaxWidth, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
