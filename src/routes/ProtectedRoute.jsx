import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/authService';

const ProtectedRoute = ({ children, requiredRoles = [], redirectTo = '/login' }) => {
  const location = useLocation();
  
  // Verificar si está autenticado
  if (!isAuthenticated()) {
    // Guardar la ruta actual para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si se requieren roles específicos, verificar
  if (requiredRoles.length > 0) {
    const userRole = getUserRole();
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Si no tiene el rol requerido, redirigir según el rol que tenga
      if (userRole === 'SUPERADMIN' || userRole === 'ADMINISTRADOR') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;