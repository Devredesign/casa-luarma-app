// src/components/ProfitLineChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
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
  'Ene','Feb','Mar','Abr','May','Jun',
  'Jul','Ago','Sep','Oct','Nov','Dic'
];

export default function ProfitLineChart({ year, small, refresh }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Para cada mes 1–12 pedimos summary
    const fetchAll = async () => {
      const promises = monthLabels.map((_, idx) =>
        api
          .get(`/api/finance/summary?month=${idx+1}&year=${year}`)
          .then(res => res.data)
          .catch(() => null)
      );
      const results = await Promise.all(promises);
      // extraemos grossProfit y realProfit
      const gross   = results.map(r => (r?.grossProfit ?? 0));
      const net     = results.map(r => (r?.realProfit  ?? 0));
      setData({
        labels: monthLabels,
        datasets: [
          {
            label: 'Ganancia Bruta',
            data: gross,
            borderWidth: small ? 1 : 2,
            tension: 0.4
          },
          {
            label: 'Ganancia Neta',
            data: net,
            borderWidth: small ? 1 : 2,
            tension: 0.4
          }
        ]
      });
    };
    fetchAll();
  }, [year, refresh]);

  if (!data) return <p>Cargando gráfico…</p>;

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: small ? 10 : 20 } },
          title: { display: !small, text: 'Evolución Mensual' }
        },
        scales: {
          y: { ticks: { callback: val => `₡${val.toLocaleString()}` } }
        }
      }}
      style={{ height: small ? 150 : 300 }}
    />
  );
}
