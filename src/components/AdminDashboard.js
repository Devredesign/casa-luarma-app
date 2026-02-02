// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { toast } from 'react-toastify';

import api from '../services/api';

// Layouts
import AdminDashboardDesktopWithSidebar from './AdminDashboardDesktopWithSidebar';
import AdminDashboardMobileWithFooter from './AdminDashboardMobileWithFooter';

// UI + secciones
import OverviewPanel from './OverviewPanel';
import CalendarView from './CalendarView';

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

// Quick actions (opcional)
import QuickActionDialog from './QuickActionDialog';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Calendar auth
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

export default function AdminDashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Secciones: 0 Overview, 1 Matrícula, 2 Alquileres, 3 Finanzas
  const [sectionIndex, setSectionIndex] = useState(0);

  // Data state
  const [teachers, setTeachers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [costs, setCosts] = useState([]);
  const [financeRefresh, setFinanceRefresh] = useState(0);

  // Calendar
  const [calendarToken, setCalendarToken] = useState(null);
  const [refreshCal, setRefreshCal] = useState(false);
  const onCalendarChange = useCallback(() => setRefreshCal(f => !f), []);

  // SAFE arrays
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);
  const paymentsArr = useMemo(() => (Array.isArray(payments) ? payments : []), [payments]);
  const costsArr = useMemo(() => (Array.isArray(costs) ? costs : []), [costs]);

  // Update callbacks
  const handleClassesUpdate = useCallback((cls) => {
    setClasses(Array.isArray(cls) ? cls : []);
    setFinanceRefresh(f => f + 1);
  }, []);
  const handlePaymentsUpdate = useCallback((p) => {
    setPayments(Array.isArray(p) ? p : []);
    setFinanceRefresh(f => f + 1);
  }, []);
  const handleRentalsUpdate = useCallback((r) => {
    setRentals(Array.isArray(r) ? r : []);
    setFinanceRefresh(f => f + 1);
  }, []);
  const handleCostsUpdate = useCallback((c) => {
    setCosts(Array.isArray(c) ? c : []);
    setFinanceRefresh(f => f + 1);
  }, []);

  // Cargar datos maestros (solo 1 vez)
  useEffect(() => {
    (async () => {
      try {
        const [
          t, sp, st, cl, rn, md, py, cs
        ] = await Promise.all([
          api.get('/teachers'),
          api.get('/spaces'),
          api.get('/students'),
          api.get('/classes'),
          api.get('/rentals'),
          api.get('/modalities'),
          api.get('/payments'),
          api.get('/costs'),
        ]);

        setTeachers(Array.isArray(t.data) ? t.data : []);
        setSpaces(Array.isArray(sp.data) ? sp.data : []);
        setStudents(Array.isArray(st.data) ? st.data : []);
        setClasses(Array.isArray(cl.data) ? cl.data : []);
        setRentals(Array.isArray(rn.data) ? rn.data : []);
        setModalities(Array.isArray(md.data) ? md.data : []);
        setPayments(Array.isArray(py.data) ? py.data : []);
        setCosts(Array.isArray(cs.data) ? cs.data : []);
      } catch (e) {
        console.error(e);
        toast.error('Error cargando datos del dashboard');
      }
    })();
  }, []);

  // Calendar token silent al entrar
  useEffect(() => {
    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (token) {
          setCalendarToken(token);
          onCalendarChange();
        }
      } catch (e) {
        // normal
      }
    })();
  }, [onCalendarChange]);

  // Botón para conectar/renovar calendar
  const handleRequestCalendarAccess = async () => {
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

  // Quick actions (opcional)
  const [qaOpen, setQaOpen] = useState(false);

  // Logo (vos lo tenés en public/images/)
  const logoSrc = '/images/casaluarma-logo.png';

  // Contenido por sección
  const renderSection = () => {
    switch (sectionIndex) {
      case 0:
        return (
          <OverviewPanel
            students={studentsArr}
            teachers={teachersArr}
            classes={classesArr}
            rentals={rentalsArr}
            payments={paymentsArr}
            costs={costsArr}
            spaces={spacesArr}  
          />
        );

      case 1:
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'start'
            }}
          >
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

            {/* Pagos ocupa todo el ancho */}
            <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
              <PaymentManager
                classesList={classesArr}
                students={studentsArr}
                modalities={modalitiesArr}
                onPaymentsUpdate={handlePaymentsUpdate}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'start'
            }}
          >
            <RentalManager
              spaces={spacesArr}
              calendarToken={calendarToken}
              setCalendarToken={setCalendarToken}
              onRentalsUpdate={handleRentalsUpdate}
              onEventSynced={onCalendarChange}
            />
            <SpacesManager onSpacesUpdate={setSpaces} />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FinancialSummary
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
              refresh={financeRefresh}
              rentals={rentalsArr} 
              spaces={spacesArr}  
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                alignItems: 'start'
              }}
            >
              <TeacherPayouts />
              <CostsManager onCostsUpdate={handleCostsUpdate} />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const content = (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {/* ✅ Calendario SIEMPRE visible */}
      <CalendarView accessToken={calendarToken} refresh={refreshCal} />

      {/* Botón conectar calendar (si no token) */}
      {!calendarToken && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <button
            onClick={handleRequestCalendarAccess}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Conectar Google Calendar
          </button>
        </Box>
      )}

      {renderSection()}
    </Box>
  );

  return isDesktop ? (
    <AdminDashboardDesktopWithSidebar
      logoSrc={logoSrc}
      tabIndex={sectionIndex}
      setTabIndex={setSectionIndex}
    >
      {content}

      {/* Quick action opcional (desktop también lo podés usar) */}
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
    </AdminDashboardDesktopWithSidebar>
  ) : (
    <AdminDashboardMobileWithFooter
      logoSrc={logoSrc}
      tabIndex={sectionIndex}
      setTabIndex={setSectionIndex}
    >
      {content}

      {/* Quick action móvil */}
      <Fab
        color="primary"
        onClick={() => setQaOpen(true)}
        sx={{ position: 'fixed', bottom: 86, right: 16 }}
      >
        <AddIcon />
      </Fab>

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
    </AdminDashboardMobileWithFooter>
  );
}
