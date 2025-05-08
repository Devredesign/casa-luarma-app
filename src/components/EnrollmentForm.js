// src/components/EnrollmentForm.js
import React, { useState } from 'react';

const EnrollmentForm = ({ availableClasses }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  const handleEnroll = (e) => {
    e.preventDefault();
    if (selectedClass) {
      // Se crea una matrícula (en un escenario real se enviaría al backend)
      const newEnrollment = { id: enrollments.length + 1, classTitle: selectedClass };
      setEnrollments([...enrollments, newEnrollment]);
      // Reinicia el dropdown
      setSelectedClass('');
    }
  };

  return (
    <div>
      <h3>Matriculación</h3>
      <form onSubmit={handleEnroll}>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          required
        >
          <option value="">Seleccione una clase</option>
          {availableClasses.map((cls) => (
            <option key={cls.id} value={cls.title}>
              {cls.title}
            </option>
          ))}
        </select>
        <button type="submit">Matricularse</button>
      </form>

      <h4>Mis Matrículas</h4>
      {enrollments.length === 0 ? (
        <p>No estás matriculado en ninguna clase.</p>
      ) : (
        <ul>
          {enrollments.map((enrollment) => (
            <li key={enrollment.id}>{enrollment.classTitle}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnrollmentForm;
