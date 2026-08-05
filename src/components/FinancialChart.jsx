import React, {
  useEffect,
  useState
} from 'react';

import api from '../services/api';

import {
  Bar
} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

import {
  Box,
  Typography,
  Paper
} from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function FinancialChart({
  month,
  year,
  small,
  refresh
}) {
  const [data, setData] =
    useState(null);

  useEffect(() => {
    let alive = true;

    api
      .get(
        `/finance/summary?month=${month}&year=${year}`
      )
      .then(response => {
        if (alive) {
          setData(response.data);
        }
      })
      .catch(error => {
        console.error(error);

        if (alive) {
          setData({});
        }
      });

    return () => {
      alive = false;
    };
  }, [month, year, refresh]);

  if (!data) {
    return (
      <Typography>
        Cargando gráfico…
      </Typography>
    );
  }

  const chartData = {
    labels: [
      'Clases',
      'Alquileres',
      'Profesores',
      'Operativos',
      'Ganancia'
    ],

    datasets: [
      {
        label: 'Resumen',

        data: [
          Number(
            data.incomeClasses || 0
          ),
          Number(
            data.incomeRentals || 0
          ),
          Number(
            data.costTeachers || 0
          ),
          Number(
            data.totalCosts || 0
          ),
          Number(
            data.grossProfit || 0
          )
        ],

        backgroundColor: [
          '#7ae7bf',
          '#a4bdfc',
          '#fbd75b',
          '#dc2127',
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
        Resumen del mes
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height: {
            xs: 240,
            sm: small ? 220 : 300
          },
          overflow: 'hidden'
        }}
      >
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false
              }
            },

            scales: {
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 0,
                  font: {
                    size: small
                      ? 10
                      : 12
                  }
                }
              },

              y: {
                beginAtZero: true,

                ticks: {
                  callback: value =>
                    `₡${Number(
                      value
                    ).toLocaleString(
                      'es-CR'
                    )}`
                }
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
}
