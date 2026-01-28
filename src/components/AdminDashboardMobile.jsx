import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
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

// logo desde /public
const LOGO_URL = "/casaluarma-logo.png";

export default function AdminDashboardMobile(props) {
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
      <AppBar position="fixed" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Box component="img" src={LOGO_URL} alt="Casa Luarma" sx={{ height: 28 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, flexGrow: 1 }}>
            Admin
          </Typography>

          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setQaOpen(true)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Rápido
          </Button>
        </Toolbar>

        {/* Tabs en el AppBar para ahorrar espacio y evitar sidebar */}
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="fullWidth"
        >
          <Tab label="Matrícula" />
          <Tab label="Alquileres" />
          <Tab label="Finanzas" />
        </Tabs>
      </AppBar>

      {/* Espacio para AppBar+Tabs (si no, tapa contenido) */}
      <Box sx={{ height: 112 }} />

      <Box sx={{ px: 2, pb: 6 }}>
        {calendarToken && (
          <Box sx={{ mb: 2 }}>
            <CalendarView accessToken={calendarToken} refresh={refreshCal} />
          </Box>
        )}

        {tabIndex === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

        {tabIndex === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

        {tabIndex === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FinancialSummary
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
              refresh={financeRefresh}
            />

            <TeacherPayouts />

            <CostsManager onCostsUpdate={onCostsUpdate} />
          </Box>
        )}
      </Box>

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
