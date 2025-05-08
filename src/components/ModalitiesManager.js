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
import DeleteIcon     from '@mui/icons-material/Delete';
import EditIcon       from '@mui/icons-material/Edit';
import { toast }      from 'react-toastify';

export default function ModalitiesManager() {
  const [modalities, setModalities] = useState([]);
  const [editing, setEditing]       = useState(null);

  // Carga de modalidades
  useEffect(() => {
    let isActive = true;

    async function loadModalities() {
      try {
        const res = await api.get('/modalities');
        if (isActive) setModalities(res.data);
      } catch (err) {
        toast.error('Error cargando modalidades');
      }
    }

    loadModalities();

    return () => {
      // Evita actualizar el estado si el componente se desmonta
      isActive = false;
    };
  }, []);

  // Agregar nueva modalidad
  const addModality = async data => {
    try {
      const res = await api.post('/modalities', data);
      setModalities(m => [...m, res.data]);
      toast.success('Modalidad agregada');
    } catch (err) {
      toast.error('Error agregando modalidad');
    }
  };

  // Actualizar modalidad existente
  const updateModality = async (id, data) => {
    try {
      const res = await api.patch(`/modalities/${id}`, data);
      setModalities(m => m.map(x => x._id === id ? res.data : x));
      setEditing(null);
      toast.success('Modalidad actualizada');
    } catch (err) {
      toast.error('Error actualizando modalidad');
    }
  };

  // Eliminar modalidad
  const deleteModality = async id => {
    try {
      await api.delete(`/modalities/${id}`);
      setModalities(m => m.filter(x => x._id !== id));
      toast.success('Modalidad eliminada');
    } catch (err) {
      toast.error('Error eliminando modalidad');
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>
        Modalidades
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {editing ? 'Editar Modalidad' : 'Nueva Modalidad'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ModalityForm
            initial={editing}
            onSubmit={editing ? data => updateModality(editing._id, data) : addModality}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Listado de Modalidades
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {modalities.map(m => (
            <ListItem key={m._id} divider>
                <ListItemText
                primary={m.name}
                secondary={`₡ ${m.price.toLocaleString()}`}
                />
                <IconButton onClick={() => setEditing(m)}>
                <EditIcon color="primary" />
                </IconButton>
                <IconButton onClick={() => deleteModality(m._id)}>
                <DeleteIcon color="error" />
                </IconButton>
            </ListItem>
            ))}
            </List>
        </AccordionDetails>
      </Accordion>
      
    </div>
  );
}

