// src/components/StudentsManager.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StudentForm from './StudentForm';
import {
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const StudentsManager = ({ onStudentsUpdate }) => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data || []);
      onStudentsUpdate?.(res.data || []);
    } catch (err) {
      console.error('Error al obtener estudiantes:', err);
      toast.error('Error al obtener estudiantes');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (studentData) => {
    try {
      const res = await api.post('/students', studentData);
      const updated = [...students, res.data];
      setStudents(updated);
      onStudentsUpdate?.(updated);
      toast.success('Estudiante registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar estudiante:', err);
      toast.error('Error al registrar estudiante');
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const res = await api.patch(`/students/${id}`, studentData);
      const updated = students.map(s => s._id === id ? res.data : s);
      setStudents(updated);
      onStudentsUpdate?.(updated);
      setEditingStudent(null);
      toast.success('Estudiante actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar estudiante:', err);
      toast.error('Error al actualizar estudiante');
    }
  };

  const deleteStudent = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      const updated = students.filter(s => s._id !== id);
      setStudents(updated);
      onStudentsUpdate?.(updated);
      toast.success('Estudiante eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar estudiante:', err);
      toast.error('Error al eliminar estudiante');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Gestión de Estudiantes
      </Typography>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{editingStudent ? 'Editar Estudiante' : 'Registrar Estudiante'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StudentForm
            onSave={editingStudent ? (data) => updateStudent(editingStudent._id, data) : addStudent}
            initialData={editingStudent || undefined}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Estudiantes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {students.length === 0 ? (
            <Typography>No hay estudiantes registrados.</Typography>
          ) : (
            <List>
              {students.map((stu) => (
                <ListItem key={stu._id} divider>
                  <ListItemText
                    primary={`${stu.name}`}
                    secondary={`Cédula: ${stu.cedula} | Correo: ${stu.email} | Teléfono: ${stu.phone || 'N/A'}`}
                  />
                  <IconButton edge="end" aria-label="editar" onClick={() => handleEdit(stu)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton edge="end" aria-label="eliminar" onClick={() => deleteStudent(stu._id)}>
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

export default StudentsManager;
