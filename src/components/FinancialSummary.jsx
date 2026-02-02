// src/components/FinancialSummary.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

import FinancialChart from './FinancialChart';
import TeacherPayoutChart from './TeacherPayoutChart';
import ProfitLineChart from './ProfitLineChart';

const monthNames = [
  { value: 1,  label: 'Enero' },
  { value: 2,  label: 'Febrero' },
  { value: 3,  label: 'Marzo' },
  { value: 4,  label: 'Abril' },
  { value: 5,  label: 'Mayo' },
  { value: 6,  label: 'Junio' },
  { value: 7,  label: 'Julio' },
  { value: 8,  label: 'Agosto' },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();

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

function isSameMonthYear(dateLike, month, year) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  return (d.getMonth() + 1) === month && d.getFullYear() === year;
}

function getRentalSpaceId(r) {
  return typeof r?.space === 'object' ? (r?.space?._id || r?.space?.id) : (r?.space || r?.spaceId);
}

function getPPH(r, spacesArr) {
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

function getRentalAmountWithFallback(r, spacesArr) {
  const raw = Number(r.amount ?? r.total ?? r.price ?? 0);
  if (Number.isFinite(raw) && raw > 0) return raw;

  const hours = Number(r.hours ?? 0);
  const pph = getPPH(r, spacesArr);

  if (Number.isFinite(hours) && hours > 0 && Number.isFinite(pph) && pph > 0) {
    return Math.round(hours * pph);
  }

  return 0;
}

export default function FinancialSummary({
  month: initialMonth,
  year: initialYear,
  refresh,
  rentals, // 👈 nuevo
  spaces,  // 👈 nuevo
}) {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(initialMonth ?? (new Date().getMonth() + 1));
  const [year, setYear] = useState(initialYear ?? currentYear);

  const rentalsPropArr = Array.isArray(rentals) ? rentals : null;
  const spacesArr = Array.isArray(spaces) ? spaces : [];

  useEffect(() => {
    let alive = true;
    setData(null);

    // ✅ Siempre traemos el summary, pero rentals los agarramos del prop si existen
    const calls = [api.get(`/finance/summary?month=${month}&year=${year}`)];
    if (!rentalsPropArr) calls.push(api.get('/rentals'));

    Promise.all(calls)
      .then((resArr) => {
        if (!alive) return;

        const summaryRes = resArr[0];
        const rentalsRes = rentalsPropArr ? null : resArr[1];

        const base = summaryRes?.data || {};
        const rentalsArr = rentalsPropArr ?? (Array.isArray(rentalsRes?.data) ? rentalsRes.data : []);

        const computedIncomeRentals = rentalsArr
          .filter((r) => isSameMonthYear(getRentalStart(r), month, year))
          .reduce((sum, r) => sum + getRentalAmountWithFallback(r, spacesArr), 0);

        const incomeClasses = Number(base.incomeClasses ?? 0);
        const incomeRentalsBackend = Number(base.incomeRentals ?? 0);

        // ✅ si backend viene 0, usamos el calculado con fallback
        const incomeRentals = incomeRentalsBackend > 0 ? incomeRentalsBackend : computedIncomeRentals;

        const costTeachers = Number(base.costTeachers ?? 0);
        const totalCosts = Number(base.totalCosts ?? 0);

        const grossProfit = (incomeClasses + incomeRentals) - costTeachers;
        const realProfit = grossProfit - totalCosts;

        setData({
          ...base,
          incomeClasses,
          incomeRentals,
          costTeachers,
          totalCosts,
          grossProfit,
          realProfit,
        });
      })
      .catch((err) => {
        console.error('Error fetching finance:', err);
        if (alive) setData({});
      });

    return () => { alive = false; };
  }, [month, year, refresh, rentalsPropArr, spacesArr]);

  const kpis = [
    { label: 'Ingreso Clases',     key: 'incomeClasses' },
    { label: 'Ingreso Alquileres', key: 'incomeRentals' },
    { label: 'Costo Profesores',   key: 'costTeachers' },
    { label: 'Costos Operativos',  key: 'totalCosts' },
    { label: 'Ganancia Bruta',     key: 'grossProfit' },
    { label: 'Ganancia Neta',      key: 'realProfit' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resumen Financiero
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small">
          <InputLabel>Mes</InputLabel>
          <Select value={month} label="Mes" onChange={(e) => setMonth(e.target.value)}>
            {monthNames.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Año</InputLabel>
          <Select value={year} label="Año" onChange={(e) => setYear(e.target.value)}>
            {Array.from({ length: 6 }).map((_, i) => {
              const y = currentYear - i;
              return (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FinancialChart month={month} year={year} small refresh={refresh} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TeacherPayoutChart month={month} year={year} small refresh={refresh} />
        </Grid>
        <Grid item xs={12} md={3}>
          <ProfitLineChart year={year} small refresh={refresh} />
        </Grid>
      </Grid>

      {!data ? (
        <Typography sx={{ mt: 2 }}>Cargando resumen financiero…</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {kpis.map((kpi) => {
            const val = Number(data[kpi.key] ?? 0);
            return (
              <Grid item xs={6} sm={4} md={4} key={kpi.key}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      ₡ {val.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
