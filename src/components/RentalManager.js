// src/components/RentalManager.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import RentalForm from './RentalForm';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,   // asegúrate de tener esto si lo usas
} from '../services/calendarService';
import { initCalendarTokenClient } from '../services/calendarTokenClient';
import { toast } from 'react-toastify';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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

const RentalManager = ({
  spaces = [],
  onRentalsUpdate,
  calendarToken,
  setCalendarToken,
  onEventSynced,
}) => {
  const [rentals, setRentals] = useState([]);
  const [editingRental, setEditingRental] = useState(null);

  const safeCallOnRentalsUpdate = (data) => {
    if (typeof onRentalsUpdate === 'function') {
      onRentalsUpdate(data);
    } else if (onRentalsUpdate !== undefined) {
      console.warn('[RentalManager] onRentalsUpdate NO es función:', onRentalsUpdate);
    }
  };

  const safeCallOnEventSynced = () => {
    if (typeof onEventSynced === 'function') {
      onEventSynced();
    }
  };

  // Carga inicial de alquileres
  const fetchRentals = async () => {
    try {
      const res = await api.get('/rentals');
      const data = res.data || [];
      setRentals(data);
      safeCallOnRentalsUpdate(data);
    } catch (err) {
      console.error('Error al obtener alquileres:', err);
      toast.error('Error al obtener alquileres');
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Guardar (crear o actualizar) alquiler
  const saveRental = async (rentalData) => {
    try {
      let res;
      if (editingRental) {
        // EDITAR
        res = await api.patch(`/rentals/${editingRental._id}`, rentalData);
      } else {
        // CREAR
        res = await api.post('/rentals', rentalData);
      }
      const saved = res.data;

      // --- Google Calendar ---
      if (calendarToken) {
        const startDate = new Date(rentalData.startTime || saved.startTime);
        const endDate = new Date(
          startDate.getTime() +
          Number(rentalData.hours ?? saved.hours) * 3600000
        );
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const dow = days[startDate.getDay()];

        const selectedSpace = spaces.find(
          (s) => s._id?.toString() === (rentalData.space || saved.space)?.toString()
        );
        const colorId = selectedSpace?.color ? String(selectedSpace.color) : undefined;

        const eventData = {
          summary: rentalData.activityName || saved.activityName,
          description: `Alquiler de ${selectedSpace?.name || 'Espacio'} por ${rentalData.tenantName || saved.tenantName}`,
          start: { dateTime: formatLocalDateTime(startDate), timeZone: 'America/Costa_Rica' },
          end: { dateTime: formatLocalDateTime(endDate), timeZone: 'America/Costa_Rica' },
          ...(rentalData.isRecurring || saved.isRecurring
            ? { recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${dow}`] }
            : {}),
          ...(colorId && { colorId }),
        };

        try {
          if (saved.eventId) {
            await updateCalendarEvent(calendarToken, saved.eventId, eventData);
            toast.success('Evento actualizado en Google Calendar');
          } else {
            const createdEvent = await createCalendarEvent(calendarToken, eventData);
            await api.patch(`/rentals/${saved._id}`, { eventId: createdEvent.id });
            toast.success('Evento creado en Google Calendar');
          }
          safeCallOnEventSynced();
        } catch (e) {
          console.error('Error creando/actualizando evento en Calendar:', e);
          toast.error('No se pudo sincronizar con Google Calendar');
        }
      } else {
        toast.info('Alquiler guardado, falta conectar Calendar');
      }

      // Actualizar estado local
      const updatedList = editingRental
        ? rentals.map((r) => (r._id === saved._id ? saved : r))
        : [...rentals, saved];

      setRentals(updatedList);
      safeCallOnRentalsUpdate(updatedList);
      setEditingRental(null);
      toast.success(editingRental ? 'Alquiler actualizado' : 'Alquiler registrado exitosamente');
    } catch (err) {
      console.error('Error al guardar alquiler:', err);
      toast.error('Error al guardar alquiler');
    }
  };

  // Eliminar alquiler + borrar evento en Calendar
  const deleteRental = async (rentalId, eventId) => {
    try {
      await api.delete(`/rentals/${rentalId}`);
      const filtered = rentals.filter((r) => r._id !== rentalId);
      setRentals(filtered);
      safeCallOnRentalsUpdate(filtered);
      toast.success('Alquiler eliminado de la app');

      if (eventId) {
        let token = calendarToken;
        if (!token) {
          token = await new Promise((resolve, reject) => {
            const client = initCalendarTokenClient((resp) => {
              resp.error ? reject(resp) : resolve(resp.access_token);
            });
            client.requestAccessToken();
          });
          setCalendarToken(token);
          localStorage.setItem('calendarAccessToken', token);
        }
        try {
          await deleteCalendarEvent(token, eventId);
          toast.success('Evento borrado de Google Calendar');
          safeCallOnEventSynced();
        } catch (e) {
          console.error('Error borrando evento en Calendar:', e);
          toast.error('No se pudo borrar evento en Calendar');
        }
      }
    } catch (err) {
      console.error('Error eliminando alquiler:', err);
      toast.error('Error al eliminar alquiler');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Alquileres
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editingRental ? 'Editar Alquiler' : 'Registrar Alquiler'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RentalForm
            onSave={saveRental}
            spaces={spaces}
            initialData={editingRental}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Alquileres</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {rentals.length === 0 ? (
            <Typography>No hay alquileres registrados.</Typography>
          ) : (
            <List>
              {rentals.map((r) => {
                const selectedSpace = spaces.find(
                  (s) => s._id?.toString() === r.space?.toString()
                );
                const spaceName = selectedSpace ? selectedSpace.name : 'Sin espacio asignado';
                return (
                  <ListItem key={r._id} divider>
                    <ListItemText
                      primary={`${r.activityName} — ${spaceName}`}
                      secondary={`Arrendatario: ${r.tenantName} | Horas: ${r.hours}`}
                    />
                    <IconButton onClick={() => setEditingRental(r)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="eliminar"
                      onClick={() => deleteRental(r._id, r.eventId)}
                    >
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
};

export default RentalManager;
