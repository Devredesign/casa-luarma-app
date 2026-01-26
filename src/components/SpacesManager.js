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
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SpacesManager = ({ onSpacesUpdate }) => {
  const [spaces, setSpaces] = useState([]);

  // ✅ SAFE array para evitar map/filter crash
  const spacesArray = useMemo(
    () => (Array.isArray(spaces) ? spaces : []),
    [spaces]
  );

  const safeCallOnSpacesUpdate = (data) => {
    if (typeof onSpacesUpdate === 'function') {
      onSpacesUpdate(data);
    } else if (onSpacesUpdate !== undefined) {
      console.warn('[SpacesManager] onSpacesUpdate NO es función:', onSpacesUpdate);
    }
  };

  const fetchSpaces = useCallback(async () => {
    try {
      const res = await api.get('/spaces');

      // ✅ Garantizar array (evita spaces.map crash)
      const list = Array.isArray(res.data) ? res.data : [];

      setSpaces(list);
      safeCallOnSpacesUpdate(list);
    } catch (err) {
      console.error('Error al obtener espacios:', err);
      toast.error('Error al obtener espacios');
      setSpaces([]);
      safeCallOnSpacesUpdate([]);
    }
  }, []); // no depende de onSpacesUpdate para evitar recreación constante

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const addSpace = async (spaceData) => {
    try {
      const dataToSend = {
        ...spaceData,
        pricePerHour: Number(spaceData.pricePerHour),
        squareMeters: Number(spaceData.squareMeters)
      };

      const response = await api.post('/spaces', dataToSend);
      const newSpace = response.data;

      const updated = [...spacesArray, newSpace];
      setSpaces(updated);
      safeCallOnSpacesUpdate(updated);

      toast.success('Espacio registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar espacio:', error);
      toast.error('Error al registrar espacio');
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
      console.error('Error al eliminar espacio:', error);
      toast.error('Error al eliminar espacio');
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
          {spacesArray.length === 0 ? (
            <Typography>No hay espacios registrados.</Typography>
          ) : (
            <List>
              {spacesArray.map((space) => (
                <ListItem key={space._id} divider>
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
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="eliminar"
                      onClick={() => deleteSpace(space._id)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
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
