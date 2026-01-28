// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Tabs,
  Tab,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import QuickActionDialog from './QuickActionDialog';
import StudentsManager from './StudentsManager';
import ClassesManager from './ClassesManager';
import ModalitiesManager from './ModalitiesManager';
import TeacherManager from './TeacherManager';
import PaymentManager from './PaymentManager';

import RentalManager from './RentalManager';
import SpacesManager from './SpacesManager';

import FinancialSummary from './FinancialSummary';
import TeacherPayouts from './TeacherPayouts';
import CostsManager from './CostsManager';

import CalendarView from './CalendarView';

// ✅ Desktop layout con sidebar (el que ya tenés)
import AdminDashboardDesktopWithSidebar from './AdminDashboardDesktopWithSidebar';
// ✅ Mobile layout con footer sticky (asumiendo que ya existe en tu proyecto)
import AdminDashboardMobileWithFooter from './AdminDashboardMobile';

import api from '../services/api';
import { toast } from 'react-toastify';

// ✅ auth manager (token + expiración + silent)
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

export default function AdminDashboard() {
  const theme = useTheme();
  // Tablet como desktop ✅
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // —————————————— Estado global ——————————————
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

  // —————————————— SAFE arrays ——————————————
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);
  const costsArr = useMemo(() => (Array.isArray(costs) ? costs : []), [costs]);

  // —————————————— Callbacks estables ——————————————
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

  // —————————————— Cargar datos maestros (una sola vez) ——————————————
  useEffect(() => {
    api.get('/teachers')
      .then((r) => setTeachers(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando profesores'));

    api.get('/spaces')
      .then((r) => setSpaces(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando espacios'));

    api.get('/students')
      .then((r) => setStudents(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando estudiantes'));

    api.get('/classes')
      .then((r) => setClasses(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando clases'));

    api.get('/rentals')
      .then((r) => setRentals(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando alquileres'));

    api.get('/modalities')
      .then((r) => setModalities(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando modalidades'));

    api.get('/costs')
      .then((r) => setCosts(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando costos'));
  }, []);

  // ✅ Intento silencioso de Calendar al entrar (sin popup)
  useEffect(() => {
    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (token) {
          setCalendarToken(token);
          onCalendarChange();
        }
      } catch (e) {
        // normal: no siempre se puede silent
      }
    })();
  }, [onCalendarChange]);

  const handleRequestCalendarAccess = useCallback(async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success('Conectado a Google Calendar');
      onCalendarChange();
    } catch (e) {
      toast.error('Error conectando Google Calendar');
      clearCalendarToken();
      setCalendarToken(null);
    }
  }, [onCalendarChange]);

  const handleDisconnectCalendar = useCallback(() => {
    clearCalendarToken();
    setCalendarToken(null);
    toast.info('Calendar desconectado');
    onCalendarChange();
  }, [onCalendarChange]);

  // —————————————— Tabs ——————————————
  const [tabIndex, setTabIndex] = useState(0);

  // —————————————— Quick Action ——————————————
  const [qaOpen, setQaOpen] = useState(false);

  const content = (
    <Box sx={{ p: isDesktop ? 0 : 2 }}>
      {/* Calendar: en acordeón para no gastar espacio */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={800}>Google Calendar</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {calendarToken ? (
            <>
              <CalendarView accessToken={calendarToken} refresh={refreshCal} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={handleRequestCalendarAccess}>
                  Renovar / Reconectar
                </Button>
                <Button variant="outlined" onClick={handleDisconnectCalendar}>
                  Desconectar
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ flex: 1 }}>
                Calendar no conectado (opcional). Si lo conectás, se sincronizan clases y alquileres.
              </Typography>
              <Button variant="contained" onClick={handleRequestCalendarAccess}>
                Conectar
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Tabs */}
      {!isDesktop && (
        <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
          Dashboard
        </Typography>
      )}

      {!isDesktop && (
        <Fab
          color="primary"
          onClick={() => setQaOpen(true)}
          sx={{ position: 'fixed', bottom: 88, right: 16, zIndex: 1300 }}
          aria-label="Acción rápida"
        >
          <AddIcon />
        </Fab>
      )}

      {/* Desktop: el sidebar ya incluye botón Acción rápida */}
      {isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setQaOpen(true)}>
            Acción rápida
          </Button>
        </Box>
      )}

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

      {/* Tabs UI (desktop lo maneja sidebar, mobile footer lo maneja su layout) */}
      {isDesktop && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          aria-label="Secciones de gestión"
          sx={{ mb: 2 }}
        >
          <Tab label="Matrícula" />
          <Tab label="Alquileres" />
          <Tab label="Finanzas" />
        </Tabs>
      )}

      {/* ===== MATRÍCULA ===== */}
      <TabPanel value={tabIndex} index={0}>
        {isDesktop ? (
          <>
            {/* ✅ 2 columnas SOLO para: estudiantes / clases / modalidades / profesores */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <ModalitiesManager onModalitiesUpdate={setModalities} />
                <TeacherManager onTeachersUpdate={setTeachers} />
              </Grid>
            </Grid>

            {/* ✅ estos se quedan a 1 sola fila (full width) */}
            <Box sx={{ mt: 2 }}>
              <PaymentManager
                classesList={classesArr}
                students={studentsArr}
                onPaymentsUpdate={handlePaymentsUpdate}
              />
            </Box>
          </>
        ) : (
          // Mobile: layout simple (el footer sticky maneja navegación)
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
      </TabPanel>

      {/* ===== ALQUILERES ===== */}
      <TabPanel value={tabIndex} index={1}>
        {isDesktop ? (
          <>
            {/* ✅ 2 columnas SOLO para: rental + spaces */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <RentalManager
                  spaces={spacesArr}
                  calendarToken={calendarToken}
                  setCalendarToken={setCalendarToken}
                  onRentalsUpdate={handleRentalsUpdate}
                  onEventSynced={onCalendarChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SpacesManager onSpacesUpdate={setSpaces} />
              </Grid>
            </Grid>
          </>
        ) : (
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
      </TabPanel>

      {/* ===== FINANZAS ===== */}
      <TabPanel value={tabIndex} index={2}>
        {/* ✅ FinancialSummary se queda full width */}
        <FinancialSummary
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          refresh={financeRefresh}
        />

        <Divider sx={{ my: 2 }} />

        {isDesktop ? (
          <>
            {/* ✅ 2 columnas SOLO para: desglose por profesor + costos */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TeacherPayouts />
              </Grid>
              <Grid item xs={12} md={6}>
                <CostsManager onCostsUpdate={handleCostsUpdate} />
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <TeacherPayouts />
            <CostsManager onCostsUpdate={handleCostsUpdate} />
          </>
        )}
      </TabPanel>
    </Box>
  );

  // ✅ Logo en /public/images/
  const logoSrc = '/images/casaluarma-logo.png'; // <-- ajustá el nombre exacto

  if (isDesktop) {
    return (
      <AdminDashboardDesktopWithSidebar
        logoSrc={logoSrc}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        onQuickAction={() => setQaOpen(true)}
        contentMaxWidth={1400}
      >
        {content}
      </AdminDashboardDesktopWithSidebar>
    );
  }

  // Mobile sticky footer (tu archivo existente)
  return (
    <AdminDashboardMobileWithFooter
      logoSrc={logoSrc}
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
    >
      {content}
    </AdminDashboardMobileWithFooter>
  );
}

// Helper TabPanel
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}
