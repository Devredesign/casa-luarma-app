// src/components/ProfitLineChart.jsx
import React, {
  useEffect,
  useState
} from 'react';

import {
  Line
} from 'react-chartjs-2';

import api from '../services/api';

import {
  Box,
  Paper,
  Typography
} from '@mui/material';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const monthLabels = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

export default function ProfitLineChart({
  year,
  small,
  refresh
}) {
  const [data, setData] =
    useState(null);

  useEffect(() => {
    let alive = true;

    async function fetchAll() {
      const promises =
        monthLabels.map(
          (_, index) =>
            api
              .get(
                `/finance/summary?month=${
                  index + 1
                }&year=${year}`
              )
              .then(
                response =>
                  response.data
              )
              .catch(() => null)
        );

      const results =
        await Promise.all(promises);

      if (!alive) {
        return;
      }

      const gross = results.map(
        result =>
          Number(
            result?.grossProfit ?? 0
          )
      );

      const net = results.map(
        result =>
          Number(
            result?.realProfit ?? 0
          )
      );

      setData({
        labels: monthLabels,

        datasets: [
          {
            label:
              'Ganancia Bruta',

            data: gross,

            borderWidth:
              small ? 1 : 2,

            borderColor:
              '#51b749',

            backgroundColor:
              'rgba(81,183,73,0.2)',

            tension: 0.4
          },
          {
            label:
              'Ganancia Neta',

            data: net,

            borderWidth:
              small ? 1 : 2,

            borderColor:
              '#dc2127',

            backgroundColor:
              'rgba(220,33,39,0.2)',

            tension: 0.4
          }
        ]
      });
    }

    fetchAll();

    return () => {
      alive = false;
    };
  }, [
    year,
    refresh,
    small
  ]);

  if (!data) {
    return (
      <Typography>
        Cargando gráfico…
      </Typography>
    );
  }

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
        Evolución mensual
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height: {
            xs: 250,
            sm: small ? 220 : 300
          },
          overflow: 'hidden'
        }}
      >
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                position: 'bottom',

                labels: {
                  boxWidth:
                    small ? 10 : 20,

                  font: {
                    size:
                      small ? 10 : 12
                  }
                }
              }
            },

            scales: {
              x: {
                ticks: {
                  font: {
                    size:
                      small ? 10 : 12
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
