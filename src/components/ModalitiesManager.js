// src/components/ModalitiesManager.js
import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';

export default function ModalitiesManager({ onModalitiesUpdate }) {
  const [modalities, setModalities] = useState([]);
  const [editingModality, setEditingModality] = useState(null);

  // Carga de modalidades
  useEffect(() => {
    let isActive = true;
    async function loadModalities() {
      try {
        const res = await api.get('/modalities');
        if (isActive) {
          setModalities(res.data || []);
          onModalitiesUpdate?.(res.data || []);
        }
      } catch (err) {
        toast.error('Error cargando modalidades');
      }
    }
    loadModalities();
    return () => { isActive = false; };
  }, [onModalitiesUpdate]);

  // Crear o actualizar modalidad
  const saveModality = async (data) => {
    try {
      let res;
      if (editingModality) {
        res = await api.patch(`/modalities/${editingModality._id}`, data);
      } else {
        res = await api.post('/modalities', data);
      }
      const saved = res.data;
      const updated = editingModality
        ? modalities.map(m => m._id === saved._id ? saved : m)
        : [...modalities, saved];
      setModalities(updated);
      onModalitiesUpdate?.(updated);
      setEditingModality(null);
      toast.success(editingModality ? 'Modalidad actualizada' : 'Modalidad agregada');
    } catch (err) {
      toast.error(editingModality ? 'Error actualizando modalidad' : 'Error agregando modalidad');
    }
  };

  // Eliminar modalidad
  const deleteModality = async (id) => {
    try {
      await api.delete(`/modalities/${id}`);
      const updated = modalities.filter(m => m._id !== id);
      setModalities(updated);
      onModalitiesUpdate?.(updated);
      toast.success('Modalidad eliminada');
    } catch (err) {
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

      <Divider sx={{ my: 2 }} />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Modalidades</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {modalities.length === 0 ? (
            <Typography>No hay modalidades registradas.</Typography>
          ) : (
            <List>
              {modalities.map(m => (
                <ListItem key={m._id} divider>
                  <ListItemText
                    primary={m.name}
                    secondary={`₡ ${m.price.toLocaleString()}`}
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
