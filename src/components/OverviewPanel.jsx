// src/components/OverviewPanel.jsx
import React, { useMemo } from 'react';
import { Box, Card, CardContent, Grid, Typography, Divider } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

function money(n) {
  const v = Number(n || 0);
  return `₡ ${v.toLocaleString()}`;
}

function isSameMonthYear(dateLike, month, year) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  return (d.getMonth() + 1) === month && d.getFullYear() === year;
}

function getRentalStart(r) {
  return (
    r?.startDateTime ||
    r?.startTime ||
    r?.start ||
    r?.startDate ||
    r?.date ||
    r?.rentalDate ||
    r?.createdAt
  );
}

function getRentalSpaceId(r) {
  return typeof r?.space === 'object' ? (r?.space?._id || r?.space?.id) : (r?.space || r?.spaceId);
}

function getPricePerHourFromRentalOrSpaces(r, spacesArr) {
  // 1) Si viene populate con pricePerHour:
  const fromRental =
    (typeof r?.space === 'object' && (r.space?.pricePerHour ?? r.space?.hourlyRate ?? r.space?.price)) ??
    (r?.pricePerHour ?? r?.hourlyRate ?? r?.price) ??
    null;

  const n1 = Number(fromRental);
  if (Number.isFinite(n1) && n1 > 0) return n1;

  // 2) Buscar en spaces del dashboard
  const spaceId = getRentalSpaceId(r);
  const spaceObj = spacesArr.find((s) => s._id === spaceId) || null;

  const n2 = Number(spaceObj?.pricePerHour ?? spaceObj?.hourlyRate ?? spaceObj?.price ?? 0);
  return (Number.isFinite(n2) && n2 > 0) ? n2 : 0;
}

function getRentalAmountWithFallback(r, spacesArr) {
  // si ya viene amount/total/price:
  const raw = Number(r?.amount ?? r?.total ?? r?.price ?? r?.priceTotal ?? r?.totalAmount ?? 0);
  if (Number.isFinite(raw) && raw > 0) return raw;

  // fallback: hours * pricePerHour
  const hours = Number(r?.hours ?? 0);
  const pph = getPricePerHourFromRentalOrSpaces(r, spacesArr);

  if (Number.isFinite(hours) && hours > 0 && Number.isFinite(pph) && pph > 0) {
    return Math.round(hours * pph);
  }

  return 0;
}

export default function OverviewPanel({
  students = [],
  teachers = [],
  classes = [],
  rentals = [],
  payments = [],
  costs = [],
  spaces = [], // 👈 NUEVO
}) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const studentsArr = Array.isArray(students) ? students : [];
  const teachersArr = Array.isArray(teachers) ? teachers : [];
  const classesArr = Array.isArray(classes) ? classes : [];
  const rentalsArr = Array.isArray(rentals) ? rentals : [];
  const paymentsArr = Array.isArray(payments) ? payments : [];
  const costsArr = Array.isArray(costs) ? costs : [];
  const spacesArr = Array.isArray(spaces) ? spaces : [];

  const kpis = useMemo(() => {
    const incomeClasses = paymentsArr
      .filter((p) => isSameMonthYear(p.paymentDate || p.date || p.createdAt, month, year))
      .filter((p) => !p.status || p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // ✅ ahora sí: incluye startDateTime y recalcula monto si amount viene vacío/0
    const incomeRentals = rentalsArr
      .filter((r) => isSameMonthYear(getRentalStart(r), month, year))
      .reduce((sum, r) => sum + getRentalAmountWithFallback(r, spacesArr), 0);

    const totalCosts = costsArr
      .filter((c) => isSameMonthYear(c.date || c.costDate || c.createdAt, month, year))
      .reduce((sum, c) => sum + Number(c.amount ?? c.cost ?? 0), 0);

    const net = (incomeClasses + incomeRentals) - totalCosts;

    const totalStudents = studentsArr.length;
    const totalTeachers = teachersArr.length;
    const totalClasses = classesArr.length;

    const rentalsThisMonth = rentalsArr.filter((r) =>
      isSameMonthYear(getRentalStart(r), month, year)
    ).length;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      rentalsThisMonth,
      incomeClasses,
      incomeRentals,
      totalCosts,
      net,
    };
  }, [studentsArr, teachersArr, classesArr, rentalsArr, paymentsArr, costsArr, spacesArr, month, year]);

  const cards = [
    { label: 'Estudiantes', value: kpis.totalStudents, icon: <PeopleAltIcon /> },
    { label: 'Profesores', value: kpis.totalTeachers, icon: <PersonIcon /> },
    { label: 'Clases', value: kpis.totalClasses, icon: <SchoolIcon /> },
    { label: 'Alquileres (mes)', value: kpis.rentalsThisMonth, icon: <MeetingRoomIcon /> },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h4">Overview</Typography>
      <Typography variant="body2" color="text.secondary">
        Resumen rápido del mes actual ({month}/{year}).
      </Typography>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={6} md={3} key={c.label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {c.icon}
                  <Typography variant="subtitle2" color="text.secondary">
                    {c.label}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                  {c.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentsIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Ingreso Clases (mes)
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                {money(kpis.incomeClasses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MeetingRoomIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Ingreso Alquileres (mes)
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                {money(kpis.incomeRentals)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Costos Operativos (mes)
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                {money(kpis.totalCosts)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider />

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Ganancia Neta Estimada (mes)
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 900 }}>
            {money(kpis.net)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            neto = ingresos clases + ingresos alquileres − costos operativos
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
