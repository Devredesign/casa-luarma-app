// src/components/QuickActionDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Stack
} from '@mui/material';

import StudentsManager from './StudentsManager';
import RentalManager   from './RentalManager';
import PaymentManager  from './PaymentManager';
import ClassesManager  from './ClassesManager';
import TeacherManager  from './TeacherManager';

const steps = [
  '¿Qué querés hacer?',
  'Acción rápida'
];

export default function QuickActionDialog({
  open,
  onClose,
  spaces = [],
  classesList = [],
  students = [],
  teachers = [],
  modalities = [],
  calendarToken,
  setCalendarToken,
  onStudentsUpdate,
  onRentalsUpdate,
  onPaymentsUpdate,
  onClassesUpdate,
  onTeachersUpdate
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [action, setAction]         = useState(null);

  const handleSelectAction = (act) => {
    setAction(act);
    setActiveStep(1);
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ my: 2, rowGap: 2 }}
        >
          <Button variant="contained" onClick={() => handleSelectAction('matricular')}>
            Matricular Estudiante
          </Button>
          <Button variant="contained" onClick={() => handleSelectAction('alquilar')}>
            Alquilar Espacio
          </Button>
          <Button variant="contained" onClick={() => handleSelectAction('pagar')}>
            Guardar Pago
          </Button>
          <Button variant="contained" onClick={() => handleSelectAction('crearClase')}
            disabled={!teachers?.length || !modalities?.length}>
            Crear Clase
          </Button>
          <Button variant="contained" onClick={() => handleSelectAction('anadirProfe')}>
            Añadir Profesor
          </Button>
        </Stack>
      );
    }

    switch (action) {
      case 'matricular':
        return (
          <StudentsManager
            quick
            onStudentsUpdate={onStudentsUpdate}
          />
        );
      case 'alquilar':
        return (
          <RentalManager
            quick
            spaces={spaces}
            onRentalsUpdate={onRentalsUpdate}
            calendarToken={calendarToken}
            setCalendarToken={setCalendarToken}
            onEventSynced={() => {}}
          />
        );
      case 'pagar':
        return (
          <PaymentManager
            quick
            classesList={classesList}
            students={students}
            onPaymentsUpdate={onPaymentsUpdate}
          />
        );
      case 'crearClase':
        return (
          <ClassesManager
            quick
            teachers={teachers}
            spaces={spaces}
            modalities={modalities}
            calendarToken={calendarToken}
            setCalendarToken={setCalendarToken}
            onClassesUpdate={onClassesUpdate}
            refreshCalendar={() => {}}
          />
        );
      case 'anadirProfe':
        return (
          <TeacherManager
            quick
            onTeachersUpdate={onTeachersUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Acción rápida</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        {activeStep === 0
          ? <Button onClick={onClose}>Cancelar</Button>
          : <Button onClick={() => setActiveStep(0)}>Volver a acciones</Button>
        }
      </DialogActions>
    </Dialog>
  );
}
