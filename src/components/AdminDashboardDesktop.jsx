import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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

// ✅ Logo (ponelo en /public o /src/assets)
// Opción A (recomendado): poné el archivo en /public y usá esto:
const LOGO_URL = "/images/casaluarma-logo.png";

export default function AdminDashboardDesktop(props) {
  const {
    teachers,
    spaces,
    students,
    classes,
    modalities,
    calendarToken,
    setCalendarToken,
    refreshCal,
    onCalendarChange,
    onClassesUpdate,
    onPaymentsUpdate,
    onRentalsUpdate,
    onCostsUpdate,
    financeRefresh,

    setStudents,
    setTeachers,
    setModalities,
    setSpaces,
  } = props;

  const [qaOpen, setQaOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box>
      {/* AppBar (no tapa el contenido porque ponemos <Toolbar /> abajo) */}
      <AppBar position="fixed" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component="img"
            src={LOGO_URL}
            alt="Casa Luarma"
            sx={{ height: 34, width: "auto" }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Dashboard del Administrador
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Espaciador para AppBar fixed */}
      <Toolbar />

      {/* Contenido (pb para que el FAB no tape el final) */}
      <Box sx={{ p: 3, pb: 10 }}>
        {calendarToken ? (
          <CalendarView accessToken={calendarToken} refresh={refreshCal} />
        ) : (
          <Typography sx={{ mb: 2, color: "text.secondary" }}>
            Calendar no conectado (opcional). Si lo conectás, se sincronizan clases y alquileres.
          </Typography>
        )}

        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
          <Tab label="Matrícula" />
          <Tab label="Alquileres" />
          <Tab label="Finanzas" />
        </Tabs>

        {/* TAB 0: Matrícula */}
        {tabIndex === 0 && (
          <Box sx={{ pt: 2 }}>
            <StudentsManager onStudentsUpdate={setStudents} />

            <ClassesManager
              teachers={teachers}
              spaces={spaces}
              modalities={modalities}
              calendarToken={calendarToken}
              setCalendarToken={setCalendarToken}
              onClassesUpdate={onClassesUpdate}
              refreshCalendar={onCalendarChange}
            />

            <ModalitiesManager onModalitiesUpdate={setModalities} />

            <TeacherManager onTeachersUpdate={setTeachers} />

            <PaymentManager
              classesList={classes}
              students={students}
              onPaymentsUpdate={onPaymentsUpdate}
            />
          </Box>
        )}

        {/* TAB 1: Alquileres */}
        {tabIndex === 1 && (
          <Box sx={{ pt: 2 }}>
            <RentalManager
              spaces={spaces}
              calendarToken={calendarToken}
              setCalendarToken={setCalendarToken}
              onRentalsUpdate={onRentalsUpdate}
              onEventSynced={onCalendarChange}
            />

            <SpacesManager onSpacesUpdate={setSpaces} />
          </Box>
        )}

        {/* TAB 2: Finanzas */}
        {tabIndex === 2 && (
          <Box sx={{ pt: 2 }}>
            <FinancialSummary
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
              refresh={financeRefresh}
            />

            <Divider sx={{ my: 2 }} />

            <TeacherPayouts />

            <CostsManager onCostsUpdate={onCostsUpdate} />
          </Box>
        )}
      </Box>

      {/* FAB Quick action */}
      <Fab
        color="primary"
        onClick={() => setQaOpen(true)}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* QuickActionDialog con props completas (modalities/teachers incluidos) */}
      <QuickActionDialog
        open={qaOpen}
        onClose={() => setQaOpen(false)}
        spaces={spaces}
        classesList={classes}
        students={students}
        teachers={teachers}
        modalities={modalities}
        calendarToken={calendarToken}
        setCalendarToken={setCalendarToken}
        onStudentsUpdate={setStudents}
        onRentalsUpdate={onRentalsUpdate}
        onPaymentsUpdate={onPaymentsUpdate}
        onClassesUpdate={onClassesUpdate}
        onTeachersUpdate={setTeachers}
      />
    </Box>
  );
}
