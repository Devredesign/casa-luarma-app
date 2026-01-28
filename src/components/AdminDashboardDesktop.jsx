// AdminDashboardDesktopWithSidebar.jsx (idea)
import React, { useState } from "react";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Typography, Divider
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SchoolIcon from "@mui/icons-material/School";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const drawerWidth = 260;
const miniWidth = 72;

export default function AdminDashboardDesktopWithSidebar({
  logoSrc,
  tabIndex,
  setTabIndex,
  children
}) {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: "Matrícula", icon: <SchoolIcon />, index: 0 },
    { label: "Alquileres", icon: <MeetingRoomIcon />, index: 1 },
    { label: "Finanzas", icon: <AttachMoneyIcon />, index: 2 },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? miniWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? miniWidth : drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden"
          },
        }}
      >
        {/* Header con logo */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {logoSrc && (
            <Box component="img" src={logoSrc} alt="Casa Luarma" sx={{ height: 36 }} />
          )}
          {!collapsed && (
            <Typography fontWeight={700}>Casa Luarma</Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={() => setCollapsed(v => !v)}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <Divider />

        {/* Menú */}
        <List>
          {items.map((it) => (
            <ListItemButton
              key={it.label}
              selected={tabIndex === it.index}
              onClick={() => setTabIndex(it.index)}
              sx={{ py: 1.2 }}
            >
              <ListItemIcon>{it.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={it.label} />}
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Contenido */}
      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
