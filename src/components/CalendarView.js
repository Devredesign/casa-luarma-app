// src/components/CalendarView.js
import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import localizer from '../services/calendarLocalizer';
import { listUpcomingEvents } from '../services/calendarService';
import { requestGoogleAccessToken } from '../services/googleAuth';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Typography } from '@mui/material';
import useEventReminders from '../hooks/useEventReminders';

// Función que mapea el colorId a un estilo
const eventStyleGetter = (event) => {
  const colorMapping = {
    "1": "#a4bdfc",
    "2": "#7ae7bf",
    "3": "#dbadff",
    "4": "#ff887c",
    "5": "#fbd75b",
    "6": "#ffb878",
    "7": "#46d6db",
    "8": "#e1e1e1",
    "9": "#5484ed",
    "10": "#51b749",
    "11": "#dc2127"
  };

  const backgroundColor = event.colorId ? (colorMapping[event.colorId] || '#3174ad') : '#3174ad';

  return {
    style: {
      backgroundColor,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'black',
      border: '0px',
      display: 'block'
    }
  };
};

// Mensajes en español para el calendario
const messages = {
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Todo el día',
  week: 'Semana',
  work_week: 'Semana laboral',
  day: 'Día',
  month: 'Mes',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  agenda: 'Agenda',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: total => `+ Ver más (${total})`
};

const CalendarView = ({ accessToken, refresh }) => {
  const [events, setEvents] = useState([]);

  const transformEvents = (googleEvents) => {
    return (Array.isArray(googleEvents) ? googleEvents : []).map((event) => {
      const start = new Date(event.start?.dateTime || event.start?.date);
      const end = new Date(event.end?.dateTime || event.end?.date);
      return {
        title: event.summary || 'Sin título',
        start,
        end,
        description: event.description || '',
        colorId: event.colorId
      };
    });
  };

  const getValidAccessToken = useCallback(async () => {
    // 1) preferir el token guardado (access token real)
    let token = localStorage.getItem('google_access_token');

    // 2) si no hay, intentar usar el prop (solo si existe)
    if (!token && accessToken) token = accessToken;

    // 3) si sigue sin existir, pedir uno nuevo
    if (!token) {
      token = await requestGoogleAccessToken();
      localStorage.setItem('google_access_token', token);
    }
console.log("Access token obtenido?", !!token, "len:", token?.length);
    return token;
  }, [accessToken]);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      const token = await getValidAccessToken();
      const googleEvents = await listUpcomingEvents(token);
      const transformed = transformEvents(googleEvents);
      setEvents(transformed);
    } catch (error) {
      console.error('Error obteniendo eventos del calendario:', error);

      // si el token expiró o quedó inválido, lo borramos para forzar refresh
      if (String(error?.message || '').includes('401')) {
        localStorage.removeItem('google_access_token');
      }
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents, refresh]);

  useEventReminders(events);

  return (
    <div style={{ height: 600, margin: '0px 0' }}>
      <Typography variant="h5" gutterBottom>
        Calendario
      </Typography>

      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={['month', 'week', 'day']}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        eventPropGetter={eventStyleGetter}
        style={{ height: '90%' }}
        step={60}
        timeslots={1}
      />
    </div>
  );
};

export default CalendarView;
