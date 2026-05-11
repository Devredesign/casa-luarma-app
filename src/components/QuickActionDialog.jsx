import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography
} from '@mui/material';

import api from '../services/api';

export default function QuickActionDialog({
  open,
  onClose,
  actionType,
  students = [],
  classes = [],
  rentals = [],
  modalities = [],
  spaces = [],
  onSaved
}) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedModality, setSelectedModality] = useState('');
  const [sessions, setSessions] = useState(4);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Efectivo');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // reset form when open/action changes
    setSelectedStudent('');
    setSelectedClass('');
    setSelectedModality('');
    setSessions(4);
    setDate(new Date().toISOString().slice(0, 10));
    setMethod('Efectivo');
    setAmount(0);
  }, [open, actionType]);

  useEffect(() => {
    if (actionType === 'payment') {
      const mod = modalities.find(m => m._id === selectedModality);
      const price = Number(mod?.price || 0);
      setAmount(price * Number(sessions || 0));
    }
  }, [selectedModality, sessions, actionType, modalities]);

  const handleSave = async () => {
    try {
      if (actionType === 'payment') {
        await api.post('/payments', {
          student: selectedStudent,
          class: selectedClass,
          modality: selectedModality || undefined,
          sessions: Number(sessions || 1),
          date,
          method
        });
      }

      if (actionType === 'rental') {
        // Si quisieras acción rápida de alquiler, se implementa aquí
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Revisá consola.');
    }
  };

  const titleMap = {
    payment: 'Registrar Pago Rápido',
    rental: 'Registrar Alquiler Rápido'
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{titleMap[actionType] || 'Acción Rápida'}</DialogTitle>

      <DialogContent>
        {actionType === 'payment' && (
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Estudiante</InputLabel>
              <Select
                value={selectedStudent}
                label="Estudiante"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map(s => (
                  <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Clase</InputLabel>
              <Select
                value={selectedClass}
                label="Clase"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(c => (
                  <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Modalidad</InputLabel>
              <Select
                value={selectedModality}
                label="Modalidad"
                onChange={(e) => setSelectedModality(e.target.value)}
              >
                {modalities.map(m => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.name} (₡{m.price})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Sesiones"
              type="number"
              value={sessions}
              onChange={(e) => setSessions(e.target.value)}
              fullWidth
            />

            <TextField
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Método"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              fullWidth
            />

            <Typography variant="body2" color="text.secondary">
              Monto estimado: <b>₡{amount.toLocaleString()}</b>
            </Typography>
          </Box>
        )}

        {actionType !== 'payment' && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Acción no implementada todavía.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={actionType === 'payment' && (!selectedStudent || !selectedClass || !selectedModality)}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
