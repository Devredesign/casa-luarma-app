import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import RentalForm from './RentalForm';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

import * as calendarService from '../services/calendarService';
import { getCalendarAccessToken } from '../services/calendarAuth';

function getRentalDate(r) {
  const raw =
    r?.startDateTime ||
    r?.start ||
    r?.startDate ||
    r?.startTime ||
    r?.date ||
    r?.rentalDate ||
    r?.createdAt;

  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeNumbers(payload) {
  const numericKeys = ['amount', 'price', 'total', 'deposit', 'hours'];
  const out = { ...payload };

  numericKeys.forEach((k) => {
    if (out[k] !== undefined && out[k] !== null && out[k] !== '') {
      const n = Number(out[k]);
      if (Number.isFinite(n)) out[k] = n;
    }
  });

  return out;
}

export default function RentalManager({
  quick = false,
  spaces = [],
  calendarToken,
  setCalendarToken,
  onRentalsUpdate,
  onEventSynced
}) {
  const [rentals, setRentals] = useState([]);
  const [filters, setFilters] = useState({ month: '', year: '' });

  const rentalsArr = useMemo(() => (Array.isArray(rentals) ? rentals : []), [rentals]);
  const spacesArr = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);

  const fetchRentals = useCallback(async () => {
    try {
      const res = await api.get('/rentals');
      const list = Array.isArray(res.data) ? res.data : [];
      setRentals(list);
      onRentalsUpdate?.(list);
    } catch (err) {
      console.error('Error cargando alquileres:', err);
      toast.error('Error cargando alquileres');
      setRentals([]);
      onRentalsUpdate?.([]);
    }
  }, [onRentalsUpdate]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const clearFilters = () => setFilters({ month: '', year: '' });

  const years = useMemo(() => {
    const ys = new Set();
    rentalsArr.forEach((r) => {
      const d = getRentalDate(r);
      if (d) ys.add(d.getFullYear());
    });
    return Array.from(ys).sort((a, b) => b - a);
  }, [rentalsArr]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const filteredRentals = useMemo(() => {
    return rentalsArr.filter((r) => {
      const d = getRentalDate(r);
      if (!d) return true;

      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      let ok = true;
      if (filters.month) ok = ok && m === Number(filters.month);
      if (filters.year) ok = ok && y === Number(filters.year);
      return ok;
    });
  }, [rentalsArr, filters]);

  const ensureCalendarToken = useCallback(async () => {
    if (calendarToken) return calendarToken;

    try {
      const t = await getCalendarAccessToken({ interactiveFallback: false });
      if (t) {
        setCalendarToken?.(t);
        return t;
      }
    } catch {
      // ok
    }
    return null;
  }, [calendarToken, setCalendarToken]);

  const addRental = async (data) => {
    console.log('[RentalManager] addRental called with:', data);

    try {
      let payload = normalizeNumbers(data);

      payload.space = payload.space ?? payload.spaceId;
      payload.spaceId = payload.spaceId ?? payload.space;

      payload.startDateTime =
        payload.startDateTime ??
        payload.startTime ??
        payload.start ??
        payload.startDate;

      payload.endDateTime =
        payload.endDateTime ??
        payload.endTime ??
        payload.end ??
        payload.endDate;

      const hours = Number(payload.hours);

      if (payload.startDateTime && !payload.endDateTime && Number.isFinite(hours) && hours > 0) {
        const start = new Date(payload.startDateTime);
        if (!Number.isNaN(start.getTime())) {
          payload.endDateTime = new Date(start.getTime() + hours * 60 * 60 * 1000).toISOString();
        }
      }

      // ✅ si amount viene 0/undefined, recalcular SIEMPRE con pricePerHour
      const spaceObj = spacesArr.find(s => s._id === payload.space) || null;
      const pph = Number(spaceObj?.pricePerHour ?? spaceObj?.hourlyRate ?? 0);

      const shouldRecalc = !Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0;
      if (shouldRecalc && Number.isFinite(pph) && pph > 0 && Number.isFinite(hours) && hours > 0) {
        payload.amount = Math.round(pph * hours);
      }

      if (!payload.space) {
        toast.error('Seleccioná un espacio');
        return;
      }
      if (!payload.startDateTime) {
        toast.error('Seleccioná fecha y hora de inicio');
        return;
      }

      const res = await api.post('/rentals', payload);

      const updated = [...rentalsArr, res.data];
      setRentals(updated);
      onRentalsUpdate?.(updated);
      toast.success('Alquiler registrado');

      const startRaw =
        res.data?.startDateTime ||
        res.data?.startTime ||
        res.data?.start ||
        payload?.startDateTime;

      const endRaw =
        res.data?.endDateTime ||
        res.data?.end ||
        payload?.endDateTime;

      if (startRaw && calendarService?.createCalendarEvent) {
        const token = await ensureCalendarToken();
        if (token) {
          try {
            const start = new Date(startRaw);
            const end = endRaw ? new Date(endRaw) : new Date(start.getTime() + 60 * 60 * 1000);

            const spaceId = res.data?.space || payload?.spaceId || payload?.space;
            const spaceName =
              (typeof spaceId === 'object' && spaceId?.name) ||
              spacesArr.find((s) => s._id === spaceId)?.name ||
              'Espacio';

            const eventData = {
              summary: `Alquiler — ${spaceName}`,
              start: { dateTime: start.toISOString(), timeZone: 'America/Costa_Rica' },
              end: { dateTime: end.toISOString(), timeZone: 'America/Costa_Rica' }
            };

            const ev = await calendarService.createCalendarEvent(token, eventData);

            if (ev?.id) {
              try {
                await api.patch(`/rentals/${res.data._id}`, { eventId: ev.id });
              } catch {
                // ok
              }
            }

            onEventSynced?.();
          } catch (e) {
            console.warn('No se pudo sincronizar alquiler en Calendar (no bloquea):', e);
          }
        }
      }
    } catch (err) {
      console.error('Error registrando alquiler:', err?.response?.data || err);
      toast.error('Error registrando alquiler');
    }
  };

  const deleteRental = async (id, eventId) => {
    try {
      await api.delete(`/rentals/${id}`);

      const updated = rentalsArr.filter((r) => r._id !== id);
      setRentals(updated);
      onRentalsUpdate?.(updated);

      toast.success('Alquiler eliminado');

      if (eventId && calendarService?.deleteCalendarEvent) {
        const token = await ensureCalendarToken();
        if (token) {
          try {
            await calendarService.deleteCalendarEvent(token, eventId);
            onEventSynced?.();
          } catch (e) {
            console.warn('No se pudo borrar evento de Calendar (no bloquea):', e);
          }
        }
      }
    } catch (err) {
      console.error('Error eliminando alquiler:', err);
      toast.error('Error eliminando alquiler');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Alquileres
      </Typography>

      <Accordion defaultExpanded={quick}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Registrar Alquiler</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RentalForm
            spaces={spacesArr}
            quick={quick}
            onAddRental={addRental}
            onSubmit={addRental}
            onSave={addRental}
          />
        </AccordionDetails>
      </Accordion>

      {!quick && (
        <Accordion sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Listado de Alquileres</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mes</InputLabel>
                  <Select name="month" value={filters.month} onChange={handleFilterChange} label="Mes">
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {months.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Año</InputLabel>
                  <Select name="year" value={filters.year} onChange={handleFilterChange} label="Año">
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" onClick={clearFilters}>Limpiar filtros</Button>
              </Grid>
            </Grid>

            {filteredRentals.length === 0 ? (
              <Typography>No hay alquileres con esos filtros.</Typography>
            ) : (
              <List>
                {filteredRentals.map((r) => {
                  const d = getRentalDate(r);
                  const dateLabel = d ? d.toLocaleString() : 'Sin fecha';

                  const spaceId = typeof r.space === 'object' ? r.space?._id : (r.space || r.spaceId);
                  const spaceObj = spacesArr.find((s) => s._id === spaceId) || null;

                  const spaceName =
                    (typeof r.space === 'object' && r.space?.name) ||
                    spaceObj?.name ||
                    'Sin espacio';

                  // ✅ fallback: si amount viene 0/undefined, recalculamos en display
                  const hours = Number(r.hours ?? 0);
                  const pph = Number(spaceObj?.pricePerHour ?? spaceObj?.hourlyRate ?? 0);
                  const computed = (Number.isFinite(hours) && Number.isFinite(pph)) ? (hours * pph) : 0;

                  const rawAmount = r.amount ?? r.price ?? r.total;
                  const amountNum = Number(rawAmount);
                  const amount = (Number.isFinite(amountNum) && amountNum > 0) ? amountNum : computed;

                  return (
                    <ListItem
                      key={r._id}
                      divider
                      secondaryAction={
                        <IconButton edge="end" aria-label="eliminar" onClick={() => deleteRental(r._id, r.eventId)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${spaceName} — ₡${Number(amount || 0).toLocaleString()}`}
                        secondary={`Fecha: ${dateLabel}${hours ? ` | Horas: ${hours}` : ''}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
