import React, { useState } from "react";
import {
  AppBar, Toolbar, IconButton, Drawer, Box,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 260;

export function ResponsiveShell({ drawerContent, topbarRight, children }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={toggleMobileDrawer}>
                <MenuIcon />
              </IconButton>
            )}
            {/* tu título */}
          </Box>

          {/* botones derecha */}
          {topbarRight}
        </Toolbar>
      </AppBar>

      {/* Drawer MOBILE (overlay) */}
      <Drawer
        variant="temporary"
        open={isMobile ? mobileOpen : false}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer DESKTOP (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* empuja contenido debajo del AppBar */}
        {children}
      </Box>
    </Box>
  );
}
