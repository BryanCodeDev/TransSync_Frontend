// services/apiService.js - Servicio actualizado para tu backend TransSync
import axios from "axios";

// ================================
// CONFIGURACIÓN BASE
// ================================
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const REQUEST_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ================================
// INTERCEPTORES
// ================================

// Request interceptor - agregar token y logging
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejo de errores globales y logging
apiClient.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Logging de errores
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Manejo específico de errores
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      
      // Redirigir solo si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ===============================
// UTILIDADES GENERALES
// ===============================
export const apiUtils = {
  // Verificar si hay conexión a internet
  isOnline: () => navigator.onLine,

  // Formatear errores para mostrar al usuario
  formatError: (error) => {
    if (!navigator.onLine) {
      return 'Sin conexión a internet. Verifica tu conexión.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Intenta de nuevo.';
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status === 404) {
      return 'Recurso no encontrado.';
    }

    if (error.response?.status >= 500) {
      return 'Error del servidor. Intenta más tarde.';
    }

    return error.message || 'Error desconocido';
  }
};

// ================================
// SERVICIOS DE AUTENTICACIÓN
// ================================
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const { email, password } = userData;
      
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      const response = await apiClient.post('/auth/register', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      const response = await apiClient.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userId', response.data.user.id);
      }

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar cuenta
  verifyAccount: async (token) => {
    try {
      if (!token) {
        throw new Error('Token de verificación requerido');
      }

      const response = await apiClient.get(`/auth/verify?token=${token}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Olvido de contraseña
  forgotPassword: async (email) => {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      if (!token || !newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      const response = await apiClient.post(`/auth/reset-password?token=${token}`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Logout
  logout: async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      
      // Redirigir a login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar de todas formas
      localStorage.clear();
      window.location.href = '/login';
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
    const isAuth = localStorage.getItem('isAuthenticated');
    return !!(token && isAuth === 'true');
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
          role: userRole
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parseando userData:', error);
      return null;
    }
  },

  // Obtener role del usuario
  getUserRole: () => {
    return localStorage.getItem('userRole') || null;
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (role) => {
    const userRole = authService.getUserRole();
    return userRole === role;
  },

  // Verificar si es superadmin
  isSuperAdmin: () => {
    return authService.hasRole('SUPERADMIN');
  },

  // Verificar si es administrador
  isAdmin: () => {
    return authService.hasRole('ADMINISTRADOR');
  }
};

// ================================
// SERVICIOS DE ADMINISTRACIÓN
// ================================
export const adminService = {
  // Acceso solo para SUPERADMIN
  getSuperAdminPanel: async () => {
    try {
      const response = await apiClient.get('/admin/solo-superadmin');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Listar administradores
  listarAdministradores: async () => {
    try {
      const response = await apiClient.get('/admin/listar-administradores');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Asignar rol
  asignarRol: async (userData) => {
    try {
      const {
        idUsuario,
        nuevoRol,
        nomAdministrador,
        apeAdministrador,
        numDocAdministrador,
        idEmpresa
      } = userData;

      if (!idUsuario || !nuevoRol) {
        throw new Error('ID de usuario y nuevo rol son requeridos');
      }

      const response = await apiClient.put('/admin/asignar-rol', {
        idUsuario,
        nuevoRol,
        nomAdministrador,
        apeAdministrador,
        numDocAdministrador,
        idEmpresa
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Editar administrador
  editarAdministrador: async (idUsuario, adminData) => {
    try {
      if (!idUsuario) {
        throw new Error('ID de usuario requerido');
      }

      const { nomAdministrador, apeAdministrador, numDocAdministrador } = adminData;

      if (!nomAdministrador || !apeAdministrador || !numDocAdministrador) {
        throw new Error('Todos los campos son requeridos');
      }

      const response = await apiClient.put(`/admin/editar-administrador/${idUsuario}`, {
        nomAdministrador,
        apeAdministrador,
        numDocAdministrador
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar administrador
  eliminarAdministrador: async (idUsuario) => {
    try {
      if (!idUsuario) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/admin/eliminar-administrador/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// VERIFICACIÓN DE SALUD DEL API
// ================================
export const healthCheck = async () => {
  try {
    const startTime = Date.now();
    const response = await apiClient.get('/health', { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      ...response.data,
      connectivity: true,
      responseTime
    };
  } catch (error) {
    return {
      status: 'ERROR',
      connectivity: false,
      message: apiUtils.formatError(error),
      timestamp: new Date().toISOString()
    };
  }
};

// ================================
// EXPORT DEFAULT
// ================================
export default {
  client: apiClient,
  auth: authService,
  admin: adminService,
  utils: apiUtils,
  healthCheck
};