// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
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

import AdminDashboardDesktopWithSidebar from './AdminDashboardDesktopWithSidebar';
import AdminDashboardMobileWithFooter from './AdminDashboardMobile';

import api from '../services/api';
import { toast } from 'react-toastify';

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
  const [payments, setPayments] = useState([]); // ✅ se carga ahora
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
  const paymentsArr = useMemo(() => (Array.isArray(payments) ? payments : []), [payments]);
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

  // —————————————— Cargar datos maestros ——————————————
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

    // ✅ nuevo: payments (para el overview)
    api.get('/payments')
      .then((r) => setPayments(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando pagos'));

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
      } catch {
        // normal
      }
    })();
  }, [onCalendarChange]);

  const handleRequestCalendarAccess = useCallback(async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success('Conectado a Google Calendar');
      onCalendarChange();
    } catch {
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

  // —————————————— Navegación (sidebar / footer) ——————————————
  const [tabIndex, setTabIndex] = useState(0);

  // —————————————— Quick Action Dialog (solo se abre desde sidebar o móvil) ——————————————
  const [qaOpen, setQaOpen] = useState(false);

  // ✅ Logo en /public/images/
  const logoSrc = '/images/casaluarma-logo.png'; // ajustá al nombre exacto

  // —————————————— Overview calculations ——————————————
  const now = new Date();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const totalCostsThisMonth = useMemo(() => {
    return costsArr.reduce((sum, c) => {
      const amount = Number(c.amount || 0);

      // fixed: lo contamos siempre como mensual
      if (c.type === 'fixed') return sum + amount;

      // variable: solo si cae en el mes actual
      if (c.type === 'variable' && c.dateIncurred) {
        const d = new Date(c.dateIncurred);
        if (d.getMonth() === nowMonth && d.getFullYear() === nowYear) return sum + amount;
      }
      return sum;
    }, 0);
  }, [costsArr, nowMonth, nowYear]);

  const totalPaymentsThisMonth = useMemo(() => {
    // si tu payment tiene otra estructura, lo ajustamos.
    // aquí asumo: { amount, date } o { amount, createdAt }
    return paymentsArr.reduce((sum, p) => {
      const amount = Number(p.amount || p.total || 0);
      const dRaw = p.date || p.createdAt || p.paidAt;
      if (!dRaw) return sum;
      const d = new Date(dRaw);
      if (d.getMonth() === nowMonth && d.getFullYear() === nowYear) return sum + amount;
      return sum;
    }, 0);
  }, [paymentsArr, nowMonth, nowYear]);

  const content = (
    <Box sx={{ p: isDesktop ? 0 : 2 }}>
      {/* ✅ OVERVIEW */}
      <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
        Overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Estudiantes" value={studentsArr.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Profesores" value={teachersArr.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clases activas" value={classesArr.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Alquileres" value={rentalsArr.length} />
        </Grid>

        <Grid item xs={12} md={6}>
          <StatCardMoney title="Pagos mes actual" value={totalPaymentsThisMonth} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCardMoney title="Costos mes actual" value={totalCostsThisMonth} />
        </Grid>
      </Grid>

      {/* Calendar en acordeón */}
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

      {/* ✅ Desktop: NO botón/FAB de Acción rápida aquí (ya está en sidebar) */}
      {/* ✅ Mobile: mantenemos FAB (porque NO hay sidebar) */}
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

            {/* ✅ este se queda full width */}
            <Box sx={{ mt: 2 }}>
              <PaymentManager
                classesList={classesArr}
                students={studentsArr}
                modalities={modalitiesArr}
                onPaymentsUpdate={handlePaymentsUpdate}
              />
            </Box>
          </>
        ) : (
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
        <FinancialSummary
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          refresh={financeRefresh}
        />

        <Divider sx={{ my: 2 }} />

        {isDesktop ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TeacherPayouts />
            </Grid>
            <Grid item xs={12} md={6}>
              <CostsManager onCostsUpdate={handleCostsUpdate} />
            </Grid>
          </Grid>
        ) : (
          <>
            <TeacherPayouts />
            <CostsManager onCostsUpdate={handleCostsUpdate} />
          </>
        )}
      </TabPanel>
    </Box>
  );

  // ✅ Desktop: sidebar controla secciones → SIN Tabs arriba
  if (isDesktop) {
    return (
      <AdminDashboardDesktopWithSidebar
        logoSrc={logoSrc}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        onQuickAction={() => setQaOpen(true)} // ✅ solo aquí (sidebar)
        contentMaxWidth={1400}
      >
        {content}
      </AdminDashboardDesktopWithSidebar>
    );
  }

  // ✅ Mobile: footer sticky controla secciones
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

/** =======================
 *  UI Helpers
 *  ======================= */
function StatCard({ title, value }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StatCardMoney({ title, value }) {
  const amount = Number(value || 0);
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
          ₡{amount.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
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
