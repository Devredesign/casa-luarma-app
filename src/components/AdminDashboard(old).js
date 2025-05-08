// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card, CardActionArea, CardContent, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
import { initializeGoogleSignIn } from '../services/googleAuth';
import { initCalendarTokenClient } from '../services/calendarTokenClient';
import api from '../services/api';
import { toast } from 'react-toastify';
import FinancialChart      from './FinancialChart';
import TeacherPayoutChart  from './TeacherPayoutChart';
export default function AdminDashboard() {
  
  
  // Domain data
  const [teachers, setTeachers] = useState([]);
  const [spaces,   setSpaces]   = useState([]);
  const [students, setStudents] = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [rentals,  setRentals]  = useState([]);
  const [modalities, setModalities] = useState([]);
  const [payments, setPayments]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  // Calendar integration
  const [calendarToken, setCalendarToken] = useState(null);
  const [refreshCal, setRefreshCal]       = useState(false);

  // Load domain lists once
  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(r.data)).catch(() => toast.error('Error cargando profesores'));
    api.get('/spaces').then(r => setSpaces(r.data)).catch(() => toast.error('Error cargando espacios'));
    api.get('/students').then(r => setStudents(r.data)).catch(() => toast.error('Error cargando estudiantes'));
    api.get('/classes').then(r => setClasses(r.data)).catch(() => toast.error('Error cargando clases'));
    api.get('/rentals').then(r => setRentals(r.data)).catch(() => toast.error('Error cargando alquileres'));
    api.get('/modalities').then(res => setModalities(res.data)).catch(() => toast.error('Error cargando modalidades'));
  // restore calendar token if present
    const saved = localStorage.getItem('calendarAccessToken');
    if (saved) setCalendarToken(saved);
  }, []);

  // Initialize Google Sign-In once
  useEffect(() => {
    initializeGoogleSignIn(
      () => toast.success('Google Sign-In listo'),
      err => console.error('Google Sign-In error', err)
    );
  }, []);

  // Request Calendar scope token
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

  // trigger calendar refresh
  const onCalendarChange = () => setRefreshCal(f => !f);
  useEffect(() => {
        async function loadSummary() {
          try {
            const month = new Date().getMonth() + 1;
            const year  = new Date().getFullYear();
            const res   = await api.get(`/finance/summary?month=${month}&year=${year}`);
            setSummary(res.data);
          } catch {
            toast.error('Error cargando resumen financiero');
          }
        }
        loadSummary();
      }, [classes, rentals, payments]);
  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard del Administrador
      </Typography>
      <Button
        variant="contained"
        onClick={handleRequestCalendarAccess}
        sx={{ mb: 2 }}
      >
        Conectar con Google Calendar
      </Button>

      {calendarToken && (
        <CalendarView
          accessToken={calendarToken}
          refresh={refreshCal}
        />
      )}

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Resumen Financiero</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <FinancialSummary data={summary} />
        </AccordionDetails>
      </Accordion>


      {/* Desglose por Profesor */}
     
     <Accordion>
       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
         <Typography>Desglose de Profesores</Typography>
       </AccordionSummary>
       <AccordionDetails>
         <TeacherPayouts />
       </AccordionDetails>
     </Accordion>

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Costos Operativos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CostsManager />
        </AccordionDetails>
      </Accordion>

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Modalidades de Clase</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ModalitiesManager />
        </AccordionDetails>
      </Accordion>

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Espacios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SpacesManager />
        </AccordionDetails>
      </Accordion>

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Profesores</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TeacherManager onTeachersUpdate={setTeachers} />
        </AccordionDetails>
      </Accordion>

      

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Estudiantes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StudentsManager />
        </AccordionDetails>
      </Accordion>

      

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Clases</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ClassesManager
          
            teachers={teachers}
            spaces={spaces}
            calendarToken={calendarToken}
            modalities={modalities} 
            setCalendarToken={setCalendarToken}
            onClassesUpdate={setClasses} 
            refreshCalendar={onCalendarChange}
          />
        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Alquileres</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RentalManager
            spaces={spaces}
            calendarToken={calendarToken}
            setCalendarToken={setCalendarToken}
            onRentalsUpdate={setRentals}
            refreshCalendar={onCalendarChange}
          />
        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gestión de Pagos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PaymentManager
            classesList={classes}
            students={students}
            onPaymentsUpdate={setPayments}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

