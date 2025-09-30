import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getCurrentUser, getUserRole, logout, clearCorruptedData } from '../utilidades/authAPI';
import authAPI from '../utilidades/authAPI';

/**
 * Hook personalizado para manejar la autenticación
 * Detecta cambios en la sesión en tiempo real
 */
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para verificar y actualizar el estado de autenticación
  const checkAuthStatus = useCallback(() => {
    try {
      setError(null);

      // Limpiar datos corruptos primero
      clearCorruptedData();

      const authenticated = isAuthenticated();

      if (authenticated) {
        const userData = getCurrentUser();
        const role = getUserRole();

        if (userData && role && userData.id && userData.email) {
          setIsLoggedIn(true);
          setUser(userData);
          setUserRole(role);
        } else {
          // Limpiar datos corruptos y reintentar una vez más
          authAPI.clearAuthData();

          // Verificar si hay datos de respaldo
          const backupUserData = getCurrentUser();
          const backupRole = getUserRole();

          if (backupUserData && backupRole && backupUserData.id && backupUserData.email) {
            setIsLoggedIn(true);
            setUser(backupUserData);
            setUserRole(backupRole);
          } else {
            setIsLoggedIn(false);
            setUser(null);
            setUserRole('');
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole('');
      }
    } catch (err) {
      setError(err.message);
      setIsLoggedIn(false);
      setUser(null);
      setUserRole('');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para hacer logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
      setUserRole('');
    } catch (err) {
      // Forzar logout local incluso si falla en el servidor
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      setUserRole('');
    }
  }, []);

  // Función para hacer login (actualizar estado)
  const handleLogin = useCallback((userData, role) => {
    setIsLoggedIn(true);
    setUser(userData);
    setUserRole(role);
  }, []);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Escuchar cambios en localStorage para detectar login/logout desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkAuthStatus();
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // También escuchar eventos personalizados de login/logout
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    // Verificar periódicamente el estado de autenticación (cada 30 segundos)
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        // Solo verificar si deberíamos estar autenticados
        const currentToken = localStorage.getItem('authToken');
        if (currentToken) {
          checkAuthStatus();
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
      clearInterval(interval);
    };
  }, [checkAuthStatus]);

  // Función para refrescar manualmente el estado de autenticación
  const refreshAuth = useCallback(() => {
    setLoading(true);
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Función para recuperar datos del usuario si se pierden
  const recoverUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const profile = await authAPI.getProfile();
        if (profile && profile.user) {
          const userData = {
            id: profile.user.id,
            name: profile.user.name,
            email: profile.user.email,
            role: profile.user.role,
            empresaId: profile.user.empresaId || profile.user.idEmpresa || profile.user.empresa_id || profile.user.companyId
          };

          // Guardar los datos recuperados
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('userName', userData.name || '');
          localStorage.setItem('userRole', userData.role || '');
          localStorage.setItem('userEmail', userData.email || '');
          localStorage.setItem('userId', userData.id || '');

          setUser(userData);
          setUserRole(userData.role);
          setIsLoggedIn(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    isLoggedIn,
    user,
    userRole,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshAuth,
    checkAuth: checkAuthStatus,
    recoverUserData
  };
};

export default useAuth;