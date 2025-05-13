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

  // Función para obtener los espacios del backend
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

  useEffect(() => {
    fetchSpaces();
  }, []);

  // Función para agregar un nuevo espacio
  const addSpace = async (spaceData) => {
    try {
      const dataToSend = {
        ...spaceData,
        pricePerHour: Number(spaceData.pricePerHour),
        squareMeters: Number(spaceData.squareMeters)
      };

      const response = await api.post('/spaces', dataToSend);
      const newSpace = response.data;
      setSpaces(prev => [...prev, newSpace]);
      onSpacesUpdate?.([...spaces, newSpace]);
      toast.success('Espacio registrado exitosamente');
      setEditingSpace(null);
    } catch (error) {
      console.error('Error al registrar espacio:', error);
      toast.error('Error al registrar espacio');
    }
  };

  // Función para actualizar un espacio
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

  // Función para eliminar un espacio
  const deleteSpace = async (id) => {
    try {
      await api.delete(`/spaces/${id}`);
      const updatedSpaces = spaces.filter((space) => space._id !== id);
      setSpaces(updatedSpaces);
      onSpacesUpdate?.(updatedSpaces);
      toast.success('Espacio eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar espacio:', error);
      toast.error('Error al eliminar espacio');
    }
  };

  // Cargar espacio en edición
  const handleEdit = (space) => {
    setEditingSpace(space);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Gestión de Espacios
      </Typography>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {editingSpace ? 'Editar Espacio' : 'Registrar Nuevo Espacio'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SpaceForm
            onSave={editingSpace ? (data) => updateSpace(editingSpace._id, data) : addSpace}
            initialData={editingSpace || undefined}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Espacios</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {spaces.length === 0 ? (
            <Typography>No hay espacios registrados.</Typography>
          ) : (
            <List>
              {spaces.map((space) => (
                <ListItem key={space._id} divider>
                  <ListItemText
                    primary={space.name}
                    secondary={
                      <>
                        Precio por hora: {space.pricePerHour} | Metros cuadrados: {space.squareMeters} | Color: {space.color} <br />
                        {space.description}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="editar" onClick={() => handleEdit(space)} sx={{ mr: 1 }}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton edge="end" aria-label="eliminar" onClick={() => deleteSpace(space._id)}>
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
