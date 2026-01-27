// src/components/CostsManager.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  // ✅ array seguro para render
  const costsArray = useMemo(() => (Array.isArray(costs) ? costs : []), [costs]);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await api.get('/costs');
      const list = Array.isArray(res.data) ? res.data : [];
      setCosts(list);
    } catch (e) {
      console.error('Error al cargar costos:', e);
      toast.error('Error al cargar costos');
      setCosts([]);
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const add = async (data) => {
    try {
      const res = await api.post('/costs', data);
      const updated = [...costsArray, res.data];
      setCosts(updated);
      toast.success('Costo agregado');
    } catch (e) {
      console.error('Error agregando costo:', e);
      toast.error('Error agregando costo');
    }
  };

  const update = async (id, data) => {
    try {
      const res = await api.patch(`/costs/${id}`, data);
      const updated = costsArray.map((c) => (c._id === id ? res.data : c));
      setCosts(updated);
      setEditing(null);
      toast.success('Costo actualizado');
    } catch (e) {
      console.error('Error actualizando costo:', e);
      toast.error('Error actualizando costo');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/costs/${id}`);
      const updated = costsArray.filter((c) => c._id !== id);
      setCosts(updated);
      toast.success('Costo eliminado');
    } catch (e) {
      console.error('Error eliminando costo:', e);
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
            onSubmit={editing ? (data) => update(editing._id, data) : add}
            initial={editing || undefined}
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
          {costsArray.length === 0 ? (
            <Typography>No hay costos registrados.</Typography>
          ) : (
            <List>
              {costsArray.map((c) => {
                const amount = Number(c.amount || 0);
                const date = c.dateIncurred ? new Date(c.dateIncurred) : null;

                return (
                  <ListItem key={c._id} divider>
                    <ListItemText
                      primary={`${c.name || 'Sin nombre'} — ₡${amount.toLocaleString()}`}
                      secondary={
                        c.type === 'fixed'
                          ? 'Fijo, mensual'
                          : `Variable, ${date ? date.toLocaleDateString() : 'Sin fecha'}`
                      }
                    />
                    <IconButton onClick={() => setEditing(c)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => remove(c._id)}>
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
}
