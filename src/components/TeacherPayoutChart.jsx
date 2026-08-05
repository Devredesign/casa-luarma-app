// src/components/TeacherPayoutChart.jsx
import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import api from '../services/api';

import {
  Pie
} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import {
  Box,
  Typography,
  Paper
} from '@mui/material';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function TeacherPayoutChart({
  month,
  year,
  small,
  refresh
}) {
  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(
          `/finance/teachers?month=${month}&year=${year}`
        );

        const list = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        if (alive) {
          setRows(list);
        }
      } catch (err) {
        console.error(
          'TeacherPayoutChart error:',
          err
        );

        if (alive) {
          setRows([]);

          setError(
            'No se pudo cargar el gráfico'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [
    month,
    year,
    refresh
  ]);

  const safeRows = useMemo(
    () =>
      Array.isArray(rows)
        ? rows
        : [],
    [rows]
  );

  if (loading) {
    return (
      <Typography>
        Cargando gráfico…
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  if (safeRows.length === 0) {
    return (
      <Typography>
        No hay datos para este
        mes/año.
      </Typography>
    );
  }

  const chartData = {
    labels: safeRows.map(
      row =>
        row.professor ||
        'Sin profesor'
    ),

    datasets: [
      {
        label: 'Ganancia',

        data: safeRows.map(
          row =>
            Number(
              row.totalProfit || 0
            )
        ),

        backgroundColor: [
          '#a4bdfc',
          '#7ae7bf',
          '#dbadff',
          '#ff887c',
          '#fbd75b',
          '#ffb878',
          '#46d6db',
          '#e1e1e1',
          '#5484ed',
          '#51b749'
        ]
      }
    ]
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 1.5,
          sm: 2
        },
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 1 }}
      >
        Ganancia por profesor
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height: {
            xs: 270,
            sm: small ? 240 : 300
          },
          overflow: 'hidden'
        }}
      >
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                position: 'bottom',

                labels: {
                  boxWidth: 10,
                  padding: 10,
                  font: {
                    size: small
                      ? 10
                      : 12
                  }
                }
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
}
