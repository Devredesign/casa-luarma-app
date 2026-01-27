// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Divider, Tabs, Tab, Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import QuickActionDialog from './QuickActionDialog';
import SpacesManager from './SpacesManager';
import TeacherManager from './TeacherManager';
import StudentsManager from './StudentsManager';
import ModalitiesManager from './ModalitiesManager';
import ClassesManager from './ClassesManager';
import RentalManager from './RentalManager';
import PaymentManager from './PaymentManager';
import CostsManager from './CostsManager';
import FinancialSummary from './FinancialSummary';
import CalendarView from './CalendarView';
import TeacherPayouts from './TeacherPayouts';

import api from '../services/api';
import { toast } from 'react-toastify';

// ✅ auth manager (token + expiración + silent)
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

export default function AdminDashboard() {
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

  // ✅ SAFE arrays (por si algún fetch trae algo raro)
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

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

  // Fuerza refresco de calendario
  const onCalendarChange = useCallback(() => setRefreshCal((f) => !f), []);

  // —————————————— Cargar datos maestros ——————————————
  useEffect(() => {
    api.get('/teachers')
      .then(r => setTeachers(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando profesores'));

    api.get('/spaces')
      .then(r => setSpaces(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando espacios'));

    api.get('/students')
      .then(r => setStudents(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando estudiantes'));

    api.get('/classes')
      .then(r => setClasses(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando clases'));

    api.get('/rentals')
      .then(r => setRentals(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando alquileres'));

    api.get('/modalities')
      .then(r => setModalities(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando modalidades'));

    api.get('/costs')
      .then(r => setCosts(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Error cargando costos'));
  }, []);

  // ✅ Intento silencioso de Calendar al entrar (sin popup)
  useEffect(() => {
    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (token) {
          setCalendarToken(token);
          // ✅ importante: refresca CalendarView por si tenía un 401 previo
          onCalendarChange();
        }
      } catch (e) {
        // Normal: a veces no se puede silent; queda el botón para conectar
        console.log('Calendar token silent no disponible (ok):', e?.error || e);
      }
    })();
  }, [onCalendarChange]);

  // ✅ Botón: pedir token interactivo (popup/consent)
  const handleRequestCalendarAccess = async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success('Conectado a Google Calendar');
      onCalendarChange();
    } catch (e) {
      console.error('Error obteniendo token de Calendar:', e);
      toast.error('Error conectando Google Calendar');
      clearCalendarToken();
      setCalendarToken(null);
    }
  };

  // (Opcional) botón para desconectar token
  const handleDisconnectCalendar = () => {
    clearCalendarToken();
    setCalendarToken(null);
    toast.info('Calendar desconectado');
    onCalendarChange();
  };

  // Quick action
  const [qaOpen, setQaOpen] = useState(false);

  // Tabs
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard del Administrador
      </Typography>

      {/* Calendar */}
      {calendarToken ? (
        <>
          <CalendarView accessToken={calendarToken} refresh={refreshCal} />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant="contained" onClick={handleRequestCalendarAccess}>
              Renovar / Reconectar Calendar
            </Button>
            <Button variant="outlined" onClick={handleDisconnectCalendar}>
              Desconectar
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>
            Calendar no conectado (opcional). Si lo conectás, se sincronizan clases y alquileres.
          </Typography>
          <Button variant="contained" onClick={handleRequestCalendarAccess} sx={{ mb: 2 }}>
            Conectar con Google Calendar
          </Button>
        </>
      )}

      {/* Quick action */}
      <Fab
        color="primary"
        onClick={() => setQaOpen(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      <QuickActionDialog
        open={qaOpen}
        onClose={() => setQaOpen(false)}
        spaces={spacesArr}
        classesList={classesArr}
        students={studentsArr}
        modalities={modalities}  
        teachers={teachers}  
      />

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Secciones de gestión" sx={{ mb: 2 }}>
        <Tab label="Matrícula" />
        <Tab label="Alquileres" />
        <Tab label="Finanzas" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
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
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <RentalManager
          spaces={spacesArr}
          calendarToken={calendarToken}
          setCalendarToken={setCalendarToken}
          onRentalsUpdate={handleRentalsUpdate}
          onEventSynced={onCalendarChange}
        />

        <SpacesManager onSpacesUpdate={setSpaces} />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <FinancialSummary
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          refresh={financeRefresh}
        />

        <Divider sx={{ my: 2 }} />

        <TeacherPayouts />

        <CostsManager onCostsUpdate={handleCostsUpdate} />
      </TabPanel>
    </Box>
  );
}

// Helper TabPanel
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
