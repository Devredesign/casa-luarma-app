// src/components/TeacherPayoutChart.jsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TeacherPayoutChart({ month, year, small }) {
  const [rows, setRows] = useState([]);      // siempre array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/finance/teachers?month=${month}&year=${year}`);

        // ✅ asegurar array
        const list = Array.isArray(res.data) ? res.data : [];
        if (alive) setRows(list);
      } catch (e) {
        console.error('TeacherPayoutChart error:', e);
        if (alive) {
          setRows([]);
          setError('No se pudo cargar el gráfico');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [month, year]);

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  if (loading) return <Typography>Cargando gráfico…</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (safeRows.length === 0) return <Typography>No hay datos para este mes/año.</Typography>;

  const chartData = {
    labels: safeRows.map(r => r.professor || 'Sin profesor'),
    datasets: [
      {
        label: 'Ganancia',
        data: safeRows.map(r => Number(r.totalProfit || 0)),
        backgroundColor: [
          '#a4bdfc', '#7ae7bf', '#dbadff', '#ff887c', '#fbd75b',
          '#ffb878', '#46d6db', '#e1e1e1', '#5484ed', '#51b749'
        ],
      },
    ],
  };

  return (
    <Box sx={{ height: small ? 150 : 300 }}>
      <Pie data={chartData} options={{ maintainAspectRatio: false }} />
    </Box>
  );
}
