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

/**
 * ✅ parse seguro:
 * - Si viene "YYYY-MM-DD" lo interpreta como fecha LOCAL (evita shift por UTC)
 * - Si viene ISO completo o timestamp, cae al Date normal
 */
function parseDateLike(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const day = Number(m[3]);
      const d = new Date(y, mo - 1, day); // 👈 local
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function isSameMonthYear(dateLike, month, year) {
  const d = parseDateLike(dateLike);
  if (!d) return false;
  return (d.getMonth() + 1) === month && d.getFullYear() === year;
}

// ✅ Unifica fecha alquileres
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

// ✅ Unifica spaceId de alquiler (por compat)
function getRentalSpaceId(r) {
  return typeof r?.space === 'object' ? (r?.space?._id || r?.space?.id) : (r?.space || r?.spaceId);
}

// ✅ obtiene pph desde rental populate, o desde spaces del dashboard
function getPricePerHourFromRentalOrSpaces(r, spacesArr) {
  const fromRental =
    (typeof r?.space === 'object' && (r.space?.pricePerHour ?? r.space?.hourlyRate ?? r.space?.price)) ??
    (r?.pricePerHour ?? r?.hourlyRate ?? r?.price) ??
    null;

  const n1 = Number(fromRental);
  if (Number.isFinite(n1) && n1 > 0) return n1;

  const spaceId = getRentalSpaceId(r);
  const spaceObj = spacesArr.find((s) => s._id === spaceId) || null;

  const n2 = Number(spaceObj?.pricePerHour ?? spaceObj?.hourlyRate ?? spaceObj?.price ?? 0);
  return (Number.isFinite(n2) && n2 > 0) ? n2 : 0;
}

// ✅ monto alquiler con fallback hours*pph
function getRentalAmountWithFallback(r, spacesArr) {
  const raw = Number(r?.amount ?? r?.total ?? r?.price ?? r?.priceTotal ?? r?.totalAmount ?? 0);
  if (Number.isFinite(raw) && raw > 0) return raw;

  const hours = Number(r?.hours ?? 0);
  const pph = getPricePerHourFromRentalOrSpaces(r, spacesArr);

  if (Number.isFinite(hours) && hours > 0 && Number.isFinite(pph) && pph > 0) {
    return Math.round(hours * pph);
  }

  return 0;
}

/** ✅ COSTOS: normalizadores */
function getCostDate(c) {
  return (
    c?.date ||
    c?.costDate ||
    c?.expenseDate ||
    c?.paidAt ||
    c?.paymentDate ||
    c?.createdAt ||
    c?.updatedAt
  );
}

function getCostAmount(c) {
  const val = Number(
    c?.amount ??
    c?.cost ??
    c?.value ??
    c?.total ??
    c?.price ??
    c?.totalAmount ??
    0
  );
  return Number.isFinite(val) ? val : 0;
}

function isCostInMonthYear(c, month, year) {
  // si tu modelo trae month/year explícitos (super común)
  const cm = Number(c?.month);
  const cy = Number(c?.year);
  if (Number.isFinite(cm) && Number.isFinite(cy) && cm > 0 && cy > 0) {
    return cm === month && cy === year;
  }
  return isSameMonthYear(getCostDate(c), month, year);
}

export default function OverviewPanel({
  students = [],
  teachers = [],
  classes = [],
  rentals = [],
  payments = [],
  costs = [],
  spaces = [], // ✅ importante para fallback de rentals
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

    const incomeRentals = rentalsArr
      .filter((r) => isSameMonthYear(getRentalStart(r), month, year))
      .reduce((sum, r) => sum + getRentalAmountWithFallback(r, spacesArr), 0);

    // ✅ arreglado: detecta bien fechas y monto de costos
    const totalCosts = costsArr
      .filter((c) => isCostInMonthYear(c, month, year))
      .reduce((sum, c) => sum + getCostAmount(c), 0);

    const net = (incomeClasses + incomeRentals) - totalCosts;

    return {
      totalStudents: studentsArr.length,
      totalTeachers: teachersArr.length,
      totalClasses: classesArr.length,
      rentalsThisMonth: rentalsArr.filter((r) => isSameMonthYear(getRentalStart(r), month, year)).length,
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
