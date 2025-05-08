// src/components/CalendarView.js
import React, { useEffect, useState } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import localizer from '../services/calendarLocalizer';
import { listUpcomingEvents } from '../services/calendarService';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Typography } from '@mui/material';
import useEventReminders from '../hooks/useEventReminders';

// Funciones auxiliares para formatear la fecha en "YYYY-MM-DDTHH:mm:ss"
const pad = (num) => String(num).padStart(2, '0');

const formatLocalDateTime = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Función que mapea el colorId a un estilo (usada en eventPropGetter)
const eventStyleGetter = (event, start, end, isSelected) => {
  // Mapeo de colorId a colores (ajusta según tus preferencias y los valores permitidos por Google Calendar)
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

  // Se utiliza un color por defecto si no existe colorId o no se encuentra en el mapeo
  const backgroundColor = event.colorId ? colorMapping[event.colorId] || '#3174ad' : '#3174ad';
  const style = {
    backgroundColor,
    borderRadius: '0px',
    opacity: 0.8,
    color: 'black',
    border: '0px',
    display: 'block'
  };

  return { style };
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

  // Función para transformar los eventos recibidos desde Google Calendar
  const transformEvents = (googleEvents) => {
    return googleEvents.map((event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      return {
        title: event.summary || 'Sin título',
        start,
        end,
        description: event.description || '',
        colorId: event.colorId // Conserva el colorId si existe
      };
    });
  };

  // Función para obtener eventos desde Google Calendar
  const fetchCalendarEvents = async () => {
    try {
      const googleEvents = await listUpcomingEvents(accessToken);
      console.log("Eventos recibidos:", googleEvents);
      const transformed = transformEvents(googleEvents);
      setEvents(transformed);
    } catch (error) {
      console.error("Error obteniendo eventos del calendario:", error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCalendarEvents();
    }
  }, [accessToken, refresh]);

  // (Opcional) Hook para recordatorios de eventos
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
        eventPropGetter={eventStyleGetter}  // Se aplica la función para asignar estilos
        style={{ height: '90%' }}
        step={60}            // Cada franja de 60 minutos en lugar de 30
        timeslots={1}        // Un solo hueco por step
      />
    </div>
  );
};

export default CalendarView;


