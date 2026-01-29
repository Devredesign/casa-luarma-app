// src/components/CalendarView.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-toastify';

import { listUpcomingEvents } from '../services/calendarService';
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

function isAuth401(err) {
  const msg = String(err?.message || err || '');
  return (
    err?.status === 401 ||
    err?.code === 401 ||
    err?.response?.status === 401 ||
    msg.includes(' 401') ||
    msg.includes('401') ||
    msg.toLowerCase().includes('unauthenticated') ||
    msg.toLowerCase().includes('invalid credentials')
  );
}

function getEventStartDate(ev) {
  const raw = ev?.start?.dateTime || ev?.start?.date;
  if (!raw) return null;
  // dateTime viene con hora; date viene solo con YYYY-MM-DD
  // Si viene solo fecha, lo tratamos como local a medianoche
  return new Date(raw);
}

function formatDateTimeLocal(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatDateOnly(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(d);
}

function groupByDay(events) {
  const map = new Map();
  events.forEach((ev) => {
    const start = getEventStartDate(ev);
    if (!start) return;
    const key = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(ev);
  });

  // ordenar días asc
  const days = Array.from(map.keys()).sort((a, b) => new Date(a) - new Date(b));

  // ordenar eventos por hora dentro del día
  const result = days.map((k) => {
    const list = map.get(k) || [];
    list.sort((a, b) => {
      const da = getEventStartDate(a)?.getTime() || 0;
      const db = getEventStartDate(b)?.getTime() || 0;
      return da - db;
    });
    return { dayKey: k, dayDate: new Date(k), items: list };
  });

  return result;
}

export default function CalendarView({ accessToken, refresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const safeEvents = Array.isArray(events) ? events : [];

  const daysGrouped = useMemo(() => groupByDay(safeEvents), [safeEvents]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      try {
        // 1) Usar el token que venga por props, si no intentar silent (sin popup)
        const tokenToUse =
          accessToken || (await getCalendarAccessToken({ interactiveFallback: false }));

        if (!tokenToUse) {
          if (alive) setEvents([]);
          return;
        }

        const data = await listUpcomingEvents(tokenToUse);
        if (!alive) return;

        const items = Array.isArray(data?.items) ? data.items : [];
        setEvents(items);
      } catch (err) {
        // 401 => token inválido/expirado: limpiamos storage y dejamos UI sin eventos
        if (isAuth401(err)) {
          clearCalendarToken?.();
          if (alive) setEvents([]);
          toast.warning('Calendar desconectado (token expirado). Usá “Conectar” para reconectar.');
        } else {
          console.error('Error obteniendo eventos del calendario:', err);
          if (alive) setEvents([]);
          toast.error('Error obteniendo eventos del calendario');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [accessToken, refresh]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Calendario
      </Typography>

      {/* ✅ Calendario SIEMPRE visible (Agenda por día) */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
          <CircularProgress size={18} />
          <Typography>Cargando calendario…</Typography>
        </Box>
      ) : daysGrouped.length === 0 ? (
        <Typography sx={{ mb: 2 }}>
          No hay eventos (o Calendar no está conectado).
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {daysGrouped.map(({ dayKey, dayDate, items }) => (
            <Grid item xs={12} md={6} lg={4} key={dayKey}>
              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {formatDateOnly(dayDate)}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {items.map((ev) => {
                      const start = getEventStartDate(ev);
                      const labelTime =
                        start && !Number.isNaN(start.getTime())
                          ? new Intl.DateTimeFormat('es-CR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(start)
                          : '—';

                      return (
                        <Box
                          key={ev.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography sx={{ flex: 1, minWidth: 0 }} noWrap title={ev.summary || ''}>
                            {ev.summary || 'Sin título'}
                          </Typography>

                          <Chip size="small" label={labelTime} />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ✅ Lista de próximos eventos escondida en Accordion */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Próximos eventos (lista) {safeEvents.length ? `— ${safeEvents.length}` : ''}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          {safeEvents.length === 0 ? (
            <Typography>No hay eventos para mostrar.</Typography>
          ) : (
            <List dense>
              {safeEvents.map((ev) => {
                const start = getEventStartDate(ev);
                return (
                  <ListItem key={ev.id} divider>
                    <ListItemText
                      primary={ev.summary || 'Sin título'}
                      secondary={formatDateTimeLocal(start)}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
