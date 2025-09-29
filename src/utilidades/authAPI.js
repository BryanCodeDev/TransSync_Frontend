// api/authAPI.js - Servicio de autenticación integrado
import { apiClient, apiUtils } from '../api/baseAPI';


const authAPI = {
  // ================================
  // AUTENTICACIÓN BÁSICA
  // ================================

  // Registro de usuario
  // REEMPLAZA LA FUNCIÓN VIEJA CON ESTA:

  // Registro de usuario
  register: async (userData) => {
    try {
      // 1. Validación de campos requeridos según el backend
      const requiredFields = ['nomUsuario', 'apeUsuario', 'numDocUsuario', 'telUsuario', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !userData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // 2. Validar formato de email
      if (!apiUtils.isValidEmail(userData.email)) {
        throw new Error('Formato de email inválido');
      }

      // 3. Validar contraseña segura
      if (userData.password && userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // 4. Enviar datos al backend con el formato correcto
      const response = await apiClient.post('/api/auth/register', {
        nomUsuario: userData.nomUsuario.trim(),
        apeUsuario: userData.apeUsuario.trim(),
        numDocUsuario: userData.numDocUsuario.trim(),
        telUsuario: userData.telUsuario.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      });

      return response.data;

    } catch (error) {
      // Re-lanzar el error para que sea manejado por el interceptor
      // o por el componente que llamó a la función.
      throw error;
    }
  },
  // Login de usuario
  login: async (credentials, password) => {
    try {
      // Permitir tanto formato de objeto como parámetros separados
      let email, finalPassword;

      if (typeof credentials === 'object') {
        ({ email, password: finalPassword } = credentials);
      } else {
        // Compatibilidad con authService.js (email, password como parámetros)
        email = credentials;
        finalPassword = password;
      }

      // Validaciones
      if (!email || !finalPassword) {
        throw new Error("Email y contraseña son requeridos");
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }


      const response = await apiClient.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: finalPassword
      });


      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (!response.data.token) {
        throw new Error('No se recibió token de autenticación');
      }

      // Buscar datos del usuario en diferentes ubicaciones de la respuesta
      let user = response.data.user;
      if (!user) {
        // Intentar buscar en otras ubicaciones comunes
        user = response.data.userData || response.data.profile || response.data.data;
      }

      if (!user) {
        throw new Error('No se recibieron datos del usuario');
      }

      // Verificar que el usuario tenga los campos requeridos
      if (!user.id || !user.email) {
        throw new Error('Los datos del usuario están incompletos');
      }

      // Guardar datos de autenticación automáticamente
      try {
        authAPI.saveAuthData(response.data);
      } catch (saveError) {
        throw new Error('Error al guardar los datos de autenticación');
      }

      return response.data;
    } catch (error) {

      // Manejo específico de errores de login
      if (error.status === 401 || error.response?.status === 401) {
        throw new Error('Credenciales incorrectas. Verifique su email y contraseña.');
      } else if (error.status === 403 || error.response?.status === 403) {
        throw new Error('Su cuenta no está activada. Por favor verifique su correo electrónico.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("La solicitud tardó demasiado. Verifique su conexión e intente nuevamente.");
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error("No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.");
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar cuenta
  verifyAccount: async (token) => {
    try {
      if (!token) {
        throw new Error('Token de verificación requerido');
      }

      const response = await apiClient.get(`/api/auth/verify?token=${token}`);
      return response.data;
    } catch (error) {
      if (error.status === 400 || error.response?.status === 400) {
        throw new Error('Token de verificación inválido o expirado.');
      } else if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Usuario no encontrado o ya verificado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ================================

  // Olvido de contraseña
  forgotPassword: async (email) => {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Por favor ingrese un correo electrónico válido');
      }

      const response = await apiClient.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      if (error.status === 404 || error.response?.status === 404) {
        throw new Error('El correo electrónico no está registrado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      if (!token || !newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      const response = await apiClient.post(`/api/auth/reset-password?token=${token}`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.status === 400 || error.response?.status === 400) {
        throw new Error('Token de restablecimiento inválido o expirado.');
      } else if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Usuario no encontrado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE SESIÓN
  // ================================

  // Logout
  logout: async () => {
    try {
      // Intentar logout en el servidor (opcional)
      try {
        await apiClient.post('/api/auth/logout');
      } catch (error) {
        // Error en logout del servidor - logged in production builds
      }

      // Limpiar datos locales
      authAPI.clearAuthData();

      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      // Error en logout - logged in production builds
      // Limpiar de todas formas
      authAPI.clearAuthData();
      return { success: false, message: 'Error al cerrar sesión, pero se limpió localmente' };
    }
  },

  // ================================
  // ENDPOINTS PROTEGIDOS
  // ================================

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/api/auth/verify-token');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE PERFIL
  // ================================

  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    try {
      const { name, email } = profileData;

      if (email && !apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await apiClient.put('/api/auth/profile', {
        name: name?.trim(),
        email: email?.trim().toLowerCase()
      });

      // Actualizar datos en localStorage
      if (response.data.user) {
        const currentData = authAPI.getCurrentUser() || {};
        const updatedUser = { ...currentData, ...response.data.user };

        localStorage.setItem('userData', JSON.stringify(updatedUser));
        localStorage.setItem('userName', updatedUser.name || '');
        localStorage.setItem('userEmail', updatedUser.email || '');
      }

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      const missing = apiUtils.validateRequired({ currentPassword, newPassword, confirmPassword });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      const response = await apiClient.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES DE AUTENTICACIÓN
  // ================================

  // Verificar si está autenticado
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
      const isAuth = localStorage.getItem('isAuthenticated');
      return !!(token && isAuth === 'true');
    } catch (error) {
      return false;
    }
  },

  // Obtener datos del usuario actual
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          // Validar que el objeto parseado tenga la estructura mínima
          if (parsed && typeof parsed === 'object') {
            return {
              id: parsed.id || parsed.userId || parsed._id,
              name: parsed.name || parsed.userName || parsed.fullName || 'Usuario',
              email: parsed.email || parsed.userEmail,
              role: parsed.role || parsed.userRole || parsed.type || 'USER'
            };
          }
        } catch (parseError) {
          // Error parsing userData JSON, attempting recovery
        }
      }

      // Fallback con datos separados
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      if (userName || userRole || userEmail || userId) {
        return {
          id: userId || 'unknown',
          name: userName || 'Usuario',
          email: userEmail || 'user@example.com',
          role: userRole || 'USER'
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  // Obtener rol del usuario
  getUserRole: () => {
    try {
      return localStorage.getItem('userRole') || null;
    } catch (error) {
      return null;
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (role) => {
    const userRole = authAPI.getUserRole();
    return userRole === role;
  },

  // Verificar si es superadmin
  isSuperAdmin: () => {
    return authAPI.hasRole('SUPERADMIN');
  },

  // Verificar si es gestor
  isGestor: () => {
    return authAPI.hasRole('GESTOR');
  },

  // Verificar si es conductor
  isConductor: () => {
    return authAPI.hasRole('CONDUCTOR');
  },

  // Verificar si es administrador (mantiene compatibilidad)
  isAdmin: () => {
    return authAPI.hasRole('ADMINISTRADOR') || authAPI.hasRole('SUPERADMIN') || authAPI.hasRole('GESTOR');
  },

  // ================================
  // MANEJO DE DATOS LOCALES
  // ================================

  // Guardar datos de autenticación
  saveAuthData: (authData) => {
    try {
      if (authData.token) {
        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('userToken', authData.token); // Por compatibilidad
        localStorage.setItem('isAuthenticated', 'true');

        // Buscar datos del usuario en múltiples ubicaciones posibles
        let userData = null;

        // 1. Intentar obtener de authData.user
        if (authData.user && typeof authData.user === 'object') {
          userData = authData.user;
        }
        // 2. Intentar obtener de authData.userData
        else if (authData.userData && typeof authData.userData === 'object') {
          userData = authData.userData;
        }
        // 3. Intentar obtener de authData.profile
        else if (authData.profile && typeof authData.profile === 'object') {
          userData = authData.profile;
        }
        // 4. Intentar obtener de authData.data
        else if (authData.data && typeof authData.data === 'object') {
          userData = authData.data;
        }

        if (userData) {
          // Crear objeto de usuario con valores por defecto seguros
          const finalUserData = {
            id: userData.id || userData.userId || userData._id,
            name: userData.name || userData.userName || userData.fullName || userData.displayName,
            email: userData.email || userData.userEmail,
            role: userData.role || userData.userRole || userData.type || 'USER'
          };

          // Validar que al menos tengamos id y email
          if (finalUserData.id && finalUserData.email) {
            localStorage.setItem('userData', JSON.stringify(finalUserData));
            localStorage.setItem('userName', finalUserData.name || '');
            localStorage.setItem('userRole', finalUserData.role || '');
            localStorage.setItem('userEmail', finalUserData.email || '');
            localStorage.setItem('userId', finalUserData.id || '');

            // User data saved successfully
          } else {
            // User data incomplete, creating minimal user object
            const minimalUserData = {
              id: finalUserData.id || 'unknown',
              name: finalUserData.name || 'Usuario',
              email: finalUserData.email || 'user@example.com',
              role: finalUserData.role || 'USER'
            };

            localStorage.setItem('userData', JSON.stringify(minimalUserData));
            localStorage.setItem('userName', minimalUserData.name);
            localStorage.setItem('userRole', minimalUserData.role);
            localStorage.setItem('userEmail', minimalUserData.email);
            localStorage.setItem('userId', minimalUserData.id);
          }
        } else {
          // No user data found in response, creating fallback user
          const fallbackUserData = {
            id: 'fallback',
            name: 'Usuario',
            email: 'user@example.com',
            role: 'USER'
          };

          localStorage.setItem('userData', JSON.stringify(fallbackUserData));
          localStorage.setItem('userName', fallbackUserData.name);
          localStorage.setItem('userRole', fallbackUserData.role);
          localStorage.setItem('userEmail', fallbackUserData.email);
          localStorage.setItem('userId', fallbackUserData.id);
        }
      } else {
        throw new Error('No authentication token provided');
      }
    } catch (error) {
      throw new Error(`Failed to save authentication data: ${error.message}`);
    }
  },

  // Limpiar datos de autenticación
  clearAuthData: () => {
    try {
      const keysToRemove = [
        'authToken', 'userToken', 'userData', 'isAuthenticated',
        'userName', 'userRole', 'userEmail', 'userId', 'rememberedEmail'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('rememberMe', 'false');

      return true;
    } catch (error) {
      // Error en clearAuthData - logged in production builds
      // Limpiar de todas formas
      localStorage.clear();
      return false;
    }
  },

  // Obtener token de autorización
  getAuthToken: () => {
    return localStorage.getItem('authToken') || localStorage.getItem('userToken');
  },

  // ================================
  // UTILIDADES DE DEBUGGING
  // ================================

  // Limpiar datos corruptos de localStorage
  clearCorruptedData: () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const isAuth = localStorage.getItem('isAuthenticated');

      let corrupted = false;

      if (token && isAuth === 'true') {
        if (!userData) {
          corrupted = true;
        } else {
          try {
            const parsedUser = JSON.parse(userData);
            if (!parsedUser.id || !parsedUser.email) {
              corrupted = true;
            }
          } catch (e) {
            corrupted = true;
          }
        }
      }

      if (corrupted) {
        authAPI.clearAuthData();
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  },

  // ================================
  // DIAGNÓSTICO DE CONEXIÓN
  // ================================

  // Función para diagnosticar problemas de conexión
  diagnoseConnection: async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      frontend: {},
      backend: {},
      issues: []
    };

    try {
      // Verificar configuración del frontend
      diagnostics.frontend = {
        apiUrl: process.env.REACT_APP_API_URL || "https://transyncbackend-production.up.railway.app",
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
        environment: process.env.NODE_ENV || 'development'
      };

      // Verificar localStorage
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const isAuth = localStorage.getItem('isAuthenticated');

      diagnostics.frontend.localStorage = {
        hasToken: !!token,
        hasUserData: !!userData,
        isAuthenticated: isAuth === 'true'
      };

      if (token) {
        diagnostics.frontend.localStorage.tokenLength = token.length;
      }

      // Verificar conectividad básica
      const apiUrl = diagnostics.frontend.apiUrl;
      try {
        const response = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        diagnostics.backend.health = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };

        if (response.ok) {
          const data = await response.json();
          diagnostics.backend.health.data = data;
        }
      } catch (error) {
        diagnostics.backend.health = {
          error: error.message,
          code: error.code || 'UNKNOWN'
        };
        diagnostics.issues.push('No se puede conectar al endpoint de health');
      }

      // Verificar endpoint de login
      try {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        diagnostics.backend.loginEndpoint = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        diagnostics.backend.loginEndpoint = {
          error: error.message,
          code: error.code || 'UNKNOWN'
        };
        diagnostics.issues.push('No se puede acceder al endpoint de login');
      }

      // Verificar CORS
      try {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123'
          }),
          signal: AbortSignal.timeout(5000)
        });

        diagnostics.backend.corsTest = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };

        if (response.status === 401) {
          diagnostics.backend.corsTest.note = 'CORS funciona correctamente (401 es respuesta esperada para credenciales inválidas)';
        }
      } catch (error) {
        diagnostics.backend.corsTest = {
          error: error.message,
          code: error.code || 'UNKNOWN'
        };

        if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
          diagnostics.issues.push('Problema de CORS detectado');
        }
      }

    } catch (error) {
      diagnostics.error = error.message;
      diagnostics.issues.push('Error general en el diagnóstico');
    }

    return diagnostics;
  },

  // ================================
  // VERIFICACIÓN DE SALUD
  // ================================

  // Verificar la salud de la conexión con el servidor de auth
  checkServerHealth: async () => {
    try {
      const startTime = Date.now();

      // Intentar tanto el endpoint de health específico como uno general
      let response;
      try {
        response = await apiClient.get('/api/auth/health', { timeout: 5000 });
      } catch (error) {
        // Fallback a health check general usando la URL configurada
        const apiUrl = process.env.REACT_APP_API_URL || "https://transyncbackend-production.up.railway.app";
        response = await fetch(`${apiUrl}/api/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Server health check failed');
        }

        response = {
          status: response.status,
          data: { status: 'OK', message: 'Servidor conectado' }
        };
      }

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        return {
          status: 'OK',
          message: 'Servidor de autenticación conectado',
          responseTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 'WARNING',
          message: 'Servidor de autenticación responde pero con problemas',
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'No se puede conectar con el servidor de autenticación',
        error: apiUtils.formatError(error),
        timestamp: new Date().toISOString(),
        responseTime: null
      };
    }
  }
};

// Exportaciones compatibles con ambos sistemas
export default authAPI;

// Exportaciones individuales para compatibilidad con authService.js
export const {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  verifyToken,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  isSuperAdmin,
  isGestor,
  isConductor,
  isAdmin,
  checkServerHealth,
  diagnoseConnection,
  clearCorruptedData
} = authAPI;