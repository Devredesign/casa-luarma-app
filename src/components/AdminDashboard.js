// src/components/AdminDashboardResponsive.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { toast } from 'react-toastify';

import AdminDashboardDesktopWithSidebar from './AdminDashboardDesktopWithSidebar';
import AdminDashboardMobile from './AdminDashboardMobile';

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

import api from '../services/api';
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

const LOGO_SRC = '/images/casaluarma-logo.png';

export default function AdminDashboardResponsive() {
  // ✅ Mobile solo en "sm" o menos. Tablet se comporta como desktop.
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Data
  const [teachers, setTeachers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [costs, setCosts] = useState([]);
  const [financeRefresh, setFinanceRefresh] = useState(0);

  // Nav
  const [tabIndex, setTabIndex] = useState(0);

  // Quick actions
  const [qaOpen, setQaOpen] = useState(false);

  // Calendar token + refresh
  const [calendarToken, setCalendarToken] = useState(null);
  const [refreshCal, setRefreshCal] = useState(false);
  const onCalendarChange = useCallback(() => setRefreshCal((f) => !f), []);

  // SAFE arrays
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  // Callbacks estables (evitan renders raros)
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

  // ✅ Fetch maestro SOLO 1 vez al montar
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [
          tRes, sRes, stRes, cRes, rRes, mRes, costRes,
        ] = await Promise.all([
          api.get('/teachers'),
          api.get('/spaces'),
          api.get('/students'),
          api.get('/classes'),
          api.get('/rentals'),
          api.get('/modalities'),
          api.get('/costs'),
        ]);

        if (!alive) return;

        setTeachers(Array.isArray(tRes.data) ? tRes.data : []);
        setSpaces(Array.isArray(sRes.data) ? sRes.data : []);
        setStudents(Array.isArray(stRes.data) ? stRes.data : []);
        setClasses(Array.isArray(cRes.data) ? cRes.data : []);
        setRentals(Array.isArray(rRes.data) ? rRes.data : []);
        setModalities(Array.isArray(mRes.data) ? mRes.data : []);
        setCosts(Array.isArray(costRes.data) ? costRes.data : []);
      } catch (e) {
        console.error('Error cargando datos maestros:', e);
        toast.error('Error cargando datos');
      }
    };

    load();
    return () => { alive = false; };
  }, []);

  // ✅ Intento silencioso de Calendar al entrar
  useEffect(() => {
    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (token) {
          setCalendarToken(token);
          onCalendarChange();
        }
      } catch (e) {
        // normal si no hay sesión previa
        console.log('Calendar silent no disponible (ok)');
      }
    })();
  }, [onCalendarChange]);

  const handleConnectCalendar = useCallback(async () => {
    try {
      const token = await getCalendarAccessToken({ interactiveFallback: true });
      setCalendarToken(token);
      toast.success('Conectado a Google Calendar');
      onCalendarChange();
    } catch (e) {
      console.error('Error conectando Calendar:', e);
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

  // ✅ Paneles (solo 1 sección a la vez: reduce scroll en móvil)
  const renderSection = () => {
    if (tabIndex === 0) {
      return (
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
      );
    }

    if (tabIndex === 1) {
      return (
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
      );
    }

    return (
      <>
        <FinancialSummary
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          refresh={financeRefresh}
        />
        <Box sx={{ my: 2 }} />
        <TeacherPayouts />
        <CostsManager onCostsUpdate={handleCostsUpdate} />
      </>
    );
  };

  // ✅ Calendario en Accordion (compacto)
  const CalendarAccordion = (
    <Accordion sx={{ mb: 2 }} defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>Calendario (próximos eventos)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {calendarToken ? (
          <>
            <CalendarView accessToken={calendarToken} refresh={refreshCal} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleConnectCalendar}>
                Renovar / Reconectar
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
            <Button variant="contained" onClick={handleConnectCalendar}>
              Conectar con Google Calendar
            </Button>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const content = (
    <Box sx={{ p: isMobile ? 1 : 0 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        Dashboard del Administrador
      </Typography>

      {CalendarAccordion}

      {renderSection()}

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

  // ✅ Switch UI
  if (isMobile) {
    return (
      <AdminDashboardMobile
        logoSrc={LOGO_SRC}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        onQuickAction={() => setQaOpen(true)}
      >
        {content}
      </AdminDashboardMobile>
    );
  }

  return (
    <AdminDashboardDesktopWithSidebar
      logoSrc={LOGO_SRC}
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
      onQuickAction={() => setQaOpen(true)}
    >
      {content}
    </AdminDashboardDesktopWithSidebar>
  );
}
