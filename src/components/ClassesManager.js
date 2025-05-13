// src/components/ClassesManager.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ClassForm from './ClassForm';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon     from '@mui/icons-material/ExpandMore';
import DeleteIcon     from '@mui/icons-material/Delete';
import { toast }      from 'react-toastify';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent
} from '../services/calendarService';
import { initCalendarTokenClient } from '../services/calendarTokenClient';

export default function ClassesManager({
  teachers,
  spaces,
  modalities,        // 🔥 asegúrate de recibir también esto
  calendarToken,
  setCalendarToken,
  onClassesUpdate,
  refreshCalendar
}) {
  const WEEKDAYS = ['SU','MO','TU','WE','TH','FR','SA'];
  const [classes, setClasses] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/classes');
        setClasses(res.data);
        onClassesUpdate?.(res.data);
      } catch {
        toast.error('Error cargando clases');
      }
    }
    fetch();
  }, []);

  const saveClass = async data => {
    try {
      console.log(' Payload a POST /classes →', data);
      // 1) Declaro res y saved
      let res;
    if (editing) {
      res = await api.patch(`/classes/${editing._id}`, data);
      setEditing(null);
    } else {
      res = await api.post('/classes', data);
    }
    const saved = res.data;

      // Sincronizar con Calendar (igual que antes)...
      if (calendarToken) {
        const start = new Date(saved.schedule);
        const end   = new Date(start.getTime() + 60 * 60 * 1000);
        const colorId = saved.space?.color?.toString();
        const eventData = {
          summary:     saved.title,
          description: '',
          start:       { dateTime: start.toISOString(), timeZone: 'America/Costa_Rica' },
          end:         { dateTime: end.toISOString(),   timeZone: 'America/Costa_Rica' },
          ...(colorId ? { colorId } : {}),
        };
        if (saved.isRecurring) {
                // Día de la semana según la fecha
                const weekday = WEEKDAYS[start.getDay()];
                eventData.recurrence = [
                  `RRULE:FREQ=WEEKLY;BYDAY=${weekday}`
                ];
              }
        const selectedSpace = spaces.find(s => s._id === saved.space);
             if (selectedSpace?.color) {
               eventData.colorId = selectedSpace.color;
             }
        try {
          if (saved.eventId) {
            await updateCalendarEvent(calendarToken, saved.eventId, eventData);
            toast.success('Evento actualizado en Calendar');
          } else {
            const ev = await createCalendarEvent(calendarToken, eventData);
            await api.patch(`/classes/${saved._id}`, { eventId: ev.id });
            saved.eventId = ev.id;
            toast.success('Evento creado en Calendar');
            toast.success(editing ? 'Clase actualizada' : 'Clase registrada');
          }
          refreshCalendar?.();
        } catch (error) {
          if (error.response) {
            console.error('❌ HTTP', error.response.status);
            console.error('❌ response.data:', error.response.data);
            toast.error(
              error.response.data.message ||
              'Error de validación guardando la clase'
            );
          } else {
            console.error('⚠️ Error inesperado:', error);
            toast.error('Error guardando clase (sin respuesta del servidor)');
          }
        }
      };

      // Actualizar estado local
      const updatedList = editing
        ? classes.map(c => (c._id === saved._id ? saved : c))
        : [...classes, saved];
      setClasses(updatedList);
      onClassesUpdate?.(updatedList);
      toast.success(editing ? 'Clase actualizada' : 'Clase registrada');
    } catch {
      toast.error('Error guardando clase');
    }
  };

  const deleteClass = async (id, eventId) => {
    try {
      await api.delete(`/classes/${id}`);
      setClasses(cs => cs.filter(c => c._id !== id));
      toast.success('Clase eliminada de la app');

      if (eventId) {
        let token = calendarToken;
        if (!token) {
          token = await new Promise((res, rej) => {
            const client = initCalendarTokenClient(r => r.error ? rej(r) : res(r.access_token));
            client.requestAccessToken();
          });
          setCalendarToken(token);
          localStorage.setItem('calendarAccessToken', token);
        }
        await deleteCalendarEvent(token, eventId);
        toast.success('Evento eliminado de Calendar');
        refreshCalendar?.();
      }
    } catch {
      toast.error('Error eliminando clase');
    }
  };
  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Gestión de Clases
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editing ? 'Editar Clase' : 'Nueva Clase'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ClassForm
            initialData={editing}
            onSubmit={saveClass}
            teachers={teachers}
            spaces={spaces}
            modalities={modalities}    // ← pásalo aquí también
          />
        </AccordionDetails>
      </Accordion>   

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Clases</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
          {classes.map(c => {
            // Si c.space es un objeto (populate), úsalo; si es sólo un ID, búscalo en spaces[]
            const spaceName =
              // 1) si c.space ya es objeto con .name
              (typeof c.space === 'object' && c.space?.name)
              // 2) si c.space es ID, lo buscamos en el array
              || spaces.find(s => s._id === c.space)?.name
              // 3) fallback
              || 'Sin espacio';

            const modName = c.modality?.name || '—';
            return (
              <ListItem key={c._id} divider>
                <ListItemText
                  primary={`${c.title} — ${spaceName}`}
                  secondary={
                    `Modalidad: ${modName} ` +
                    `| Profesor: ${c.professor} ` +
                    `| ${new Date(c.schedule).toLocaleString()}`
                  }
                  />
                  <IconButton onClick={() => setEditing(c)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton onClick={() => deleteClass(c._id, c.eventId)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}


