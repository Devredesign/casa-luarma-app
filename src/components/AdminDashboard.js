
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Fab,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';

import QuickActionDialog from './QuickActionDialog';
import StudentsManager from './StudentsManager';
import ClassesManager from './ClassesManager';
import ModalitiesManager from './ModalitiesManager';
import TeacherManager from './TeacherManager';
import PaymentManager from './PaymentManager';
import RentalManager from './RentalManager';
import SpacesManager from './SpacesManager';
import CostsManager from './CostsManager';
import FinancialSummary from './FinancialSummary';
import CalendarView from './CalendarView';
import TeacherPayouts from './TeacherPayouts';

import api from '../services/api';
import { toast } from 'react-toastify';
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

const drawerWidth = 260;

const SECTIONS = {
  HOME: 'HOME',
  MATRICULA: 'MATRICULA',
  ALQUILERES: 'ALQUILERES',
  FINANZAS: 'FINANZAS',
};

export default function AdminDashboardPro() {
  // DATA
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
  const [section, setSection] = useState(SECTIONS.HOME);
  const [qaOpen, setQaOpen] = useState(false);

  // SAFE arrays
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  const onCalendarChange = useCallback(() => setRefreshCal((f) => !f), []);

  // Load master data
  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando profesores'));
    api.get('/spaces').then(r => setSpaces(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando espacios'));
    api.get('/students').then(r => setStudents(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando estudiantes'));
    api.get('/classes').then(r => setClasses(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando clases'));
    api.get('/rentals').then(r => setRentals(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando alquileres'));
    api.get('/modalities').then(r => setModalities(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando modalidades'));
    api.get('/costs').then(r => setCosts(Array.isArray(r.data) ? r.data : [])).catch(() => toast.error('Error cargando costos'));
  }, []);

  // silent calendar attempt
  useEffect(() => {
    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (token) {
          setCalendarToken(token);
          onCalendarChange();
        }
      } catch {}
    })();
  }, [onCalendarChange]);

  const connectCalendar = async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success('Conectado a Google Calendar');
      onCalendarChange();
    } catch (e) {
      console.error(e);
      toast.error('Error conectando Google Calendar');
      clearCalendarToken();
      setCalendarToken(null);
    }
  };

  const disconnectCalendar = () => {
    clearCalendarToken();
    setCalendarToken(null);
    toast.info('Calendar desconectado');
    onCalendarChange();
  };

  // Callbacks (refrescan finanzas)
  const handleClassesUpdate = useCallback((cls) => {
    setClasses(Array.isArray(cls) ? cls : []);
    setFinanceRefresh((f) => f + 1);
  }, []);
  const handleRentalsUpdate = useCallback((r) => {
    setRentals(Array.isArray(r) ? r : []);
    setFinanceRefresh((f) => f + 1);
  }, []);
  const handlePaymentsUpdate = useCallback((p) => {
    setPayments(Array.isArray(p) ? p : []);
    setFinanceRefresh((f) => f + 1);
  }, []);
  const handleCostsUpdate = useCallback((c) => {
    setCosts(Array.isArray(c) ? c : []);
  }, []);

  // ---- “Resumen” para Home (ejemplo simple) ----
  const todayStr = new Date().toLocaleDateString();
  const classesCount = classesArr.length;
  const rentalsCount = rentalsArr.length;
  const studentsCount = studentsArr.length;
  const spacesCount = spacesArr.length;

  const Content = () => {
    if (section === SECTIONS.HOME) {
      return (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Resumen • {todayStr}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Clases registradas</Typography>
                  <Typography variant="h4">{classesCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total en sistema
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Alquileres registrados</Typography>
                  <Typography variant="h4">{rentalsCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total en sistema
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Estudiantes</Typography>
                  <Typography variant="h4">{studentsCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total en base
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Espacios</Typography>
                  <Typography variant="h4">{spacesCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Agenda (Calendar)
                  </Typography>
                  {calendarToken ? (
                    <CalendarView accessToken={calendarToken} refresh={refreshCal} />
                  ) : (
                    <Typography color="text.secondary">
                      No conectado. Conectá Calendar para ver eventos aquí.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Acciones rápidas
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Creá una clase, alquiler o pago en segundos.
                  </Typography>
                  <Button variant="contained" onClick={() => setQaOpen(true)}>
                    + Abrir acciones rápidas
                  </Button>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Finanzas rápido
                  </Typography>
                  <FinancialSummary
                    month={new Date().getMonth() + 1}
                    year={new Date().getFullYear()}
                    refresh={financeRefresh}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    if (section === SECTIONS.MATRICULA) {
      return (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Matrícula</Typography>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <StudentsManager onStudentsUpdate={setStudents} />
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <ClassesManager
                teachers={teachersArr}
                spaces={spacesArr}
                modalities={modalitiesArr}
                calendarToken={calendarToken}
                setCalendarToken={setCalendarToken}
                onClassesUpdate={handleClassesUpdate}
                refreshCalendar={onCalendarChange}
              />
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <ModalitiesManager onModalitiesUpdate={setModalities} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <TeacherManager onTeachersUpdate={setTeachers} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <PaymentManager
                classesList={classesArr}
                students={studentsArr}
                onPaymentsUpdate={handlePaymentsUpdate}
              />
            </CardContent>
          </Card>
        </Box>
      );
    }

    if (section === SECTIONS.ALQUILERES) {
      return (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Alquileres</Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Card>
                <CardContent>
                  <RentalManager
                    spaces={spacesArr}
                    calendarToken={calendarToken}
                    setCalendarToken={setCalendarToken}
                    onRentalsUpdate={handleRentalsUpdate}
                    onEventSynced={onCalendarChange}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card>
                <CardContent>
                  <SpacesManager onSpacesUpdate={setSpaces} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    // FINANZAS
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Finanzas</Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <FinancialSummary
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
              refresh={financeRefresh}
            />
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <TeacherPayouts />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <CostsManager onCostsUpdate={handleCostsUpdate} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* TOPBAR */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h6">Casa Luarma • Admin</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Panel de gestión
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {calendarToken ? (
              <Chip label="Calendar: Conectado" variant="filled" />
            ) : (
              <Chip label="Calendar: No conectado" variant="outlined" />
            )}

            {calendarToken ? (
              <>
                <Button color="inherit" variant="outlined" onClick={connectCalendar}>
                  Renovar
                </Button>
                <Button color="inherit" variant="outlined" onClick={disconnectCalendar}>
                  Desconectar
                </Button>
              </>
            ) : (
              <Button color="inherit" variant="contained" onClick={connectCalendar}>
                Conectar Calendar
              </Button>
            )}

            <Button color="inherit" variant="contained" onClick={() => setQaOpen(true)}>
              + Crear
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List>
            <ListItemButton selected={section === SECTIONS.HOME} onClick={() => setSection(SECTIONS.HOME)}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Inicio" secondary="Resumen y agenda" />
            </ListItemButton>

            <ListItemButton selected={section === SECTIONS.MATRICULA} onClick={() => setSection(SECTIONS.MATRICULA)}>
              <ListItemIcon><SchoolIcon /></ListItemIcon>
              <ListItemText primary="Matrícula" secondary="Estudiantes y clases" />
            </ListItemButton>

            <ListItemButton selected={section === SECTIONS.ALQUILERES} onClick={() => setSection(SECTIONS.ALQUILERES)}>
              <ListItemIcon><EventIcon /></ListItemIcon>
              <ListItemText primary="Alquileres" secondary="Reservas y espacios" />
            </ListItemButton>

            <ListItemButton selected={section === SECTIONS.FINANZAS} onClick={() => setSection(SECTIONS.FINANZAS)}>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Finanzas" secondary="Resumen, pagos y costos" />
            </ListItemButton>
          </List>

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" sx={{ px: 1, opacity: 0.7 }}>
            Tip: Usá “+ Crear” para registrar rápido.
          </Typography>
        </Box>
      </Drawer>

      {/* MAIN */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Content />
      </Box>

      {/* FAB (opcional para mobile) */}
      <Fab
        color="primary"
        onClick={() => setQaOpen(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* QUICK ACTION */}
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
