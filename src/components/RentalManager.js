// src/components/RentalManager.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RentalForm from './RentalForm';
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '../services/calendarService';
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
import EditIcon from '@mui/icons-material/Edit';

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
  const [editingRental, setEditingRental] = useState(null);

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

  // Crear o actualizar alquiler
  const saveRental = async (rentalData) => {
    try {
      let res;
      if (editingRental) {
        res = await api.patch(`/rentals/${editingRental._id}`, rentalData);
      } else {
        res = await api.post('/rentals', rentalData);
      }
      const saved = res.data;

      // Calendar logic if token present
      if (calendarToken) {
        const startDate = new Date(rentalData.startTime);
        const endDate = new Date(startDate.getTime() + Number(rentalData.hours) * 3600000);
        const days = ['SU','MO','TU','WE','TH','FR','SA'];
        const dow = days[startDate.getDay()];
        const selectedSpace = spaces.find(s => s._id?.toString() === rentalData.space?.toString());
        const colorId = selectedSpace?.color ? String(selectedSpace.color) : undefined;
        const eventData = {
          summary: saved.activityName,
          description: `Alquiler de ${selectedSpace?.name} por ${saved.tenantName}`,
          start: { dateTime: formatLocalDateTime(startDate), timeZone: 'America/Costa_Rica' },
          end:   { dateTime: formatLocalDateTime(endDate),   timeZone: 'America/Costa_Rica' },
          ...(rentalData.isRecurring && { recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${dow}`] }),
          ...(colorId && { colorId }),
        };
        try {
          if (saved.eventId) {
            // Update existing event
            await updateCalendarEvent(calendarToken, saved.eventId, eventData);
            toast.success('Evento actualizado en Google Calendar');
          } else {
            const ev = await createCalendarEvent(calendarToken, eventData);
            await api.patch(`/rentals/${saved._id}`, { eventId: ev.id });
            saved.eventId = ev.id;
            toast.success('Evento creado en Google Calendar');
          }
          onEventSynced?.();
        } catch (e) {
          console.error('Error en Calendar:', e);
          toast.error('Error sincronizando con Calendar');
        }
      }

      // Actualizar estado
      const updated = editingRental
        ? rentals.map(r => r._id === saved._id ? saved : r)
        : [...rentals, saved];
      setRentals(updated);
      onRentalsUpdate?.(updated);
      setEditingRental(null);
      toast.success(editingRental ? 'Alquiler actualizado' : 'Alquiler registrado');
    } catch (err) {
      console.error('Error al guardar alquiler:', err);
      toast.error('Error al guardar alquiler');
    }
  };

  // Eliminar alquiler + borrar evento en Calendar
  const deleteRental = async (rentalId, eventId) => {
    try {
      await api.delete(`/rentals/${rentalId}`);
      const filtered = rentals.filter(r => r._id !== rentalId);
      setRentals(filtered);
      onRentalsUpdate?.(filtered);
      toast.success('Alquiler eliminado de la app');

      if (eventId) {
        let token = calendarToken || await new Promise((res, rej) => {
          const client = initCalendarTokenClient(r => r.error ? rej(r) : res(r.access_token));
          client.requestAccessToken();
        });
        setCalendarToken(token);
        localStorage.setItem('calendarAccessToken', token);
        try {
          await deleteCalendarEvent(token, eventId);
          toast.success('Evento borrado de Google Calendar');
          onEventSynced?.();
        } catch (e) {
          console.error('Error borrando evento:', e);
          toast.error('Error eliminando evento de Calendar');
        }
      }
    } catch (err) {
      console.error('Error eliminando alquiler:', err);
      toast.error('Error al eliminar alquiler');
    }
  };

  // Preparar edición
  const handleEdit = (r) => {
    setEditingRental(r);
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Gestión de Alquileres
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editingRental ? 'Editar Alquiler' : 'Registrar Alquiler'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RentalForm
            onAddRental={saveRental}
            initialData={editingRental}
            spaces={spaces}
          />
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Alquileres</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {rentals.length === 0 ? (
            <Typography>No hay alquileres registrados.</Typography>
          ) : (
            <List>
              {rentals.map(r => {
                const selectedSpace = spaces.find(s => s._id?.toString() === r.space?.toString());
                const spaceName = selectedSpace?.name || 'Sin espacio asignado';
                return (
                  <ListItem key={r._id} divider>
                    <ListItemText
                      primary={`${r.activityName} — ${spaceName}`}
                      secondary={`Arrendatario: ${r.tenantName} | Horas: ${r.hours}`}
                    />
                    <IconButton onClick={() => handleEdit(r)} sx={{ mr: 1 }}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => deleteRental(r._id, r.eventId)}>
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
