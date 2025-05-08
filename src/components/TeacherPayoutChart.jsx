import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TeacherPayoutChart({ month, year, small }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get(`/finance/teachers?month=${month}&year=${year}`)
      .then(res => setData(res.data))
      .catch(console.error);
  }, [month, year]);

  if (!data.length) return <Typography>Cargando gráfico…</Typography>;

  const chartData = {
    labels: data.map(r => r.professor),
    datasets: [{
      label: 'Ganancia',
      data: data.map(r => r.totalProfit),
      backgroundColor: [
        '#a4bdfc','#7ae7bf','#dbadff','#ff887c','#fbd75b',
        '#ffb878','#46d6db','#e1e1e1','#5484ed','#51b749'
      ]
    }]
  };

  return (
    <Box sx={{ height: small ? 150 : 300 }}>
      <Pie data={chartData} options={{ maintainAspectRatio: false }} />
    </Box>
  );
}
