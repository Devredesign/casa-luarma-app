// src/components/StudentsManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import StudentForm from './StudentForm';
import {
  Typography,
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

  const studentsArray = useMemo(
    () => (Array.isArray(students) ? students : []),
    [students]
  );

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/students');
      const list = Array.isArray(res.data) ? res.data : [];
      setStudents(list);
      onStudentsUpdate?.(list);
    } catch (err) {
      console.error('Error al obtener estudiantes:', err);
      toast.error('Error al obtener estudiantes');
      setStudents([]);
      onStudentsUpdate?.([]);
    }
  }, [onStudentsUpdate]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (studentData) => {
    try {
      const res = await api.post('/students', studentData);
      const updated = [...studentsArray, res.data];
      setStudents(updated);
      onStudentsUpdate?.(updated);
      toast.success('Estudiante registrado exitosamente');
      fetchStudents();
    } catch (err) {
      console.error('Error al registrar estudiante:', err);
      toast.error('Error al registrar estudiante');
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const res = await api.patch(`/students/${id}`, studentData);
      const updated = studentsArray.map((s) => (s._id === id ? res.data : s));
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
      const updated = studentsArray.filter((s) => s._id !== id);
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
        Estudiantes
      </Typography>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            {editingStudent ? 'Editar Estudiante' : 'Registrar Estudiante'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StudentForm
            onSave={
              editingStudent
                ? (data) => updateStudent(editingStudent._id, data)
                : addStudent
            }
            initialData={editingStudent || undefined}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Estudiantes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {studentsArray.length === 0 ? (
            <Typography>No hay estudiantes registrados.</Typography>
          ) : (
            <List>
              {studentsArray.map((stu) => (
                <ListItem key={stu._id} divider>
                  <ListItemText
                    primary={`${stu.name || ''}`}
                    secondary={`Cédula: ${stu.cedula || 'N/A'} | Correo: ${stu.email || 'N/A'} | Teléfono: ${stu.phone || 'N/A'}`}
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
