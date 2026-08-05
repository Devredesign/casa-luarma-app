// src/components/TeacherPayouts.jsx
import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import api from '../services/api';

import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip
} from '@mui/material';

import ExpandMoreIcon from
  '@mui/icons-material/ExpandMore';

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const currentYear =
  new Date().getUTCFullYear();

function formatCurrency(value) {
  return Number(
    value || 0
  ).toLocaleString('es-CR');
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(
    'es-CR',
    {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );
}

export default function TeacherPayouts({
  teachers = [],
  refresh
}) {
  /*
   * Primer acordeón:
   * resumen de pagos a profesores.
   */
  const [rows, setRows] = useState([]);

  const [month, setMonth] = useState(
    new Date().getUTCMonth() + 1
  );

  const [year, setYear] = useState(
    currentYear
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
   * Segundo acordeón:
   * estudiantes por profesor.
   */
  const [
    studentRows,
    setStudentRows
  ] = useState([]);

  const [
    studentsMonth,
    setStudentsMonth
  ] = useState(
    new Date().getUTCMonth() + 1
  );

  const [
    studentsYear,
    setStudentsYear
  ] = useState(currentYear);

  const [
    selectedProfessor,
    setSelectedProfessor
  ] = useState('');

  const [
    studentsLoading,
    setStudentsLoading
  ] = useState(false);

  const [
    studentsError,
    setStudentsError
  ] = useState('');

  const data = useMemo(
    () =>
      Array.isArray(rows)
        ? rows
        : [],
    [rows]
  );

  const studentData = useMemo(
    () =>
      Array.isArray(studentRows)
        ? studentRows
        : [],
    [studentRows]
  );

  const teachersArray = useMemo(
    () =>
      Array.isArray(teachers)
        ? teachers
        : [],
    [teachers]
  );

  const years = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, index) =>
          currentYear - index
      ),
    []
  );

  /*
   * Cargar tabla principal.
   */
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(
          `/finance/teachers?month=${month}&year=${year}`
        );

        const list = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        if (alive) {
          setRows(list);
        }
      } catch (err) {
        console.error(
          'TeacherPayouts error:',
          err
        );

        if (alive) {
          setRows([]);

          setError(
            'No se pudo cargar el desglose.'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [month, year, refresh]);

  /*
   * Cargar estudiantes del segundo acordeón.
   */
  useEffect(() => {
    let alive = true;

    async function loadStudents() {
      setStudentsLoading(true);
      setStudentsError('');

      try {
        const response = await api.get(
          `/finance/teachers?month=${studentsMonth}&year=${studentsYear}`
        );

        const list = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        if (alive) {
          setStudentRows(list);
        }
      } catch (err) {
        console.error(
          'Students by teacher error:',
          err
        );

        if (alive) {
          setStudentRows([]);

          setStudentsError(
            'No se pudo cargar la lista de alumnos.'
          );
        }
      } finally {
        if (alive) {
          setStudentsLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      alive = false;
    };
  }, [
    studentsMonth,
    studentsYear,
    refresh
  ]);

  /*
   * Profesores cargados desde TeacherManager.
   * También agregamos profesores históricos
   * encontrados en el reporte.
   */
  const professorOptions = useMemo(() => {
    const names = [
      ...teachersArray.map(
        teacher => teacher?.name
      ),

      ...studentData.map(
        row => row?.professor
      )
    ].filter(Boolean);

    return Array.from(
      new Set(names)
    ).sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }, [
    teachersArray,
    studentData
  ]);

  const selectedProfessorData =
    useMemo(() => {
      if (!selectedProfessor) {
        return null;
      }

      return (
        studentData.find(
          row =>
            row?.professor ===
            selectedProfessor
        ) || null
      );
    }, [
      studentData,
      selectedProfessor
    ]);

  const selectedStudents = useMemo(
    () =>
      Array.isArray(
        selectedProfessorData?.students
      )
        ? selectedProfessorData.students
        : [],
    [selectedProfessorData]
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mt: 3,
          fontSize: {
            xs: '1.6rem',
            sm: '2.125rem'
          }
        }}
      >
        Desglose por Profesor
      </Typography>

      {/* ACORDEÓN 1: PAGOS A PROFESORES */}
      <Accordion
        sx={{
          width: '100%',
          minWidth: 0
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon />
          }
        >
          <Typography>
            Ver desglose
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            px: {
              xs: 1,
              sm: 2
            },
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 180px))'
              },
              gap: 2,
              mb: 2,
              width: '100%'
            }}
          >
            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Mes
              </InputLabel>

              <Select
                value={month}
                label="Mes"
                onChange={event =>
                  setMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {monthNames.map(
                  (monthName, index) => (
                    <MenuItem
                      key={index + 1}
                      value={index + 1}
                    >
                      {monthName}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Año
              </InputLabel>

              <Select
                value={year}
                label="Año"
                onChange={event =>
                  setYear(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {years.map(
                  yearOption => (
                    <MenuItem
                      key={yearOption}
                      value={yearOption}
                    >
                      {yearOption}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Typography>
              Cargando…
            </Typography>
          ) : error ? (
            <Typography color="error">
              {error}
            </Typography>
          ) : data.length === 0 ? (
            <Typography>
              No hay datos para este
              mes/año.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                WebkitOverflowScrolling:
                  'touch'
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 680
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Profesor
                    </TableCell>

                    <TableCell align="right">
                      Ingresos
                    </TableCell>

                    <TableCell align="right">
                      A Pagar
                    </TableCell>

                    <TableCell
                      align="right"
                      title="A pagar incluyendo 2% de IVA"
                    >
                      +2% IVA
                    </TableCell>

                    <TableCell align="right">
                      Ganancia
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map(row => {
                    const professor =
                      row?.professor ||
                      'Sin profesor';

                    const totalIngress =
                      Number(
                        row?.totalIngress ??
                          0
                      );

                    const totalToPay =
                      Number(
                        row?.totalToPay ??
                          0
                      );

                    const totalToPayWithVat =
                      Number(
                        row?.totalToPayWithVat ??
                          Math.round(
                            totalToPay *
                              1.02
                          )
                      );

                    const totalProfit =
                      Number(
                        row?.totalProfit ??
                          0
                      );

                    return (
                      <TableRow
                        key={professor}
                      >
                        <TableCell
                          sx={{
                            fontWeight:
                              600,
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {professor}
                        </TableCell>

                        <TableCell align="right">
                          ₡
                          {formatCurrency(
                            totalIngress
                          )}
                        </TableCell>

                        <TableCell align="right">
                          ₡
                          {formatCurrency(
                            totalToPay
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight:
                              700
                          }}
                        >
                          ₡
                          {formatCurrency(
                            totalToPayWithVat
                          )}
                        </TableCell>

                        <TableCell align="right">
                          ₡
                          {formatCurrency(
                            totalProfit
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* ACORDEÓN 2: ALUMNOS POR PROFESOR */}
      <Accordion
        sx={{
          width: '100%',
          minWidth: 0
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon />
          }
        >
          <Typography>
            Alumnos por profesor
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            px: {
              xs: 1,
              sm: 2
            },
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm:
                  'repeat(3, minmax(0, 1fr))'
              },
              gap: 2,
              mb: 2,
              width: '100%'
            }}
          >
            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Mes
              </InputLabel>

              <Select
                value={studentsMonth}
                label="Mes"
                onChange={event =>
                  setStudentsMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {monthNames.map(
                  (monthName, index) => (
                    <MenuItem
                      key={index + 1}
                      value={index + 1}
                    >
                      {monthName}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Año
              </InputLabel>

              <Select
                value={studentsYear}
                label="Año"
                onChange={event =>
                  setStudentsYear(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {years.map(
                  yearOption => (
                    <MenuItem
                      key={yearOption}
                      value={yearOption}
                    >
                      {yearOption}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Profesor
              </InputLabel>

              <Select
                value={
                  selectedProfessor
                }
                label="Profesor"
                onChange={event =>
                  setSelectedProfessor(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  <em>
                    Seleccionar
                  </em>
                </MenuItem>

                {professorOptions.map(
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
          </Box>

          {studentsLoading ? (
            <Typography>
              Cargando alumnos…
            </Typography>
          ) : studentsError ? (
            <Typography color="error">
              {studentsError}
            </Typography>
          ) : !selectedProfessor ? (
            <Typography
              color="text.secondary"
            >
              Seleccioná un profesor para
              consultar sus alumnos.
            </Typography>
          ) : selectedStudents.length ===
            0 ? (
            <Typography>
              No hay alumnos con pagos
              registrados para este
              profesor durante el periodo
              seleccionado.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {selectedStudents.map(
                student => (
                  <Paper
                    key={
                      student.studentId ||
                      student.studentName
                    }
                    variant="outlined"
                    sx={{
                      p: 2,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing:
                        'border-box'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          {
                            xs:
                              'minmax(0, 1fr)',
                            sm:
                              'minmax(0, 1fr) auto'
                          },
                        gap: 1.5,
                        alignItems:
                          'center',
                        minWidth: 0
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0
                        }}
                      >
                        <Typography
                          fontWeight={700}
                          sx={{
                            overflowWrap:
                              'anywhere'
                          }}
                        >
                          {
                            student.studentName
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflowWrap:
                              'anywhere'
                          }}
                        >
                          Clase:{' '}
                          {Array.isArray(
                            student.classes
                          ) &&
                          student.classes
                            .length > 0
                            ? student.classes.join(
                                ', '
                              )
                            : 'No disponible'}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                          sx={{
                            mt: 1
                          }}
                        >
                          <Chip
                            size="small"
                            label={`${
                              student.paymentCount ||
                              0
                            } pago(s)`}
                          />

                          <Chip
                            size="small"
                            label={`${
                              student.totalSessions ||
                              0
                            } sesión(es)`}
                          />
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              'block',
                            mt: 1
                          }}
                        >
                          Último pago:{' '}
                          {formatDate(
                            student.lastPaymentDate
                          )}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          textAlign: {
                            xs: 'left',
                            sm: 'right'
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Total pagado
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            overflowWrap:
                              'anywhere'
                          }}
                        >
                          ₡
                          {formatCurrency(
                            student.totalPaid
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )
              )}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
