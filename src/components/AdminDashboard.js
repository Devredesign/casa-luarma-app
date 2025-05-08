// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Divider,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import SpacesManager       from './SpacesManager';
import TeacherManager      from './TeacherManager';
import StudentsManager     from './StudentsManager';
import ModalitiesManager   from './ModalitiesManager';
import ClassesManager      from './ClassesManager';
import RentalManager       from './RentalManager';
import PaymentManager      from './PaymentManager';
import CostsManager        from './CostsManager';
import FinancialSummary    from './FinancialSummary';
import CalendarView        from './CalendarView';
import TeacherPayouts      from './TeacherPayouts';

import { initializeGoogleSignIn }    from '../services/googleAuth';
import { initCalendarTokenClient }   from '../services/calendarTokenClient';
import api                           from '../services/api';
import { toast }                     from 'react-toastify';

export default function AdminDashboard() {
  // —————————————— Estado global ——————————————
  const [teachers, setTeachers]   = useState([]);
  const [spaces, setSpaces]       = useState([]);
  const [students, setStudents]   = useState([]);
  const [classes, setClasses]     = useState([]);
  const [rentals, setRentals]     = useState([]);
  const [modalities, setModalities] = useState([]);
  const [payments, setPayments]   = useState([]);
  const [financeRefresh, setFinanceRefresh] = useState(0);

  const [calendarToken, setCalendarToken] = useState(null);
  const [refreshCal, setRefreshCal]       = useState(false);

  // Cargar datos maestros
  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(r.data)).catch(() => toast.error('Error cargando profesores'));
    api.get('/spaces').then(r => setSpaces(r.data)).catch(() => toast.error('Error cargando espacios'));
    api.get('/students').then(r => setStudents(r.data)).catch(() => toast.error('Error cargando estudiantes'));
    api.get('/classes').then(r => setClasses(r.data)).catch(() => toast.error('Error cargando clases'));
    api.get('/rentals').then(r => setRentals(r.data)).catch(() => toast.error('Error cargando alquileres'));
    api.get('/modalities').then(r => setModalities(r.data)).catch(() => toast.error('Error cargando modalidades'));
    // restaurar token si existe
    const saved = localStorage.getItem('calendarAccessToken');
    if (saved) setCalendarToken(saved);
  }, []);

  // Google Sign-In
  useEffect(() => {
    initializeGoogleSignIn(
      () => toast.success('Google Sign-In listo'),
      err => console.error('Google Sign-In error', err)
    );
  }, []);

  // Pedir token de Calendar on-demand
  const handleRequestCalendarAccess = () => {
    const client = initCalendarTokenClient(response => {
      if (response.error) {
        toast.error('Error obteniendo token de Calendar');
        console.error(response);
      } else {
        setCalendarToken(response.access_token);
        localStorage.setItem('calendarAccessToken', response.access_token);
        toast.success('Conectado a Google Calendar');
      }
    });
    client.requestAccessToken();
  };

  // Fuerza refresco de calendario
  const onCalendarChange = () => setRefreshCal(f => !f);

  // —————————————— Tabs ——————————————
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard del Administrador
      </Typography>

      

      {calendarToken && (
        <CalendarView
          accessToken={calendarToken}
          refresh={refreshCal}
        />
      )}
      <Button
        variant="contained"
        onClick={handleRequestCalendarAccess}
        sx={{ mb: 2 }}
      >
        Conectar con Google Calendar
      </Button>

      {/* ————— Tabs de grupos ————— */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="Secciones de gestión"
        sx={{ mb: 2 }}
      >
        <Tab label="Académico" />
        <Tab label="Operaciones" />
        <Tab label="Finanzas" />
      </Tabs>

      {/* ————— Contenido de cada Tab ————— */}
      <TabPanel value={tabIndex} index={0}>
        {/* Académico */}
        <ModalitiesManager />
        
        <ClassesManager
          teachers={teachers}
          spaces={spaces}
          modalities={modalities}
          calendarToken={calendarToken}
          setCalendarToken={setCalendarToken}
          onClassesUpdate={cls => {
            setClasses(cls);
            setFinanceRefresh(f => f + 1);
          }}
          refreshCalendar={onCalendarChange}
        />
        
        <SpacesManager />
        
        <TeacherManager onTeachersUpdate={setTeachers} />
        
        <StudentsManager />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {/* Operaciones */}
        
        <RentalManager
          spaces={spaces}
          calendarToken={calendarToken}
          setCalendarToken={setCalendarToken}
          onRentalsUpdate={r => {
            setRentals(r);
            setFinanceRefresh(f => f + 1);
          }}
          refreshCalendar={onCalendarChange}
        />
        
        <CostsManager />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        {/* Finanzas */}
       
        <FinancialSummary
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          refresh={financeRefresh}
        />
        <Divider sx={{ my: 2 }} />
        <TeacherPayouts />
        
        <PaymentManager
          classesList={classes}
          students={students}
          onPaymentsUpdate={p => {
            setPayments(p);
            setFinanceRefresh(f => f + 1);
          }}
        />
      </TabPanel>
    </Box>
  );
}

// Helper para mostrar/ocultar paneles
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
