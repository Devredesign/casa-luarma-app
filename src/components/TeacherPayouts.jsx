import React, { useState, useEffect } from 'react';
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
  const [data, setData]   = useState([]);
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear]   = useState(currentYear);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/finance/teachers?month=${month}&year=${year}`)
       .then(res => setData(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
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
      <Box sx={{ display:'flex', gap:2, mb:2 }}>
        <FormControl size="small">
          <InputLabel>Mes</InputLabel>
          <Select
            value={month}
            label="Mes"
            onChange={e => setMonth(e.target.value)}
          >
            {monthNames.map((m, i) => (
              <MenuItem key={i+1} value={i+1}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Año</InputLabel>
          <Select
            value={year}
            label="Año"
            onChange={e => setYear(e.target.value)}
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
              {data.map(row => (
                <TableRow key={row.professor}>
                  <TableCell>{row.professor}</TableCell>
                  <TableCell align="right">
                    {(row.totalIngress  ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(row.totalToPay    ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(row.totalProfit   ?? 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      )}
      </AccordionDetails>
      </Accordion>
    </Box>
    
  );
}
