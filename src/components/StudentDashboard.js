// src/components/StudentDashboard.js
import React from 'react';
import EnrollmentForm from './EnrollmentForm';

const StudentDashboard = () => {
  // Lista simulada de clases disponibles
  const availableClasses = [
    { id: 1, title: 'Clase de Música' },
    { id: 2, title: 'Clase de Danza' },
    { id: 3, title: 'Clase de Guitarra' },
  ];

  return (
    <div>
      <h2>Dashboard del Alumno</h2>
      <p>Aquí podrás ver tus clases y matricularte en las disponibles.</p>
      
      {/* Componente para la matrícula de clases */}
      <EnrollmentForm availableClasses={availableClasses} />
      
      {/* En el futuro se pueden agregar más secciones (por ejemplo, estado de pagos, horarios, etc.) */}
    </div>
  );
};

export default StudentDashboard;
