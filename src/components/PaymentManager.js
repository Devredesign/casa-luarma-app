// src/components/PaymentManager.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

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

const PaymentManager = ({
  classesList,
  students,
  modalities,
  onPaymentsUpdate
}) => {
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
  const paymentsArray = useMemo(
    () => (Array.isArray(payments) ? payments : []),
    [payments]
  );

  const classesArray = useMemo(
    () => (Array.isArray(classesList) ? classesList : []),
    [classesList]
  );

  const studentsArray = useMemo(
    () => (Array.isArray(students) ? students : []),
    [students]
  );

  const modalitiesArray = useMemo(
    () => (Array.isArray(modalities) ? modalities : []),
    [modalities]
  );

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get('/payments');

      const list = Array.isArray(res.data)
        ? res.data
        : [];

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
  const addPayment = async data => {
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

      const updated = [
        ...paymentsArray,
        res.data
      ];

      setPayments(updated);
      onPaymentsUpdate?.(updated);

      toast.success('Pago registrado exitosamente');
    } catch (err) {
      console.error(
        'Error al registrar pago:',
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        'Error al registrar pago'
      );
    }
  };

  const deletePayment = async id => {
    try {
      await api.delete(`/payments/${id}`);

      const updated = paymentsArray.filter(
        p => p._id !== id
      );

      setPayments(updated);
      onPaymentsUpdate?.(updated);

      toast.success('Pago eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      toast.error('Error al eliminar pago');
    }
  };

  const markAsPaid = async id => {
    try {
      const res = await api.patch(
        `/payments/${id}`,
        {
          status: 'paid'
        }
      );

      const updated = paymentsArray.map(p =>
        p._id === id
          ? res.data
          : p
      );

      setPayments(updated);
      onPaymentsUpdate?.(updated);

      toast.success('Pago marcado como pagado');
    } catch (err) {
      console.error(
        'Error al marcar pagado:',
        err
      );

      toast.error(
        'Error al actualizar estado'
      );
    }
  };

  const handleFilterChange = e => {
    const {
      name,
      value
    } = e.target;

    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      month: '',
      year: '',
      professor: '',
      student: '',
      status: '',
      modalityId: ''
    });
  };

  const filteredPayments = useMemo(() => {
    return paymentsArray.filter(p => {
      const date = new Date(p.paymentDate);

      // Usamos UTC para evitar que una fecha como
      // 2026-06-01 aparezca como 2026-05-31 en Costa Rica.
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      const cls =
        classesArray.find(
          c => c._id === p.classId
        ) || {};

      const stu =
        studentsArray.find(
          s => s._id === p.studentId
        ) || {};

      let ok = true;

      if (filters.month) {
        ok =
          ok &&
          month === Number(filters.month);
      }

      if (filters.year) {
        ok =
          ok &&
          year === Number(filters.year);
      }

      if (filters.professor) {
        ok =
          ok &&
          cls.professor === filters.professor;
      }

      if (filters.student) {
        ok =
          ok &&
          stu._id === filters.student;
      }

      if (filters.status) {
        ok =
          ok &&
          p.status === filters.status;
      }

      if (filters.modalityId) {
        ok =
          ok &&
          String(p.modalityId) ===
            String(filters.modalityId);
      }

      return ok;
    });
  }, [
    paymentsArray,
    classesArray,
    studentsArray,
    filters
  ]);

  // El selector muestra nombres,
  // pero conserva valores numéricos del 1 al 12.
  const months = useMemo(
    () => [
      {
        value: 1,
        label: 'Enero'
      },
      {
        value: 2,
        label: 'Febrero'
      },
      {
        value: 3,
        label: 'Marzo'
      },
      {
        value: 4,
        label: 'Abril'
      },
      {
        value: 5,
        label: 'Mayo'
      },
      {
        value: 6,
        label: 'Junio'
      },
      {
        value: 7,
        label: 'Julio'
      },
      {
        value: 8,
        label: 'Agosto'
      },
      {
        value: 9,
        label: 'Septiembre'
      },
      {
        value: 10,
        label: 'Octubre'
      },
      {
        value: 11,
        label: 'Noviembre'
      },
      {
        value: 12,
        label: 'Diciembre'
      }
    ],
    []
  );

  const years = useMemo(() => {
    const ys = Array.from(
      new Set(
        paymentsArray
          .map(p =>
            new Date(
              p.paymentDate
            ).getUTCFullYear()
          )
          .filter(y =>
            Number.isFinite(y)
          )
      )
    ).sort((a, b) => b - a);

    if (ys.length === 0) {
      ys.push(
        new Date().getUTCFullYear()
      );
    }

    return ys;
  }, [paymentsArray]);

  const professors = useMemo(() => {
    return Array.from(
      new Set(
        classesArray
          .map(c => c.professor)
          .filter(Boolean)
      )
    ).sort();
  }, [classesArray]);

  const modalityNameById = useCallback(
    id => {
      const modality = modalitiesArray.find(
        item =>
          String(item._id) === String(id)
      );

      return modality?.name || '—';
    },
    [modalitiesArray]
  );

  const classTitleById = useCallback(
    id => {
      const classItem = classesArray.find(
        item =>
          String(item._id) === String(id)
      );

      return classItem?.title || 'Clase';
    },
    [classesArray]
  );

  return (
    <div>
      <Typography
        variant="h4"
        sx={{ mt: 3 }}
      >
        Pagos
      </Typography>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>
            Registrar Pago
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <PaymentForm
            classesList={classesArray}
            students={studentsArray}
            modalities={modalitiesArray}
            onSubmit={addPayment}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>
            Listado de Pagos
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid
            container
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Mes
                </InputLabel>

                <Select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  label="Mes"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>

                  {months.map(month => (
                    <MenuItem
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Año
                </InputLabel>

                <Select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  label="Año"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>

                  {years.map(year => (
                    <MenuItem
                      key={year}
                      value={year}
                    >
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Profesor
                </InputLabel>

                <Select
                  name="professor"
                  value={filters.professor}
                  onChange={handleFilterChange}
                  label="Profesor"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>

                  {professors.map(
                    professor => (
                      <MenuItem
                        key={professor}
                        value={professor}
                      >
                        {professor}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Estudiante
                </InputLabel>

                <Select
                  name="student"
                  value={filters.student}
                  onChange={handleFilterChange}
                  label="Estudiante"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>

                  {studentsArray.map(
                    student => (
                      <MenuItem
                        key={student._id}
                        value={student._id}
                      >
                        {student.name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Modalidad
                </InputLabel>

                <Select
                  name="modalityId"
                  value={filters.modalityId}
                  onChange={handleFilterChange}
                  label="Modalidad"
                >
                  <MenuItem value="">
                    <em>Todas</em>
                  </MenuItem>

                  {modalitiesArray.map(
                    modality => (
                      <MenuItem
                        key={modality._id}
                        value={modality._id}
                      >
                        {modality.name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>

                  <MenuItem value="pending">
                    Pendiente
                  </MenuItem>

                  <MenuItem value="paid">
                    Pagado
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={resetFilters}
                >
                  Limpiar filtros
                </Button>

                <Chip
                  label={`${filteredPayments.length} pago(s)`}
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>

          {filteredPayments.length === 0 ? (
            <Typography>
              No hay pagos con esos filtros.
            </Typography>
          ) : (
            <List>
              {filteredPayments.map(payment => {
                const student =
                  studentsArray.find(
                    item =>
                      String(item._id) ===
                      String(payment.studentId)
                  ) || {};

                const amount = Number(
                  payment.amount || 0
                );

                return (
                  <ListItem
                    key={payment._id}
                    divider
                    sx={{
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemText
                      primary={`${
                        student.name ||
                        'Estudiante'
                      } — ₡${amount.toLocaleString()}`}
                      secondary={[
                        `Clase: ${classTitleById(
                          payment.classId
                        )}`,

                        `Modalidad (pago): ${modalityNameById(
                          payment.modalityId
                        )}`,

                        `Sesiones: ${
                          payment.sessions ?? '-'
                        }`,

                        `Fecha: ${new Date(
                          payment.paymentDate
                        ).toLocaleDateString(
                          'es-CR',
                          {
                            timeZone: 'UTC',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }
                        )}`,

                        `Método: ${
                          payment.method || '-'
                        }`
                      ].join(' | ')}
                    />

                    {payment.status ===
                    'pending' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          markAsPaid(
                            payment._id
                          )
                        }
                        sx={{
                          mr: 1
                        }}
                      >
                        Marcar pagado
                      </Button>
                    ) : (
                      <CheckCircleIcon
                        color="success"
                        sx={{
                          mr: 1,
                          mt: 1
                        }}
                      />
                    )}

                    <IconButton
                      edge="end"
                      aria-label="eliminar"
                      onClick={() =>
                        deletePayment(
                          payment._id
                        )
                      }
                    >
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
