// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Si no hay usuario autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }
  
  // Si hay usuario, muestra el contenido de la ruta
  return children;
};

export default ProtectedRoute;
