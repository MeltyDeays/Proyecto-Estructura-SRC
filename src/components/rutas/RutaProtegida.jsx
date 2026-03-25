import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
  // Verificamos si el item 'usuario-supabase' existe en localStorage
  const estaAutenticado = localStorage.getItem("usuario-supabase") !== null;

  if (!estaAutenticado) {
    // Si no está autenticado, lo enviamos al login
    return <Navigate to="/login" replace />; 
  }

  // Si está autenticado, renderizamos la vista protegida
  return children;
};

export default RutaProtegida;