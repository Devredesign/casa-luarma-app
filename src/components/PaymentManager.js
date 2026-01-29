// src/components/PaymentManager.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import PaymentForm from './PaymentForm';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

const PaymentManager = ({ classesList, students, modalities, onPaymentsUpdate }) => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    professor: '',
    student: '',
    status: '',
    modalityId: ''
  });

  // SAFE arrays
  const paymentsArray = useMemo(() => (Array.isArray(payments) ? payments : []), [payments]);
  const classesArray = useMemo(() => (Array.isArray(classesList) ? classesList : []), [classesList]);
  const studentsArray = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const modalitiesArray = useMemo(() => (Array.isArray(modalities) ? modalities : []), [modalities]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get('/payments');
      const list = Array.isArray(res.data) ? res.data : [];
      setPayments(list);
      onPaymentsUpdate?.(list);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      toast.error('Error al obtener pagos');
    }
  }, [onPaymentsUpdate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ✅ Add payment: ahora recibe modalityId y amount calculado en frontend
  // (si luego lo movés a backend, lo cambiamos)
  const addPayment = async (data) => {
    try {
      const payload = {
        classId: data.classId,
        studentId: data.studentId,
        modalityId: data.modalityId, // ✅ NUEVO
        amount: Number(data.amount),
        method: data.method,
        paymentDate: data.date,
        sessions: Number(data.sessions)
      };

      const res = await api.post('/payments', payload);

      const updated = [...paymentsArray, res.data];
      setPayments(updated);
      onPaymentsUpdate?.(updated);

      toast.success('Pago registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar pago:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const deletePayment = async (id) => {
    try {
      await api.delete(`/payments/${id}`);
      const updated = paymentsArray.filter(p => p._id !== id);
      setPayments(updated);
      onPaymentsUpdate?.(updated);
      toast.success('Pago eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      toast.error('Error al eliminar pago');
    }
  };

  const markAsPaid = async (id) => {
    try {
      const res = await api.patch(`/payments/${id}`, { status: 'paid' });
      const updated = paymentsArray.map(p => (p._id === id ? res.data : p));
      setPayments(updated);
      onPaymentsUpdate?.(updated);
      toast.success('Pago marcado como pagado');
    } catch (err) {
      console.error('Error al marcar pagado:', err);
      toast.error('Error al actualizar estado');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ month: '', year: '', professor: '', student: '', status: '', modalityId: '' });
  };

  const filteredPayments = useMemo(() => {
    return paymentsArray.filter(p => {
      const date = new Date(p.paymentDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const cls = classesArray.find(c => c._id === p.classId) || {};
      const stu = studentsArray.find(s => s._id === p.studentId) || {};

      let ok = true;
      if (filters.month) ok = ok && month === Number(filters.month);
      if (filters.year) ok = ok && year === Number(filters.year);
      if (filters.professor) ok = ok && cls.professor === filters.professor;
      if (filters.student) ok = ok && stu._id === filters.student;
      if (filters.status) ok = ok && p.status === filters.status;
      if (filters.modalityId) ok = ok && String(p.modalityId) === String(filters.modalityId);
      return ok;
    });
  }, [paymentsArray, classesArray, studentsArray, filters]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const years = useMemo(() => {
    const ys = Array.from(
      new Set(
        paymentsArray
          .map(p => new Date(p.paymentDate).getFullYear())
          .filter(y => Number.isFinite(y))
      )
    ).sort((a, b) => b - a);
    if (ys.length === 0) ys.push(new Date().getFullYear());
    return ys;
  }, [paymentsArray]);

  const professors = useMemo(() => {
    return Array.from(new Set(classesArray.map(c => c.professor).filter(Boolean))).sort();
  }, [classesArray]);

  const modalityNameById = useCallback((id) => {
    const m = modalitiesArray.find(x => String(x._id) === String(id));
    return m?.name || '—';
  }, [modalitiesArray]);

  const classTitleById = useCallback((id) => {
    const c = classesArray.find(x => String(x._id) === String(id));
    return c?.title || 'Clase';
  }, [classesArray]);

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>Pagos</Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Registrar Pago</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PaymentForm
            classesList={classesArray}
            students={studentsArray}
            modalities={modalitiesArray}   // ✅ CLAVE
            onSubmit={addPayment}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Pagos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Mes</InputLabel>
                <Select name="month" value={filters.month} onChange={handleFilterChange} label="Mes">
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Año</InputLabel>
                <Select name="year" value={filters.year} onChange={handleFilterChange} label="Año">
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Profesor</InputLabel>
                <Select name="professor" value={filters.professor} onChange={handleFilterChange} label="Profesor">
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {professors.map(pf => <MenuItem key={pf} value={pf}>{pf}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Estudiante</InputLabel>
                <Select name="student" value={filters.student} onChange={handleFilterChange} label="Estudiante">
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {studentsArray.map(stu => <MenuItem key={stu._id} value={stu._id}>{stu.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Modalidad</InputLabel>
                <Select name="modalityId" value={filters.modalityId} onChange={handleFilterChange} label="Modalidad">
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {modalitiesArray.map(m => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={filters.status} onChange={handleFilterChange} label="Status">
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="paid">Pagado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <Button size="small" variant="outlined" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
                <Chip label={`${filteredPayments.length} pago(s)`} variant="outlined" />
              </Stack>
            </Grid>
          </Grid>

          {filteredPayments.length === 0 ? (
            <Typography>No hay pagos con esos filtros.</Typography>
          ) : (
            <List>
              {filteredPayments.map(p => {
                const stu = studentsArray.find(s => String(s._id) === String(p.studentId)) || {};
                const amount = Number(p.amount || 0);

                return (
                  <ListItem key={p._id} divider sx={{ alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={`${stu.name || 'Estudiante'} — ₡${amount.toLocaleString()}`}
                      secondary={[
                        `Clase: ${classTitleById(p.classId)}`,
                        `Modalidad (pago): ${modalityNameById(p.modalityId)}`,
                        `Sesiones: ${p.sessions ?? '-'}`,
                        `Fecha: ${new Date(p.paymentDate).toLocaleDateString()}`,
                        `Método: ${p.method || '-'}`
                      ].join(' | ')}
                    />

                    {p.status === 'pending' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => markAsPaid(p._id)}
                        sx={{ mr: 1 }}
                      >
                        Marcar pagado
                      </Button>
                    ) : (
                      <CheckCircleIcon color="success" sx={{ mr: 1, mt: 1 }} />
                    )}

                    <IconButton edge="end" aria-label="eliminar" onClick={() => deletePayment(p._id)}>
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
};

export default PaymentManager;
