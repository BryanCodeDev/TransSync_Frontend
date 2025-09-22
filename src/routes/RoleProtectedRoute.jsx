import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utilidades/authAPI';

const RoleProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/home',
  requireAll = false
}) => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();

  // Si no se especifican roles permitidos, permitir acceso a todos los usuarios autenticados
  if (allowedRoles.length === 0) {
    return children;
  }

  // Verificar permisos
  const hasPermission = requireAll
    ? allowedRoles.every(role => userRole === role)
    : allowedRoles.includes(userRole);

  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleProtectedRoute;