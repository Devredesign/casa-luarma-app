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
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  return (d.getMonth() + 1) === month && d.getFullYear() === year;
}

export default function OverviewPanel({
  students = [],
  teachers = [],
  classes = [],
  rentals = [],
  payments = [],
  costs = [],
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

  const kpis = useMemo(() => {
    // Ingresos clases: pagos del mes (paid o todos si no hay status)
    const incomeClasses = paymentsArr
      .filter(p => isSameMonthYear(p.paymentDate, month, year))
      .filter(p => !p.status || p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Ingresos alquileres: intenta varios campos comunes (amount/total/price)
    const incomeRentals = rentalsArr
      .filter(r => isSameMonthYear(r.startTime || r.date || r.createdAt, month, year))
      .reduce((sum, r) => {
        const val =
          Number(r.amount ?? r.total ?? r.price ?? r.priceTotal ?? r.totalAmount ?? 0);
        return sum + (Number.isFinite(val) ? val : 0);
      }, 0);

    // Costos operativos: suma amount (o cost) del mes
    const totalCosts = costsArr
      .filter(c => isSameMonthYear(c.date || c.costDate || c.createdAt, month, year))
      .reduce((sum, c) => sum + Number(c.amount ?? c.cost ?? 0), 0);

    // Ganancia neta simple
    const net = (incomeClasses + incomeRentals) - totalCosts;

    // Conteos
    const totalStudents = studentsArr.length;
    const totalTeachers = teachersArr.length;
    const totalClasses = classesArr.length;

    const rentalsThisMonth = rentalsArr.filter(r =>
      isSameMonthYear(r.startTime || r.date || r.createdAt, month, year)
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
  }, [studentsArr, teachersArr, classesArr, rentalsArr, paymentsArr, costsArr, month, year]);

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
        Resumen rápido del mes actual ({month}/{year}). (Esto es “aprox” porque depende de los campos disponibles en tus modelos.)
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
