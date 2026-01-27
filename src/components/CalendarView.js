// src/components/CalendarView.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { listUpcomingEvents } from '../services/calendarService';
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

// ✅ Si usás react-big-calendar, descomentá estas líneas:
 import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
 import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
 const localizer = momentLocalizer(moment);

function toNiceDate(ev) {
  const dt = ev?.start?.dateTime || ev?.start?.date;
  if (!dt) return 'Sin fecha';
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return dt;
    return d.toLocaleString();
  } catch {
    return dt;
  }
}

function toDateRange(ev) {
  // Google Calendar: start/end puede ser dateTime o date
  const s = ev?.start?.dateTime || ev?.start?.date;
  const e = ev?.end?.dateTime || ev?.end?.date;

  const start = s ? new Date(s) : null;
  const end = e ? new Date(e) : null;

  // Si end no viene, al menos 1h
  if (start && (!end || Number.isNaN(end.getTime()))) {
    return { start, end: new Date(start.getTime() + 60 * 60 * 1000) };
  }

  return { start, end };
}

export default function CalendarView({ accessToken, refresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const eventsArray = useMemo(() => (Array.isArray(events) ? events : []), [events]);

  // ✅ eventStyleGetter (para react-big-calendar)
  // OJO: Google Calendar trae `colorId` como string (ej: "1", "2"...)
  const eventStyleGetter = useCallback((event) => {
    const colorId = event?.colorId?.toString?.() || event?.resource?.colorId?.toString?.();

    // Si no hay colorId, estilo neutro
    if (!colorId) {
      return {
        style: {
          borderRadius: '10px',
          padding: '2px 6px',
        },
      };
    }

    // Paleta simple (podés ajustar)
    const palette = {
      '1': '#5484ed',
      '2': '#7ae7bf',
      '3': '#dbadff',
      '4': '#ff887c',
      '5': '#fbd75b',
      '6': '#ffb878',
      '7': '#46d6db',
      '8': '#e1e1e1',
      '9': '#51b749',
      '10': '#dc2127',
      '11': '#8e24aa',
    };

    const bg = palette[colorId] || '#5484ed';

    return {
      style: {
        backgroundColor: bg,
        borderRadius: '10px',
        padding: '2px 6px',
        color: '#111',
        border: 'none',
      },
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const tokenToUse =
          accessToken || (await getCalendarAccessToken({ interactiveFallback: false }));

        if (!tokenToUse) {
          if (alive) setEvents([]);
          return;
        }

        const data = await listUpcomingEvents(tokenToUse, {
          timeMin: new Date().toISOString(),
          maxResults: 10,
        });

        if (!alive) return;

        const items = Array.isArray(data?.items) ? data.items : [];
        setEvents(items);
      } catch (e) {
        const is401 =
          e?.status === 401 ||
          e?.code === 'AUTH_401' ||
          e?.message?.includes?.('401');

        if (is401) {
          clearCalendarToken();
          try {
            const newToken = await getCalendarAccessToken({ interactiveFallback: true });

            const data2 = await listUpcomingEvents(newToken, {
              timeMin: new Date().toISOString(),
              maxResults: 10,
            });

            if (!alive) return;

            const items2 = Array.isArray(data2?.items) ? data2.items : [];
            setEvents(items2);
            toast.info('Calendar reconectado');
            return;
          } catch (e2) {
            console.error('No se pudo reconectar Calendar:', e2);
            toast.error('No se pudo reconectar Calendar');
          }
        } else {
          console.error('Error obteniendo eventos del calendario:', e);
          toast.error('Error obteniendo eventos del calendario');
        }

        if (alive) setEvents([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [accessToken, refresh]);

  if (loading) return <Typography>Cargando calendario…</Typography>;

  // ✅ Si querés usar react-big-calendar:
   const bigCalendarEvents = eventsArray
     .map((ev) => {
       const { start, end } = toDateRange(ev);
       if (!start || Number.isNaN(start.getTime())) return null;
       return {
         id: ev.id,
        title: ev.summary || 'Sin título',
        start,
         end: end && !Number.isNaN(end.getTime()) ? end : new Date(start.getTime() + 60 * 60 * 1000),
               resource: ev, // opcional: guardar todo el evento
       };
     })
     .filter(Boolean);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Próximos eventos</Typography>

      {/* ✅ Render lista (como ya lo tenías) */}
      {eventsArray.length === 0 ? (
        <Typography>No hay eventos (o Calendar no está conectado).</Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {eventsArray.map((ev) => (
            <Box component="li" key={ev.id} sx={{ mb: 0.5 }}>
              <Typography variant="body2">
                <strong>{ev.summary || 'Sin título'}</strong> — {toNiceDate(ev)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ✅ Si usás react-big-calendar, descomentá esto: */}
     
      <Box sx={{ mt: 2, height: 420 }}>
        <BigCalendar
          localizer={localizer}
          events={bigCalendarEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter} // 👈 aquí va
          views={['month', 'week', 'day', 'agenda']}
          defaultView="agenda"
        />
      </Box>
   
    </Box>
  );
}
