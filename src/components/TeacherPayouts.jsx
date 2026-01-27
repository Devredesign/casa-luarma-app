// src/components/TeacherPayouts.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const monthNames = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const currentYear = new Date().getFullYear();

export default function TeacherPayouts() {
  const [rows, setRows] = useState([]); // ✅ siempre array
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const data = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/finance/teachers?month=${month}&year=${year}`);
        const list = Array.isArray(res.data) ? res.data : [];
        if (alive) setRows(list);
      } catch (err) {
        console.error('TeacherPayouts error:', err);
        if (alive) {
          setRows([]);
          setError('No se pudo cargar el desglose.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [month, year]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Desglose por Profesor
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Ver Desglose</Typography>
        </AccordionSummary>

        <AccordionDetails>
          {/* Filtros Mes/Año */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={month}
                label="Mes"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {monthNames.map((m, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={year}
                label="Año"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {Array.from({ length: 6 }).map((_, i) => {
                  const y = currentYear - i;
                  return <MenuItem key={y} value={y}>{y}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Typography>Cargando…</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : data.length === 0 ? (
            <Typography>No hay datos para este mes/año.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Profesor</TableCell>
                    <TableCell align="right">Ingresos (₡)</TableCell>
                    <TableCell align="right">A Pagar (₡)</TableCell>
                    <TableCell align="right">Ganancia (₡)</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((row) => {
                    const professor = row?.professor || 'Sin profesor';
                    const totalIngress = Number(row?.totalIngress ?? 0);
                    const totalToPay = Number(row?.totalToPay ?? 0);
                    const totalProfit = Number(row?.totalProfit ?? 0);

                    return (
                      <TableRow key={professor}>
                        <TableCell>{professor}</TableCell>
                        <TableCell align="right">{totalIngress.toLocaleString()}</TableCell>
                        <TableCell align="right">{totalToPay.toLocaleString()}</TableCell>
                        <TableCell align="right">{totalProfit.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
