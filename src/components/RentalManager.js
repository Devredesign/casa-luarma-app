// src/components/RentalManager.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RentalForm from './RentalForm';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendarService';
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
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

// Formatea fecha local a 'YYYY-MM-DDTHH:mm:ss'
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

  // Carga inicial de alquileres
  const fetchRentals = async () => {
    try {
      const res = await api.get('/rentals');
      setRentals(res.data || []);
      onRentalsUpdate?.(res.data || []);
    } catch (err) {
      console.error('Error al obtener alquileres:', err);
      toast.error('Error al obtener alquileres');
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Registrar nuevo alquiler
  const addRental = async (rentalData) => {
    try {
      const res = await api.post('/rentals', rentalData);
      const newRental = res.data;

      if (calendarToken) {
        const startDate = new Date(rentalData.startTime);
        const endDate = new Date(startDate.getTime() + Number(rentalData.hours) * 3600000);
        const days = ['SU','MO','TU','WE','TH','FR','SA'];
        const dow = days[startDate.getDay()];

        const selectedSpace = spaces.find(
          (s) => s._id?.toString() === rentalData.space?.toString()
        );
        const colorId = selectedSpace?.color ? String(selectedSpace.color) : undefined;

        const eventData = {
          summary: rentalData.activityName,
          description: `Alquiler de ${selectedSpace?.name || rentalData.space} por ${rentalData.tenantName}`,
          start: { dateTime: formatLocalDateTime(startDate), timeZone: 'America/Costa_Rica' },
          end:   { dateTime: formatLocalDateTime(endDate),   timeZone: 'America/Costa_Rica' },
          ...(rentalData.isRecurring && { recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${dow}`] }),
          ...(colorId && { colorId }),
        };

        try {
          const createdEvent = await createCalendarEvent(calendarToken, eventData);
          toast.success('Evento creado en Google Calendar');
          await api.patch(`/rentals/${newRental._id}`, { eventId: createdEvent.id });
          newRental.eventId = createdEvent.id;
          onEventSynced?.();
        } catch (e) {
          console.error('Error creando evento en Calendar:', e);
          toast.error('No se pudo crear evento en Calendar');
        }
      } else {
        toast.info('Alquiler guardado, falta conectar Calendar');
      }

      const updated = [...rentals, newRental];
      setRentals(updated);
      onRentalsUpdate?.(updated);
      toast.success('Alquiler registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar alquiler:', err);
      toast.error('Error al registrar alquiler');
    }
  };

  // Eliminar alquiler + borrar evento en Calendar
  const deleteRental = async (rentalId, eventId) => {
    try {
      await api.delete(`/rentals/${rentalId}`);
      const filtered = rentals.filter((r) => r._id !== rentalId);
      setRentals(filtered);
      onRentalsUpdate?.(filtered);
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
          onEventSynced?.();
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
        Gestión de Alquileres
      </Typography>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Registrar Alquiler</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RentalForm onAddRental={addRental} spaces={spaces} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
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
