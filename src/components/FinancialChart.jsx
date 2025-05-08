import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FinancialChart({ month, year, small }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/finance/summary?month=${month}&year=${year}`)
      .then(res => setData(res.data))
      .catch(console.error);
  }, [month, year]);

  if (!data) return <Typography>Cargando gráfico…</Typography>;

  const chartData = {
    labels: ['Clases', 'Alquileres', 'Costos Prof.', 'Ganancia bruta'],
    datasets: [{
      label: `Resumen`,
      data: [
        data.incomeClasses,
        data.incomeRentals,
        data.costTeachers,
        data.grossProfit
      ],
      backgroundColor: ['#7ae7bf','#a4bdfc','#fbd75b','#dc2127']
    }]
  };

  return (
    <Box sx={{ height: small ? 150 : 300 }}>
      <Bar data={chartData} options={{ maintainAspectRatio: false }} />
    </Box>
  );
}

