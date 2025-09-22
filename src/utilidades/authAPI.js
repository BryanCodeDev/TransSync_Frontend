// api/authAPI.js - Servicio de autenticación integrado
import { apiClient, apiUtils } from '../api/baseAPI';
import { errorHandler, ERROR_CODES } from './errorHandler';
import tokenManager from './tokenManager';


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
      errorHandler.logError(error, 'authAPI.register');
      const processedError = errorHandler.processError(error);
      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
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

      // Guardar datos de autenticación automáticamente
      if (response.data.token) {
        authAPI.saveAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      errorHandler.logError(error, 'authAPI.login');
      const processedError = errorHandler.processError(error);

      // Manejo específico de errores de login con nuevos códigos
      if (error.response?.status === 401) {
        if (error.response?.data?.error?.code === 'NO_TOKEN') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de autenticación no proporcionado');
        } else if (error.response?.data?.error?.code === 'INVALID_TOKEN') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de autenticación inválido');
        } else if (error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Token de autenticación expirado');
        } else {
          throw errorHandler.createError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Credenciales incorrectas. Verifique su email y contraseña.');
        }
      } else if (error.response?.status === 403) {
        if (error.response?.data?.error?.code === 'UNAUTHORIZED') {
          throw errorHandler.createError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Acceso no autorizado');
        } else if (error.response?.data?.error?.code === 'INVALID_USER') {
          throw errorHandler.createError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Usuario inválido o inactivo');
        } else if (error.response?.data?.error?.code === 'ACCESS_DENIED') {
          throw errorHandler.createError(ERROR_CODES.AUTH_ACCESS_DENIED, 'Acceso denegado por permisos insuficientes');
        } else {
          throw errorHandler.createError(ERROR_CODES.AUTH_UNAUTHORIZED, 'Su cuenta no está activada. Por favor verifique su correo electrónico.');
        }
      } else if (error.response?.status === 400) {
        if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
          throw errorHandler.createError(ERROR_CODES.VALIDATION_ERROR, error.response?.data?.error?.message || 'Error de validación en los datos proporcionados');
        }
      }

      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
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
      errorHandler.logError(error, 'authAPI.verifyAccount');
      const processedError = errorHandler.processError(error);

      if (error.response?.status === 400) {
        if (error.response?.data?.error?.code === 'INVALID_TOKEN') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de verificación inválido');
        } else if (error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Token de verificación expirado');
        } else {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de verificación inválido o expirado.');
        }
      } else if (error.response?.status === 404) {
        if (error.response?.data?.error?.code === 'INVALID_USER') {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'Usuario no encontrado');
        } else {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'Usuario no encontrado o ya verificado.');
        }
      }

      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
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
      errorHandler.logError(error, 'authAPI.forgotPassword');
      const processedError = errorHandler.processError(error);

      if (error.response?.status === 404) {
        if (error.response?.data?.error?.code === 'INVALID_USER') {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'El correo electrónico no está registrado');
        } else {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'El correo electrónico no está registrado.');
        }
      } else if (error.response?.status === 400) {
        if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
          throw errorHandler.createError(ERROR_CODES.VALIDATION_ERROR, error.response?.data?.error?.message || 'Error de validación en el correo electrónico');
        }
      }

      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
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
      errorHandler.logError(error, 'authAPI.resetPassword');
      const processedError = errorHandler.processError(error);

      if (error.response?.status === 400) {
        if (error.response?.data?.error?.code === 'INVALID_TOKEN') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de restablecimiento inválido');
        } else if (error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Token de restablecimiento expirado');
        } else if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
          throw errorHandler.createError(ERROR_CODES.VALIDATION_ERROR, error.response?.data?.error?.message || 'Error de validación en la nueva contraseña');
        } else {
          throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token de restablecimiento inválido o expirado.');
        }
      } else if (error.response?.status === 404) {
        if (error.response?.data?.error?.code === 'INVALID_USER') {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'Usuario no encontrado');
        } else {
          throw errorHandler.createError(ERROR_CODES.USER_NOT_FOUND, 'Usuario no encontrado.');
        }
      }

      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
    }
  },

  // ================================
  // GESTIÓN DE TOKENS JWT
  // ================================

  // Renovar token JWT
  refreshToken: async () => {
    try {
      const currentToken = tokenManager.getToken();
      if (!currentToken) {
        throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_INVALID, 'No hay token para renovar');
      }

      const response = await apiClient.post('/api/auth/refresh', {
        token: currentToken
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al renovar token');
      }

      if (response.data.token) {
        // Usar tokenManager para guardar el nuevo token
        tokenManager.setToken(response.data.token);

        // Actualizar datos del usuario si se proporcionan
        if (response.data.user) {
          const currentData = authAPI.getCurrentUser() || {};
          const updatedUser = { ...currentData, ...response.data.user };

          localStorage.setItem('userData', JSON.stringify(updatedUser));
          localStorage.setItem('userName', updatedUser.name || '');
          localStorage.setItem('userRole', updatedUser.rol || '');
          localStorage.setItem('userEmail', updatedUser.email || '');
          localStorage.setItem('userId', updatedUser.id || '');
        }

        console.log('✅ Token renovado exitosamente');
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          error: null
        };
      } else {
        throw new Error('No se recibió token en la respuesta de refresh');
      }

    } catch (error) {
      errorHandler.logError(error, 'authAPI.refreshToken');

      // Si el refresh falla, hacer logout
      console.error('❌ Error renovando token, cerrando sesión...');
      authAPI.logout();

      return {
        success: false,
        token: null,
        user: null,
        error: errorHandler.processError(error)
      };
    }
  },

  // Verificar estado del token
  checkTokenStatus: () => {
    return tokenManager.getTokenInfo();
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
        console.warn('Error en logout del servidor:', error);
      }

      // Limpiar datos locales
      authAPI.clearAuthData();

      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      console.error('Error en logout:', error);
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
      errorHandler.logError(error, 'authAPI.getProfile');
      const processedError = errorHandler.processError(error);
      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/api/auth/verify-token');
      return response.data;
    } catch (error) {
      errorHandler.logError(error, 'authAPI.changePassword');
      const processedError = errorHandler.processError(error);
      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
    }
  },

  // ================================
  // GESTIÓN DE PERFIL
  // ================================

  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    try {
      const { name, email, phone } = profileData;

      // Validaciones mejoradas según especificaciones del backend
      if (name) {
        // Validar nombres: solo letras y espacios, 2-80 caracteres
        if (name.length < 2 || name.length > 80) {
          throw new Error('El nombre debe tener entre 2 y 80 caracteres');
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
          throw new Error('El nombre solo puede contener letras y espacios');
        }
      }

      if (email) {
        // Validar email: formato válido, máximo 80 caracteres
        if (email.length > 80) {
          throw new Error('El email no puede tener más de 80 caracteres');
        }
        if (!apiUtils.isValidEmail(email)) {
          throw new Error('Formato de email inválido');
        }
      }

      if (phone) {
        // Validar teléfono: formato internacional, 7-16 dígitos
        if (phone.length < 7 || phone.length > 16) {
          throw new Error('El teléfono debe tener entre 7 y 16 dígitos');
        }
        if (!/^[\d\s\-+()]+$/.test(phone)) {
          throw new Error('El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +');
        }
      }

      const response = await apiClient.put('/api/auth/profile', {
        name: name?.trim(),
        email: email?.trim().toLowerCase(),
        phone: phone?.trim()
      });

      // Actualizar datos en localStorage
      if (response.data.user) {
        const currentData = authAPI.getCurrentUser() || {};
        const updatedUser = { ...currentData, ...response.data.user };

        localStorage.setItem('userData', JSON.stringify(updatedUser));
        localStorage.setItem('userName', updatedUser.name || '');
        localStorage.setItem('userRole', updatedUser.rol || '');
        localStorage.setItem('userEmail', updatedUser.email || '');
        localStorage.setItem('userId', updatedUser.id || '');
      }

      return response.data;
    } catch (error) {
      errorHandler.logError(error, 'authAPI.updateProfile');
      const processedError = errorHandler.processError(error);

      // Manejo específico de errores de validación
      if (error.response?.status === 400) {
        if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
          throw errorHandler.createError(ERROR_CODES.VALIDATION_ERROR, error.response?.data?.error?.message || 'Error de validación en los datos proporcionados');
        } else if (error.response?.data?.error?.code === 'EMAIL_EXISTS') {
          throw errorHandler.createError(ERROR_CODES.RESOURCE_ALREADY_EXISTS, 'El email ya está registrado en el sistema');
        }
      } else if (error.response?.status === 409) {
        if (error.response?.data?.error?.code === 'EMAIL_EXISTS') {
          throw errorHandler.createError(ERROR_CODES.RESOURCE_ALREADY_EXISTS, 'El email ya está registrado en el sistema');
        }
      }

      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
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
      errorHandler.logError(error, 'authAPI.verifyToken');
      const processedError = errorHandler.processError(error);
      throw errorHandler.createError(processedError.code, processedError.message, processedError.details);
    }
  },

  // ================================
  // UTILIDADES DE AUTENTICACIÓN
  // ================================

  // Verificar si está autenticado
  isAuthenticated: () => {
    try {
      const token = tokenManager.getToken();
      const isAuth = localStorage.getItem('isAuthenticated');
      return !!(token && isAuth === 'true' && tokenManager.isTokenValid(token));
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Obtener datos del usuario actual
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }

      // Fallback con datos separados
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      if (userName || userRole || userEmail || userId) {
        return {
          id: userId,
          name: userName,
          email: userEmail,
          rol: userRole
        };
      }

      return null;
    } catch (error) {
      console.error('Error parseando userData:', error);
      return null;
    }
  },

  // Obtener rol del usuario
  getUserRole: () => {
    try {
      return localStorage.getItem('userRole') || null;
    } catch (error) {
      console.error('Error getting user role:', error);
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
  isAdmin: () => {
    return authAPI.hasRole('GESTOR');
  },

  // ================================
  // MANEJO DE DATOS LOCALES
  // ================================

  // Guardar datos de autenticación
  saveAuthData: (authData) => {
    try {
      if (authData.token) {
        // Usar tokenManager para guardar el token
        tokenManager.setToken(authData.token);
        localStorage.setItem('isAuthenticated', 'true');

        if (authData.user) {
          localStorage.setItem('userData', JSON.stringify(authData.user));
          localStorage.setItem('userName', authData.user.name || '');
          localStorage.setItem('userRole', authData.user.rol || '');
          localStorage.setItem('userEmail', authData.user.email || '');
          localStorage.setItem('userId', authData.user.id || '');
        }

        // Iniciar gestión automática de tokens
        tokenManager.startTokenManagement();
      }
    } catch (error) {
      console.error('Error guardando datos de auth:', error);
    }
  },

  // Limpiar datos de autenticación
  clearAuthData: () => {
    try {
      // Usar tokenManager para limpiar tokens
      tokenManager.clearTokens();
      tokenManager.stopTokenManagement();

      // Limpiar datos adicionales
      localStorage.setItem('rememberMe', 'false');

      return true;
    } catch (error) {
      console.error('Error en clearAuthData:', error);
      // Limpiar de todas formas
      localStorage.clear();
      return false;
    }
  },

  // Obtener token de autorización
  getAuthToken: () => {
    return tokenManager.getToken();
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
        // Fallback a health check general
        response = await fetch("http://localhost:5000/api/health", {
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
      errorHandler.logError(error, 'authAPI.checkServerHealth');
      const processedError = errorHandler.processError(error);

      return {
        status: 'ERROR',
        message: 'No se puede conectar con el servidor de autenticación',
        error: processedError.message,
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
  refreshToken,
  checkTokenStatus,
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
  isAdmin,
  saveAuthData,
  clearAuthData,
  getAuthToken,
  checkServerHealth
} = authAPI;