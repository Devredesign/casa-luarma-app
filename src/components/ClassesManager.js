// src/components/ClassesManager.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import ClassForm from './ClassForm';
import api from '../services/api';

export default function ClassesManager() {
  const [classes, setClasses] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const fetchAll = async () => {
    const [cls, mods, studs, tchs] = await Promise.all([
      api.get('/classes'),
      api.get('/modalities'),
      api.get('/students'),
      api.get('/teachers')
    ]);
    setClasses(cls.data);
    setModalities(mods.data);
    setStudents(studs.data);
    setTeachers(tchs.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = () => {
    setEditingClass(null);
    setOpenForm(true);
  };

  const handleEdit = (c) => {
    setEditingClass(c);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta clase?')) return;
    await api.delete(`/classes/${id}`);
    fetchAll();
  };

  const handleSave = async () => {
    setOpenForm(false);
    setEditingClass(null);
    fetchAll();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Clases</Typography>
        <Button variant="contained" onClick={handleCreate}>Nueva Clase</Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Día</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Modalidad</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map(c => (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{teachers.find(t => t._id === c.teacher)?.name || '-'}</TableCell>
                  <TableCell>{c.dayOfWeek}</TableCell>
                  <TableCell>{c.time}</TableCell>
                  <TableCell>{modalities.find(m => m._id === c.modality)?.name || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {classes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No hay clases registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {openForm && (
        <ClassForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSave={handleSave}
          initialData={editingClass}
          modalities={modalities}
          students={students}
          teachers={teachers}
        />
      )}
    </Box>
  );
}
