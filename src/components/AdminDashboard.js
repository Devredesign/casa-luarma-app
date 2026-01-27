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
    clearCalenda
