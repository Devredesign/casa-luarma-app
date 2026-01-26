// src/components/TeacherManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';

const TeacherManager = ({ onTeachersUpdate }) => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    availability: '',
  });
  const [editingTeacher, setEditingTeacher] = useState(null);

  // SAFE array (evita crash si teachers no es array)
  const teachersArray = useMemo(
    () => (Array.isArray(teachers) ? teachers : []),
    [teachers]
  );

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await api.get('/teachers');
      const list = Array.isArray(res.data) ? res.data : [];
      setTeachers(list);
      onTeachersUpdate?.(list);
    } catch (err) {
      console.error('Error al obtener profesores:', err);
      toast.error('Error al obtener profesores');
      setTeachers([]);
      onTeachersUpdate?.([]);
    }
  }, [onTeachersUpdate]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new teacher
  const addTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teachers', formData);

      const updated = [...teachersArray, res.data];
      setTeachers(updated);
      onTeachersUpdate?.(updated);

      toast.success('Profesor registrado exitosamente');

      // Reset form
      setFormData({ name: '', email: '', phone: '', specialty: '', availability: '' });
    } catch (err) {
      console.error('Error al registrar profesor:', err);
      toast.error('Error al registrar profesor');
    }
  };

  // Update existing teacher
  const updateTeacher = async (e) => {
    e.preventDefault();
    if (!editingTeacher?._id) return;

    try {
      const res = await api.patch(`/teachers/${editingTeacher._id}`, formData);

      const updated = teachersArray.map(t =>
        t._id === editingTeacher._id ? res.data : t
      );

      setTeachers(updated);
      onTeachersUpdate?.(updated);

      toast.success('Profesor actualizado exitosamente');

      // Reset
      setEditingTeacher(null);
      setFormData({ name: '', email: '', phone: '', specialty: '', availability: '' });
    } catch (err) {
      console.error('Error al actualizar profesor:', err);
      toast.error('Error al actualizar profesor');
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    try {
      await api.delete(`/teachers/${id}`);

      const updated = teachersArray.filter(t => t._id !== id);

      setTeachers(updated);
      onTeachersUpdate?.(updated);

      toast.success('Profesor eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar profesor:', err);
      toast.error('Error al eliminar profesor');
    }
  };

  // Populate form for editing
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      specialty: teacher?.specialty || '',
      availability: teacher?.availability || '',
    });
  };

  const handleCancel = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', phone: '', specialty: '', availability: '' });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Profesores
      </Typography>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {editingTeacher ? 'Editar Profesor' : 'Registrar Profesor'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            component="form"
            onSubmit={editingTeacher ? updateTeacher : addTeacher}
            sx={{ mt: 2 }}
          >
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Correo"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Especialidad"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Disponibilidad"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <Button type="submit" variant="contained" sx={{ mt: 1 }}>
              {editingTeacher ? 'Actualizar' : 'Registrar'}
            </Button>

            {editingTeacher && (
              <Button variant="text" sx={{ mt: 1, ml: 2 }} onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Profesores</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {teachersArray.length === 0 ? (
            <Typography>No hay profesores registrados.</Typography>
          ) : (
            <List>
              {teachersArray.map((teacher) => (
                <ListItem key={teacher._id} divider>
                  <ListItemText
                    primary={teacher?.name || 'Sin nombre'}
                    secondary={`${teacher?.email || 'N/A'} | ${teacher?.phone || 'N/A'} | Especialidad: ${teacher?.specialty || 'N/A'} | Disponibilidad: ${teacher?.availability || 'N/A'}`}
                  />
                  <IconButton edge="end" aria-label="editar" onClick={() => handleEdit(teacher)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton edge="end" aria-label="eliminar" onClick={() => deleteTeacher(teacher._id)}>
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
};

export default TeacherManager;
