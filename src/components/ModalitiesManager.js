// src/components/ModalitiesManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import ModalityForm from './ModalityForm';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';

export default function ModalitiesManager({ onModalitiesUpdate }) {
  const [modalities, setModalities] = useState([]);
  const [editingModality, setEditingModality] = useState(null);

  // SAFE array para evitar crashes en render
  const modalitiesArray = useMemo(
    () => (Array.isArray(modalities) ? modalities : []),
    [modalities]
  );

  const loadModalities = useCallback(async () => {
    try {
      const res = await api.get('/modalities');
      const list = Array.isArray(res.data) ? res.data : [];
      setModalities(list);
      onModalitiesUpdate?.(list);
    } catch (err) {
      console.error('Error cargando modalidades:', err);
      toast.error('Error cargando modalidades');
      setModalities([]);
      onModalitiesUpdate?.([]);
    }
  }, [onModalitiesUpdate]);

  // Carga inicial
  useEffect(() => {
    loadModalities();
  }, [loadModalities]);

  // Crear o actualizar modalidad
  const saveModality = async (data) => {
    try {
      let res;
      const wasEditing = Boolean(editingModality);

      if (editingModality) {
        res = await api.patch(`/modalities/${editingModality._id}`, data);
      } else {
        res = await api.post('/modalities', data);
      }

      const saved = res.data;

      const updated = wasEditing
        ? modalitiesArray.map(m => (m._id === saved._id ? saved : m))
        : [...modalitiesArray, saved];

      setModalities(updated);
      onModalitiesUpdate?.(updated);
      setEditingModality(null);

      toast.success(wasEditing ? 'Modalidad actualizada' : 'Modalidad agregada');
    } catch (err) {
      console.error('Error guardando modalidad:', err);
      toast.error(editingModality ? 'Error actualizando modalidad' : 'Error agregando modalidad');
    }
  };

  // Eliminar modalidad
  const deleteModality = async (id) => {
    try {
      await api.delete(`/modalities/${id}`);

      const updated = modalitiesArray.filter(m => m._id !== id);

      setModalities(updated);
      onModalitiesUpdate?.(updated);

      toast.success('Modalidad eliminada');
    } catch (err) {
      console.error('Error eliminando modalidad:', err);
      toast.error('Error eliminando modalidad');
    }
  };

  const handleEdit = (modality) => {
    setEditingModality(modality);
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>
        Modalidades
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editingModality ? 'Editar Modalidad' : 'Nueva Modalidad'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ModalityForm
            initial={editingModality || undefined}
            onSubmit={saveModality}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Modalidades</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {modalitiesArray.length === 0 ? (
            <Typography>No hay modalidades registradas.</Typography>
          ) : (
            <List>
              {modalitiesArray.map(m => (
                <ListItem key={m._id} divider>
                  <ListItemText
                    primary={m.name || 'Sin nombre'}
                    secondary={`₡ ${Number(m.price || 0).toLocaleString()}`}
                  />
                  <IconButton onClick={() => handleEdit(m)} sx={{ mr: 1 }}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton onClick={() => deleteModality(m._id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
