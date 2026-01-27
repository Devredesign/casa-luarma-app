// src/components/SpacesManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import SpaceForm from './SpaceForm';
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
  Button,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Helper: intenta sacar un array de muchas formas comunes
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.spaces)) return payload.spaces;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const SpacesManager = ({ onSpacesUpdate }) => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ SAFE array para evitar map/filter crash
  const spacesArray = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);

  const safeCallOnSpacesUpdate = useCallback(
    (data) => {
      if (typeof onSpacesUpdate === 'function') onSpacesUpdate(data);
    },
    [onSpacesUpdate]
  );

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/spaces');

      // 🔍 DEBUG: ver qué está llegando realmente
      console.log('[SpacesManager] GET /spaces status:', res?.status);
      console.log('[SpacesManager] GET /spaces res.data:', res?.data);

      const list = normalizeList(res?.data);

      setSpaces(list);
      safeCallOnSpacesUpdate(list);

      if (!list.length) {
        // Esto ayuda a saber si "no carga" porque viene vacío o porque falla
        console.warn('[SpacesManager] lista vacía. Revisa si el endpoint devuelve array o {spaces:[...]}.');
      }
    } catch (err) {
      console.error('[SpacesManager] Error al obtener espacios:', err);

      // Mostrar algo útil si es error de auth / server
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error al obtener espacios';

      toast.error(msg);

      setSpaces([]);
      safeCallOnSpacesUpdate([]);
    } finally {
      setLoading(false);
    }
  }, [safeCallOnSpacesUpdate]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const addSpace = async (spaceData) => {
    try {
      const dataToSend = {
        ...spaceData,
        pricePerHour: Number(spaceData.pricePerHour),
        squareMeters: Number(spaceData.squareMeters),
      };

      const response = await api.post('/spaces', dataToSend);
      const newSpace = response?.data;

      // Si el backend devuelve el objeto creado ok; si devuelve wrapper, intentamos normalizar
      const created = (newSpace && typeof newSpace === 'object' && !Array.isArray(newSpace))
        ? newSpace
        : null;

      if (!created?._id) {
        // Si no viene bien, mejor refrescar desde backend
        toast.info('Espacio guardado. Refrescando lista…');
        await fetchSpaces();
        return;
      }

      const updated = [...spacesArray, created];
      setSpaces(updated);
      safeCallOnSpacesUpdate(updated);

      toast.success('Espacio registrado exitosamente');
    } catch (error) {
      console.error('[SpacesManager] Error al registrar espacio:', error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Error al registrar espacio';
      toast.error(msg);
    }
  };

  const deleteSpace = async (id) => {
    try {
      await api.delete(`/spaces/${id}`);

      const updatedSpaces = spacesArray.filter((space) => space._id !== id);
      setSpaces(updatedSpaces);
      safeCallOnSpacesUpdate(updatedSpaces);

      toast.success('Espacio eliminado exitosamente');
    } catch (error) {
      console.error('[SpacesManager] Error al eliminar espacio:', error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Error al eliminar espacio';
      toast.error(msg);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Espacios
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Registrar Nuevo Espacio</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SpaceForm onSave={addSpace} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Espacios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={fetchSpaces} disabled={loading}>
              {loading ? 'Cargando…' : 'Reintentar'}
            </Button>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Total: {spacesArray.length}
            </Typography>
          </Box>

          {spacesArray.length === 0 ? (
            <Typography>
              {loading ? 'Cargando espacios…' : 'No hay espacios registrados (o el endpoint está devolviendo otro formato).'}
            </Typography>
          ) : (
            <List>
              {spacesArray.map((space) => (
                <ListItem
                  key={space._id || `${space.name}-${Math.random()}`}
                  divider
                  secondaryAction={
                    <IconButton edge="end" aria-label="eliminar" onClick={() => deleteSpace(space._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={space.name || 'Sin nombre'}
                    secondary={
                      <>
                        Precio por hora: {Number(space.pricePerHour || 0).toLocaleString()} |{' '}
                        Metros cuadrados: {Number(space.squareMeters || 0).toLocaleString()} |{' '}
                        Color: {space.color || '—'}
                        <br />
                        {space.description || ''}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default SpacesManager;
