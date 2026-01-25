// src/components/CostsManager.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CostForm from './CostForm';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';

export default function CostsManager() {
  const [costs, setCosts] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const res = await api.get('/costs');
        setCosts(res.data);
      } catch (e) {
        toast.error('Error al cargar costos');
      }
    };
    fetchCosts();
    // no cleanup necesario
  }, []);

  const add = async data => {
    try {
      const res = await api.post('/costs', data);
      setCosts(prev => [...prev, res.data]);
      toast.success('Costo agregado');
    } catch {
      toast.error('Error agregando costo');
    }
  };

  const update = async (id, data) => {
    try {
      const res = await api.patch(`/costs/${id}`, data);
      setCosts(prev => prev.map(c => c._id === id ? res.data : c));
      setEditing(null);
      toast.success('Costo actualizado');
    } catch {
      toast.error('Error actualizando costo');
    }
  };

  const remove = async id => {
    try {
      await api.delete(`/costs/${id}`);
      setCosts(prev => prev.filter(c => c._id !== id));
      toast.success('Costo eliminado');
    } catch {
      toast.error('Error eliminando costo');
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>
        Costos Operativos
      </Typography>

      {/* Formulario Nuevo/Editar */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          id="panel-cost-form-header"
          aria-controls="panel-cost-form-content"
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>{editing ? 'Editar Costo' : 'Nuevo Costo'}</Typography>
        </AccordionSummary>
        <AccordionDetails id="panel-cost-form-content">
          <CostForm
            onSubmit={editing ? data => update(editing._id, data) : add}
            initial={editing}
          />
        </AccordionDetails>
      </Accordion>

      {/* Listado de Costos */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          id="panel-cost-list-header"
          aria-controls="panel-cost-list-content"
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>Listado de Costos</Typography>
        </AccordionSummary>
        <AccordionDetails id="panel-cost-list-content">
          <List>
            {costs.map(c => (
              <ListItem key={c._id} divider>
                <ListItemText
                  primary={`${c.name} — ₡${c.amount.toLocaleString()}`}
                  secondary={
                    c.type === 'fixed'
                      ? 'Fijo, mensual'
                      : `Variable, ${new Date(c.dateIncurred).toLocaleDateString()}`
                  }
                />
                <IconButton onClick={() => setEditing(c)}>
                  <EditIcon color="primary" />
                </IconButton>
                <IconButton onClick={() => remove(c._id)}>
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
