// src/components/ClassesManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import ClassForm from './ClassForm';
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
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

export default function ClassesManager({
  teachers,
  spaces,
  modalities,
  // ⛔ calendarToken / setCalendarToken / refreshCalendar ya no se usan
  onClassesUpdate
}) {
  const [classes, setClasses] = useState([]);
  const [editing, setEditing] = useState(null);

  // SAFE arrays (evita .map/.find crashes)
  const classesArray = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const spacesArray = useMemo(() => (Array.isArray(spaces) ? spaces : []), [spaces]);
  const teachersArray = useMemo(() => (Array.isArray(teachers) ? teachers : []), [teachers]);
  const modalitiesArray = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/classes');
      const list = Array.isArray(res.data) ? res.data : [];
      setClasses(list);
      onClassesUpdate?.(list);
    } catch (err) {
      console.error('Error cargando clases:', err);
      toast.error('Error cargando clases');
      setClasses([]);
      onClassesUpdate?.([]);
    }
  }, [onClassesUpdate]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const saveClass = async (data) => {
    try {
      console.log('Payload a /classes →', data);

      let res;
      const wasEditing = Boolean(editing);

      if (editing) {
        res = await api.patch(`/classes/${editing._id}`, data);
        setEditing(null);
      } else {
        res = await api.post('/classes', data);
      }

      const saved = res.data;

      // ✅ Ya NO sincronizamos con Google Calendar.
      //    Solo guardamos/actualizamos la clase en la app.

      const updatedList = wasEditing
        ? classesArray.map((c) => (c._id === saved._id ? saved : c))
        : [...classesArray, saved];

      setClasses(updatedList);
      onClassesUpdate?.(updatedList);

      toast.success(wasEditing ? 'Clase actualizada' : 'Clase registrada');
    } catch (err) {
      console.error('Error guardando clase:', err);
      toast.error('Error guardando clase');
    }
  };

  const deleteClass = async (id) => {
    try {
      await api.delete(`/classes/${id}`);

      const updated = classesArray.filter((c) => c._id !== id);
      setClasses(updated);
      onClassesUpdate?.(updated);

      toast.success('Clase eliminada');
    } catch (err) {
      console.error('Error eliminando clase:', err);
      toast.error('Error eliminando clase');
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Clases
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editing ? 'Editar Clase' : 'Nueva Clase'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ClassForm
            initialData={editing}
            onSubmit={saveClass}
            teachers={teachersArray}
            spaces={spacesArray}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Clases</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {classesArray.length === 0 ? (
            <Typography>No hay clases registradas.</Typography>
          ) : (
            <List>
              {classesArray.map((c) => {
                const spaceName =
                  (typeof c.space === 'object' && c.space?.name) ||
                  spacesArray.find((s) => s._id === c.space)?.name ||
                  'Sin espacio';

                const modName =
                  c.modality?.name ||
                  modalitiesArray.find((m) => m._id === c.modality)?.name ||
                  '—';

                return (
                  <ListItem key={c._id} divider>
                    <ListItemText
                      primary={`${c.title} — ${spaceName}`}
                      secondary={
                        `Modalidad: ${modName} ` +
                        `| Profesor: ${c.professor || '—'} ` +
                        `| ${c.schedule ? new Date(c.schedule).toLocaleString() : 'Sin horario'}`
                      }
                    />
                    <IconButton onClick={() => setEditing(c)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => deleteClass(c._id)}>
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
