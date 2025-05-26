// src/components/SpacesManager.js
import React, { useState, useEffect } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SpacesManager = ({ onSpacesUpdate }) => {
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);

  // Obtener espacios
  const fetchSpaces = async () => {
    try {
      const response = await api.get('/spaces');
      setSpaces(response.data || []);
      onSpacesUpdate?.(response.data || []);
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      toast.error('Error al obtener espacios');
    }
  };

  useEffect(fetchSpaces, []);

  // Crear espacio
  const addSpace = async (spaceData) => {
    try {
      const dataToSend = {
        ...spaceData,
        pricePerHour: Number(spaceData.pricePerHour),
        squareMeters: Number(spaceData.squareMeters)
      };
      const response = await api.post('/spaces', dataToSend);
      const newSpace = response.data;
      const updated = [...spaces, newSpace];
      setSpaces(updated);
      onSpacesUpdate?.(updated);
      toast.success('Espacio registrado exitosamente');
      setEditingSpace(null);
    } catch (error) {
      console.error('Error al registrar espacio:', error);
      toast.error('Error al registrar espacio');
    }
  };

  // Actualizar espacio existente
  const updateSpace = async (id, spaceData) => {
    try {
      const dataToSend = {
        ...spaceData,
        pricePerHour: Number(spaceData.pricePerHour),
        squareMeters: Number(spaceData.squareMeters)
      };
      const response = await api.patch(`/spaces/${id}`, dataToSend);
      const updated = spaces.map(s => s._id === id ? response.data : s);
      setSpaces(updated);
      onSpacesUpdate?.(updated);
      setEditingSpace(null);
      toast.success('Espacio actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar espacio:', error);
      toast.error('Error al actualizar espacio');
    }
  };

  // Eliminar espacio
  const deleteSpace = async (id) => {
    try {
      await api.delete(`/spaces/${id}`);
      const updated = spaces.filter(s => s._id !== id);
      setSpaces(updated);
      onSpacesUpdate?.(updated);
      toast.success('Espacio eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar espacio:', error);
      toast.error('Error al eliminar espacio');
    }
  };

  // Cargar espacio para edición
  const handleEdit = (space) => setEditingSpace(space);

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Gestión de Espacios
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {editingSpace ? 'Editar Espacio' : 'Registrar Nuevo Espacio'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SpaceForm
            onAddSpace={addSpace}                          // prop para creación
            onSave={editingSpace ? data => updateSpace(editingSpace._id, data) : undefined} // prop para edición
            initialData={editingSpace || undefined}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Espacios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {spaces.length === 0 ? (
            <Typography>No hay espacios registrados.</Typography>
          ) : (
            <List>
              {spaces.map(space => (
                <ListItem key={space._id} divider>
                  <ListItemText
                    primary={space.name}
                    secondary={
                      `Precio por hora: ${space.pricePerHour} | Metros cuadrados: ${space.squareMeters} | Color: ${space.color}`
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEdit(space)} sx={{ mr: 1 }}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton edge="end" onClick={() => deleteSpace(space._id)}>
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
