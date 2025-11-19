// src/components/PaymentManager.js
import React, { useState, useEffect } from 'react';
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
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

const PaymentManager = ({ classesList, students, onPaymentsUpdate }) => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    professor: '',
    student: '',
    status: ''
  });

  // Fetch payments initially
  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data || []);
      onPaymentsUpdate?.(res.data || []);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      toast.error('Error al obtener pagos');
    }
  };
  useEffect(() => { fetchPayments(); }, []);

  // Handler for adding a payment
  const addPayment = async (data) => {
    try {
      const payload = {
        classId: data.classId,
        studentId: data.studentId,
        amount: Number(data.amount),
        method: data.method,
        paymentDate: data.date,
        sessions:   Number(data.sessions)
      };
      console.log('→ Payload a enviar:', payload);
      const res = await api.post('/payments', payload);
      const updated = [...payments, res.data];
      setPayments(updated);
      onPaymentsUpdate?.(updated);
      toast.success('Pago registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar pago:', err.response?.data || err);
      toast.error('Error al registrar pago');
    }
  };

  // Handler for deleting a payment
  const deletePayment = async (id) => {
    try {
      await api.delete(`/payments/${id}`);
      const updated = payments.filter(p => p._id !== id);
      setPayments(updated);
      onPaymentsUpdate?.(updated);
      toast.success('Pago eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      toast.error('Error al eliminar pago');
    }
  };

  // Handler for marking a payment as paid
  const markAsPaid = async (id) => {
    try {
      const res = await api.patch(`/payments/${id}`, { status: 'paid' });
      const updated = payments.map(p => p._id === id ? res.data : p);
      setPayments(updated);
      onPaymentsUpdate?.(updated);
      toast.success('Pago marcado como pagado');
    } catch (err) {
      console.error('Error al marcar pagado:', err);
      toast.error('Error al actualizar estado');
    }
  };

  // Update filter state on change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters to payments
  const filteredPayments = payments.filter(p => {
    const date = new Date(p.paymentDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const cls = classesList.find(c => c._id === p.classId) || {};
    const stu = students.find(s => s._id === p.studentId) || {};
    let ok = true;
    if (filters.month) ok = ok && month === Number(filters.month);
    if (filters.year) ok = ok && year === Number(filters.year);
    if (filters.professor) ok = ok && cls.professor === filters.professor;
    if (filters.student) ok = ok && stu._id === filters.student;
    if (filters.status) ok = ok && p.status === filters.status;
    return ok;
  });

  // Unique filter options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(new Set(payments.map(p => new Date(p.paymentDate).getFullYear())));
  const professors = Array.from(new Set(classesList.map(c => c.professor)));

  return (
    <div>
      <Typography variant="h4" sx={{ mt: 3 }}>Pagos</Typography>

      {/* Registrar Pago */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Registrar Pago</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PaymentForm
            classesList={classesList}
            students={students}
            onSubmit={addPayment}
          />
        </AccordionDetails>
      </Accordion>

{/* Listado filtrado */}
<Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listado de Pagos</Typography>
        </AccordionSummary>
        <AccordionDetails>
      {/* Filtros */}
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
              {students.map(stu => <MenuItem key={stu._id} value={stu._id}>{stu.name}</MenuItem>)}
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
      </Grid>

      
          {filteredPayments.length === 0 ? (
            <Typography>No hay pagos con esos filtros.</Typography>
          ) : (
            <List>
              {filteredPayments.map(p => {
                const cls = classesList.find(c => c._id === p.classId) || {};
                const stu = students.find(s => s._id === p.studentId) || {};
                const dateObj = new Date(p.paymentDate);
                const dateString = isNaN(dateObj) ? 'Fecha inválida' : dateObj.toLocaleDateString();
                return (
                  <ListItem key={p._id} divider sx={{ alignItems: 'flex-start' }}>
                    <ListItemText
  primary={`${stu.name} — ₡${p.amount.toLocaleString()}`}
  secondary={`Clases: ${p.sessions} | Fecha: ${new Date(p.paymentDate).toLocaleDateString()} | Método: ${p.method}`}
/>
                    {p.status === 'pending' ? (
                      <Button size="small" variant="outlined" onClick={() => markAsPaid(p._id)} sx={{ mr: 1 }}>
                        Marcar pagado
                      </Button>
                    ) : (
                      <CheckCircleIcon edge="end" color="success" sx={{ mr: 1, mt: 1}} />
                    )}
                    <IconButton edge="end" aria-label="eliminar" onClick={() => deletePayment(p._id)}>
                      <DeleteIcon color="error"  />
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



