// src/components/ClassesManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent
} from '../services/calendarService';
import { initCalendarTokenClient } from '../services/calendarTokenClient';

export default function ClassesManager({
  teachers,
  spaces,
  modalities,
  calendarToken,
  setCalendarToken,
  onClassesUpdate,
  refreshCalendar
}) {
  const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const [classes, setClasses] = useState([]);
  const [editing, setEditing] = useState(null);

  // SAFE arrays (evita .map/.find crashes)
  const classesArray = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const spacesArray = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const teachersArray = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const modalitiesArray = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/classes');
      const list = Array.isArray(res.data) ? res.data : [];
      setClasses(list);
      onClassesUpdate?.(list);
    } catch (err) {
      console.error('Error cargando clases:', err);
      toast.error('Error cargando clases');
      setClasses([]);
      onClassesUpdate?.([]);
    }
  }, [onClassesUpdate]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const saveClass = async (data) => {
    try {
      console.log('Payload a /classes →', data);

      let res;
      let wasEditing = Boolean(editing);

      if (editing) {
        res = await api.patch(`/classes/${editing._id}`, data);
        setEditing(null);
      } else {
        res = await api.post('/classes', data);
      }

      const saved = res.data;

      // ✅ Sincronizar con Calendar (si hay token)
      if (calendarToken) {
        const start = new Date(saved.schedule);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const eventData = {
          summary: saved.title,
          description: '',
          start: { dateTime: start.toISOString(), timeZone: 'America/Costa_Rica' },
          end: { dateTime: end.toISOString(), timeZone: 'America/Costa_Rica' },
        };

        if (saved.isRecurring) {
          const weekday = WEEKDAYS[start.getDay()];
          eventData.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${weekday}`];
        }

        // color: si saved.space es ID, lo buscamos; si es objeto, lo usamos
        const spaceId = typeof saved.space === 'object' ? saved.space?._id : saved.space;
        const selectedSpace = spacesArray.find((s) => s._id === spaceId);

        if (selectedSpace?.color) {
          eventData.colorId = selectedSpace.color.toString();
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
          }
          refreshCalendar?.();
        } catch (error) {
          console.error('Error sincronizando Calendar:', error);
          toast.error('Error sincronizando con Calendar');
        }
      }

      // ✅ Actualizar estado local de forma segura
      const updatedList = wasEditing
        ? classesArray.map((c) => (c._id === saved._id ? saved : c))
        : [...classesArray, saved];

      setClasses(updatedList);
      onClassesUpdate?.(updatedList);

      toast.success(wasEditing ? 'Clase actualizada' : 'Clase registrada');
    } catch (err) {
      console.error('Error guardando clase:', err);
      toast.error('Error guardando clase');
    }
  };

  const deleteClass = async (id, eventId) => {
    try {
      await api.delete(`/classes/${id}`);

      const updated = classesArray.filter((c) => c._id !== id);
      setClasses(updated);
      onClassesUpdate?.(updated);

      toast.success('Clase eliminada de la app');

      if (eventId) {
        let token = calendarToken;

        if (!token) {
          token = await new Promise((res, rej) => {
            const client = initCalendarTokenClient((r) =>
              r?.error ? rej(r) : res(r.access_token)
            );
            client.requestAccessToken();
          });

          setCalendarToken?.(token);
          localStorage.setItem('calendarAccessToken', token);
        }

        await deleteCalendarEvent(token, eventId);
        toast.success('Evento eliminado de Calendar');
        refreshCalendar?.();
      }
    } catch (err) {
      console.error('Error eliminando clase:', err);
      toast.error('Error eliminando clase');
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Clases
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editing ? 'Editar Clase' : 'Nueva Clase'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ClassForm
            initialData={editing}
            onSubmit={saveClass}
            teachers={teachersArray}
            spaces={spacesArray}
            modalities={modalitiesArray}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Clases</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {classesArray.length === 0 ? (
            <Typography>No hay clases registradas.</Typography>
          ) : (
            <List>
              {classesArray.map((c) => {
                const spaceName =
                  (typeof c.space === 'object' && c.space?.name) ||
                  spacesArray.find((s) => s._id === c.space)?.name ||
                  'Sin espacio';

                const modName =
                  c.modality?.name ||
                  modalitiesArray.find((m) => m._id === c.modality)?.name ||
                  '—';

                return (
                  <ListItem key={c._id} divider>
                    <ListItemText
                      primary={`${c.title} — ${spaceName}`}
                      secondary={
                        `Modalidad: ${modName} ` +
                        `| Profesor: ${c.professor || '—'} ` +
                        `| ${c.schedule ? new Date(c.schedule).toLocaleString() : 'Sin horario'}`
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
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
