import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import api from "../services/api";
import { toast } from "react-toastify";

import AdminDashboardDesktop from "./AdminDashboardDesktop";
import AdminDashboardMobile from "./AdminDashboardMobile";

import { getCalendarAccessToken } from "../services/calendarAuth";

export default function AdminDashboardResponsive() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Estado único compartido (desktop y mobile)
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

  // SAFE arrays
  const teachersArr = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const studentsArr = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const classesArr = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const modalitiesArr = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);
  const paymentsArr = useMemo(() => (Array.isArray(payments) ? payments : []), [payments]);
  const costsArr = useMemo(() => (Array.isArray(costs) ? costs : []), [costs]);

  // Refresco calendario (solo toggles)
  const onCalendarChange = useCallback(() => setRefreshCal((f) => !f), []);

  // Updates (para finanzas)
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

  // ✅ Carga inicial 1 vez (evita loops / crash)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [t, s, st, c, r, m, co] = await Promise.all([
          api.get("/teachers"),
          api.get("/spaces"),
          api.get("/students"),
          api.get("/classes"),
          api.get("/rentals"),
          api.get("/modalities"),
          api.get("/costs"),
        ]);

        if (!alive) return;

        setTeachers(Array.isArray(t.data) ? t.data : []);
        setSpaces(Array.isArray(s.data) ? s.data : []);
        setStudents(Array.isArray(st.data) ? st.data : []);
        setClasses(Array.isArray(c.data) ? c.data : []);
        setRentals(Array.isArray(r.data) ? r.data : []);
        setModalities(Array.isArray(m.data) ? m.data : []);
        setCosts(Array.isArray(co.data) ? co.data : []);
      } catch (e) {
        console.error("Error carga inicial:", e);
        toast.error("Error cargando datos iniciales");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Calendar silent 1 vez
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await getCalendarAccessToken({ interactiveFallback: false });
        if (!alive) return;
        if (token) setCalendarToken(token);
      } catch {
        // normal: si no hay sesión previa, no pasa nada
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sharedProps = {
    teachers: teachersArr,
    spaces: spacesArr,
    students: studentsArr,
    classes: classesArr,
    rentals: rentalsArr,
    modalities: modalitiesArr,
    payments: paymentsArr,
    costs: costsArr,

    setTeachers,
    setSpaces,
    setStudents,
    setClasses,
    setRentals,
    setModalities,
    setPayments,
    setCosts,

    financeRefresh,
    calendarToken,
    setCalendarToken,
    refreshCal,
    onCalendarChange,

    onClassesUpdate: handleClassesUpdate,
    onPaymentsUpdate: handlePaymentsUpdate,
    onRentalsUpdate: handleRentalsUpdate,
    onCostsUpdate: handleCostsUpdate,
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {isMobile ? (
        <AdminDashboardMobile {...sharedProps} />
      ) : (
        <AdminDashboardDesktop {...sharedProps} />
      )}
    </Box>
  );
}
