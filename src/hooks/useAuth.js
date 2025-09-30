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

      // ✅ CORRECCIÓN CRÍTICA: Mejor validación de datos corruptos
      const wasCorrupted = clearCorruptedData();

      const authenticated = isAuthenticated();

      if (authenticated) {
        const userData = getCurrentUser();
        const role = getUserRole();

        // ✅ CORRECCIÓN CRÍTICA: Validar que tenemos todos los datos requeridos incluyendo empresaId
        if (userData && role && userData.id && userData.email && userData.empresaId) {
          setIsLoggedIn(true);
          setUser(userData);
          setUserRole(role);
        } else {
          console.warn('⚠️ Datos de usuario incompletos detectados:', {
            hasUserData: !!userData,
            hasRole: !!role,
            hasId: !!userData?.id,
            hasEmail: !!userData?.email,
            hasEmpresaId: !!userData?.empresaId
          });

          // Intentar recuperar datos faltantes
          if (userData && userData.id && userData.email) {
            console.log('🔄 Intentando recuperar empresaId faltante...');

            // Buscar empresaId en diferentes fuentes
            const empresaIdFromStorage = localStorage.getItem('empresaId') ||
                                       localStorage.getItem('userEmpresaId') ||
                                       localStorage.getItem('companyId');

            if (empresaIdFromStorage) {
              userData.empresaId = empresaIdFromStorage;
              console.log('✅ empresaId recuperado:', empresaIdFromStorage);

              // Actualizar datos en localStorage
              localStorage.setItem('userData', JSON.stringify(userData));
              localStorage.setItem('empresaId', empresaIdFromStorage);

              setIsLoggedIn(true);
              setUser(userData);
              setUserRole(role);
              return;
            }
          }

          // Si no se pudieron recuperar los datos, limpiar y mostrar error
          authAPI.clearAuthData();
          setIsLoggedIn(false);
          setUser(null);
          setUserRole('');

          if (wasCorrupted) {
            setError('Los datos de autenticación estaban corruptos y fueron limpiados. Por favor inicie sesión nuevamente.');
          } else {
            setError('Los datos de autenticación están incompletos. Por favor inicie sesión nuevamente.');
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole('');
      }
    } catch (err) {
      console.error('❌ Error verificando estado de autenticación:', err);
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
      if (!token) {
        console.warn('⚠️ No hay token disponible para recuperar datos del usuario');
        return false;
      }

      console.log('🔄 Intentando recuperar datos del usuario desde el servidor...');

      const profile = await authAPI.getProfile();
      if (profile && profile.user) {
        const userData = {
          id: profile.user.id,
          name: profile.user.name,
          email: profile.user.email,
          role: profile.user.role,
          empresaId: profile.user.empresaId || profile.user.idEmpresa || profile.user.empresa_id || profile.user.companyId
        };

        // ✅ CORRECCIÓN CRÍTICA: Validar que tenemos todos los datos requeridos
        if (!userData.empresaId) {
          console.error('❌ El servidor no devolvió empresaId en el perfil del usuario');
          return false;
        }

        if (userData.id && userData.email && userData.empresaId) {
          // Guardar los datos recuperados
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('userContext', JSON.stringify(userData));
          localStorage.setItem('userName', userData.name || '');
          localStorage.setItem('userRole', userData.role || '');
          localStorage.setItem('userEmail', userData.email || '');
          localStorage.setItem('userId', userData.id || '');
          localStorage.setItem('empresaId', userData.empresaId || '');

          console.log('✅ Datos del usuario recuperados exitosamente:', userData);

          setUser(userData);
          setUserRole(userData.role);
          setIsLoggedIn(true);
          return true;
        } else {
          console.error('❌ Datos del usuario recuperados están incompletos:', userData);
          return false;
        }
      } else {
        console.error('❌ El servidor no devolvió datos válidos del perfil del usuario');
        return false;
      }
    } catch (error) {
      console.error('❌ Error recuperando datos del usuario:', error);
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