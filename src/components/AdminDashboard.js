// src/components/AdminDashboard.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";

import SchoolIcon from "@mui/icons-material/School";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PaidIcon from "@mui/icons-material/Paid";

import QuickActionDialog from "./QuickActionDialog";
import StudentsManager from "./StudentsManager";
import ClassesManager from "./ClassesManager";
import ModalitiesManager from "./ModalitiesManager";
import TeacherManager from "./TeacherManager";
import PaymentManager from "./PaymentManager";
import RentalManager from "./RentalManager";
import SpacesManager from "./SpacesManager";
import FinancialSummary from "./FinancialSummary";
import TeacherPayouts from "./TeacherPayouts";
import CostsManager from "./CostsManager";
import CalendarView from "./CalendarView";

import api from "../services/api";
import { toast } from "react-toastify";
import { getCalendarAccessToken, clearCalendarToken } from "../services/calendarAuth";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_MINI = 76;

export default function AdminDashboardPro() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // -------------------- Estado global --------------------
  const [teachers, setTeachers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [costs, setCosts] = useState([]);
  const [financeRefresh, setFinanceRefresh] = useState(0);

  const [calendarToken, setCalendarToken] = useState(null);
  const [refreshCal, setRefreshCal] = useState(false);

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);

  // navegación (en vez de Tabs, más estilo app)
  const [section, setSection] = useState("matricula"); // matricula | alquileres | finanzas

  // -------------------- SAFE arrays --------------------
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  // -------------------- Callbacks estables --------------------
  const handleClassesUpdate = useCallback((cls) => {
    setClasses(Array.isArray(cls) ? cls : []);
    setFinanceRefresh((f) => f + 1);
  }, []);

  const handlePaymentsUpdate = useCallback((p) => {
    setPayments(Array.isArray(p) ? p : []);
    setFinanceRefresh((f) => f + 1);
  }, []);

  const handleRentalsUpdate = useCallback((r) => {
    setRentals(Array.isArray(r) ? r : []);
    setFinanceRefresh((f) => f + 1);
  }, []);

  const handleCostsUpdate = useCallback((c) => {
    setCosts(Array.isArray(c) ? c : []);
  }, []);

  const onCalendarChange = useCallback(() => setRefreshCal((f) => !f), []);

  // -------------------- Carga maestra (1 sola vez) --------------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // ⚠️ Importante: esto NO depende de ningún state => NO loop
        const [
          tRes,
          sRes,
          stRes,
          cRes,
          rRes,
          mRes,
          coRes,
        ] = await Promise.all([
          api.get("/teachers"),
          api.get("/spaces"),
          api.get("/students"),
          api.get("/classes"),
          api.get("/rentals"),
          api.get("/modalities"),
          api.get("/costs"),
        ]);

        if (!alive) return;

        setTeachers(Array.isArray(tRes.data) ? tRes.data : []);
        setSpaces(Array.isArray(sRes.data) ? sRes.data : []);
        setStudents(Array.isArray(stRes.data) ? stRes.data : []);
        setClasses(Array.isArray(cRes.data) ? cRes.data : []);
        setRentals(Array.isArray(rRes.data) ? rRes.data : []);
        setModalities(Array.isArray(mRes.data) ? mRes.data : []);
        setCosts(Array.isArray(coRes.data) ? coRes.data : []);
      } catch (e) {
        console.error("Error carga maestra:", e);
        toast.error("Error cargando datos iniciales");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // -------------------- Calendar: intento silencioso (1 sola vez) --------------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (!alive) return;
        if (token) setCalendarToken(token);
      } catch (e) {
        // normal: si no puede silent, queda botón
        console.log("Calendar silent no disponible (ok):", e?.error || e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleRequestCalendarAccess = useCallback(async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success("Conectado a Google Calendar");
      onCalendarChange();
    } catch (e) {
      console.error("Error conectando Calendar:", e);
      toast.error("Error conectando Google Calendar");
      clearCalendarToken();
      setCalendarToken(null);
    }
  }, [onCalendarChange]);

  const handleDisconnectCalendar = useCallback(() => {
    clearCalendarToken();
    setCalendarToken(null);
    toast.info("Calendar desconectado");
    onCalendarChange();
  }, [onCalendarChange]);

  // -------------------- Drawer handlers --------------------
  const toggleMobileDrawer = () => setMobileOpen((v) => !v);
  const toggleCollapsed = () => setSidebarCollapsed((v) => !v);

  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_MINI : DRAWER_WIDTH;

  const handleNavigate = (next) => {
    setSection(next);
    if (isMobile) setMobileOpen(false);
  };

  // -------------------- Drawer content --------------------
  const DrawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarCollapsed ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!sidebarCollapsed && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Casa Luarma
          </Typography>
        )}

        {/* Retract button desktop */}
        {!isMobile && (
          <IconButton onClick={toggleCollapsed} size="small">
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        <Tooltip title="Matrícula" placement="right" disableHoverListener={!sidebarCollapsed}>
          <ListItemButton
            selected={section === "matricula"}
            onClick={() => handleNavigate("matricula")}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>
              <SchoolIcon />
            </ListItemIcon>
            {!sidebarCollapsed && <ListItemText primary="Matrícula" />}
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Alquileres" placement="right" disableHoverListener={!sidebarCollapsed}>
          <ListItemButton
            selected={section === "alquileres"}
            onClick={() => handleNavigate("alquileres")}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>
              <EventAvailableIcon />
            </ListItemIcon>
            {!sidebarCollapsed && <ListItemText primary="Alquileres" />}
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Finanzas" placement="right" disableHoverListener={!sidebarCollapsed}>
          <ListItemButton
            selected={section === "finanzas"}
            onClick={() => handleNavigate("finanzas")}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>
              <PaidIcon />
            </ListItemIcon>
            {!sidebarCollapsed && <ListItemText primary="Finanzas" />}
          </ListItemButton>
        </Tooltip>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        {!sidebarCollapsed && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Integraciones
          </Typography>
        )}

        {calendarToken ? (
          <>
            <Button variant="contained" onClick={handleRequestCalendarAccess}>
              Renovar Calendar
            </Button>
            <Button variant="outlined" onClick={handleDisconnectCalendar}>
              Desconectar
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleRequestCalendarAccess}>
            Conectar Calendar
          </Button>
        )}
      </Box>
    </Box>
  );

  // -------------------- Main content --------------------
  const MainContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Calendar view arriba (opcional) */}
      {calendarToken ? (
        <CalendarView accessToken={calendarToken} refresh={refreshCal} />
      ) : (
        <Typography sx={{ color: "text.secondary" }}>
          Calendar no conectado (opcional). Si lo conectás, se sincronizan clases y alquileres.
        </Typography>
      )}

      {section === "matricula" && (
        <>
          <StudentsManager onStudentsUpdate={setStudents} />

          <ClassesManager
            teachers={teachersArr}
            spaces={spacesArr}
            modalities={modalitiesArr}
            calendarToken={calendarToken}
            setCalendarToken={setCalendarToken}
            onClassesUpdate={handleClassesUpdate}
            refreshCalendar={onCalendarChange}
          />

          <ModalitiesManager onModalitiesUpdate={setModalities} />

          <TeacherManager onTeachersUpdate={setTeachers} />

          <PaymentManager
            classesList={classesArr}
            students={studentsArr}
            onPaymentsUpdate={handlePaymentsUpdate}
          />
        </>
      )}

      {section === "alquileres" && (
        <>
          <RentalManager
            spaces={spacesArr}
            calendarToken={calendarToken}
            setCalendarToken={setCalendarToken}
            onRentalsUpdate={handleRentalsUpdate}
            onEventSynced={onCalendarChange}
          />

          <SpacesManager onSpacesUpdate={setSpaces} />
        </>
      )}

      {section === "finanzas" && (
        <>
          <FinancialSummary
            month={new Date().getMonth() + 1}
            year={new Date().getFullYear()}
            refresh={financeRefresh}
          />

          <Divider sx={{ my: 1 }} />

          <TeacherPayouts />

          <CostsManager onCostsUpdate={handleCostsUpdate} />
        </>
      )}
    </Box>
  );

  // -------------------- Render --------------------
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={toggleMobileDrawer}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Admin Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Botón quick-action (también existe el FAB abajo) */}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setQaOpen(true)}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Acción rápida
            </Button>
          </Box>
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
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Drawer DESKTOP (permanent, collapsible) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            transition: "width 180ms ease",
            overflowX: "hidden",
          },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: 8, // espacio del AppBar
          width: "100%",
        }}
      >
        {MainContent}
      </Box>

      {/* FAB Quick Action */}
      <Fab
        color="primary"
        onClick={() => setQaOpen(true)}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Quick Action Dialog */}
      <QuickActionDialog
        open={qaOpen}
        onClose={() => setQaOpen(false)}
        spaces={spacesArr}
        classesList={classesArr}
        students={studentsArr}
        teachers={teachersArr}
        modalities={modalitiesArr}
        calendarToken={calendarToken}
        setCalendarToken={setCalendarToken}
        onStudentsUpdate={setStudents}
        onRentalsUpdate={handleRentalsUpdate}
        onPaymentsUpdate={handlePaymentsUpdate}
        onClassesUpdate={handleClassesUpdate}
        onTeachersUpdate={setTeachers}
      />
    </Box>
  );
}
