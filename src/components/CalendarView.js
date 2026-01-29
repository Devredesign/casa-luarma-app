// src/components/CalendarView.js
import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-toastify';

import { listUpcomingEvents } from '../services/calendarService';
import { getCalendarAccessToken, clearCalendarToken } from '../services/calendarAuth';

// ✅ si ya lo usabas antes (eventStyleGetter)
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

function toCalendarEvent(ev) {
  const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start?.date);
  const end = ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end?.date);
  return {
    id: ev.id,
    title: ev.summary || '(Sin título)',
    start,
    end,
    allDay: Boolean(ev.start?.date),
    _raw: ev,
  };
}

export default function CalendarView({ accessToken, refresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const events = useMemo(() => items.map(toCalendarEvent), [items]);

  // ✅ eventStyleGetter (lo pediste)
  const eventStyleGetter = (event) => {
    // si el evento tiene colorId, podrías mapearlo, pero lo dejamos simple y limpio
    const isAllDay = event.allDay;
    return {
      style: {
        borderRadius: 8,
        border: 'none',
        padding: '2px 6px',
        fontWeight: 600,
        opacity: isAllDay ? 0.9 : 1,
      },
    };
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const tokenToUse = accessToken || (await getCalendarAccessToken({ interactiveFallback: false }));
        if (!tokenToUse) {
          if (alive) setItems([]);
          return;
        }

        // Traemos más de 10 para que el calendario tenga contenido
        const data = await listUpcomingEvents(tokenToUse, { maxResults: 80 });
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (e?.status === 401 || e?.code === 'AUTH_401') {
          clearCalendarToken();
          try {
            const newToken = await getCalendarAccessToken({ interactiveFallback: true });
            const data2 = await listUpcomingEvents(newToken, { maxResults: 80 });
            if (!alive) return;
            setItems(Array.isArray(data2?.items) ? data2.items : []);
            toast.success('Calendar reconectado');
            return;
          } catch (e2) {
            console.error(e2);
            toast.error('No se pudo reconectar Calendar');
          }
        } else {
          console.error(e);
          toast.error('Error obteniendo eventos del calendario');
        }
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [accessToken, refresh]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Calendario
      </Typography>

      {loading ? (
        <Typography>Cargando calendario…</Typography>
      ) : (
        <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 380 }}
            views={['month', 'week', 'day', 'agenda']}
            messages={{
              next: 'Sig',
              previous: 'Ant',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
            }}
            eventPropGetter={eventStyleGetter}
          />
        </Box>
      )}

      {/* ✅ Lista colapsable */}
      <Accordion sx={{ mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Próximos eventos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {events.length === 0 ? (
            <Typography>No hay eventos (o Calendar no está conectado).</Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {events.slice(0, 15).map(ev => (
                <li key={ev.id}>
                  <strong>{ev.title}</strong> — {ev.start?.toLocaleString?.() || 'Sin fecha'}
                </li>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
