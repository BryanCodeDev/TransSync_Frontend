// services/apiService.js - Servicio completo actualizado para tu backend TransSync
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
      const keysToRemove = [
        'authToken', 'userToken', 'userData', 'isAuthenticated',
        'userName', 'userRole', 'userEmail', 'userId'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
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
  },

  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar campos requeridos
  validateRequired: (fields) => {
    const missing = [];
    Object.entries(fields).forEach(([key, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missing.push(key);
      }
    });
    return missing;
  },

  // Crear parámetros de URL
  createUrlParams: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return params.toString();
  }
};

// ================================
// SERVICIOS DE AUTENTICACIÓN
// ================================
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const { email, password, name } = userData;
      
      // Validaciones
      const missing = apiUtils.validateRequired({ email, password });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const response = await apiClient.post('/auth/register', { 
        email: email.trim().toLowerCase(), 
        password,
        name: name?.trim()
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
      
      // Validaciones
      const missing = apiUtils.validateRequired({ email, password });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
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

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
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

      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
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
      // Intentar logout en el servidor (opcional)
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.warn('Error en logout del servidor:', error);
      }

      // Limpiar localStorage
      const keysToRemove = [
        'authToken', 'userToken', 'userData', 'isAuthenticated',
        'userName', 'userRole', 'userEmail', 'userId'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
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
  },

  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    try {
      const { name, email } = profileData;
      
      if (email && !apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await apiClient.put('/auth/profile', {
        name: name?.trim(),
        email: email?.trim().toLowerCase()
      });

      // Actualizar datos en localStorage
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);
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

      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
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
  listarAdministradores: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/listar-administradores${params ? `?${params}` : ''}`);
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

      // Validaciones
      const missing = apiUtils.validateRequired({ idUsuario, nuevoRol });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const validRoles = ['ADMINISTRADOR', 'SUPERADMIN', 'USER', 'PENDIENTE'];
      if (!validRoles.includes(nuevoRol)) {
        throw new Error('Rol inválido');
      }

      const response = await apiClient.put('/admin/asignar-rol', {
        idUsuario,
        nuevoRol,
        nomAdministrador: nomAdministrador?.trim(),
        apeAdministrador: apeAdministrador?.trim(),
        numDocAdministrador: numDocAdministrador?.trim(),
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

      // Validaciones
      const missing = apiUtils.validateRequired({ 
        nomAdministrador, 
        apeAdministrador, 
        numDocAdministrador 
      });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.put(`/admin/editar-administrador/${idUsuario}`, {
        nomAdministrador: nomAdministrador.trim(),
        apeAdministrador: apeAdministrador.trim(),
        numDocAdministrador: numDocAdministrador.trim()
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
  },

  // Cambiar estado de administrador
  cambiarEstadoAdministrador: async (idUsuario, estado) => {
    try {
      if (!idUsuario || typeof estado !== 'boolean') {
        throw new Error('ID de usuario y estado son requeridos');
      }

      const response = await apiClient.patch(`/admin/cambiar-estado/${idUsuario}`, {
        estActivo: estado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas del sistema
  getEstadisticas: async () => {
    try {
      const response = await apiClient.get('/admin/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE DATOS GENERALES
// ================================
export const dataService = {
  // ================================
  // SERVICIOS DE RUTAS
  // ================================
  getRutas: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/rutas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  crearRuta: async (rutaData) => {
    try {
      const response = await apiClient.post('/rutas', rutaData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  actualizarRuta: async (id, rutaData) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.put(`/rutas/${id}`, rutaData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  eliminarRuta: async (id) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.delete(`/rutas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // SERVICIOS DE VEHÍCULOS
  // ================================
  getVehiculos: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/vehiculos${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  crearVehiculo: async (vehiculoData) => {
    try {
      const response = await apiClient.post('/vehiculos', vehiculoData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  actualizarVehiculo: async (id, vehiculoData) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.put(`/vehiculos/${id}`, vehiculoData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  eliminarVehiculo: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.delete(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // SERVICIOS DE CONDUCTORES (ACTUALIZADOS Y MEJORADOS)
  // ================================
  
  // Obtener conductores con información completa
  getDrivers: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/conductores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductor por ID con detalles completos
  getDriverById: async (id) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');
      const response = await apiClient.get(`/conductores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear conductor con validaciones mejoradas
  crearDriver: async (driverData) => {
    try {
      // Validaciones específicas para conductores
      const { 
        nomConductor, 
        apeConductor, 
        numDocConductor, 
        tipLicConductor, 
        fecVenLicConductor,
        idEmpresa 
      } = driverData;

      const missing = apiUtils.validateRequired({ 
        nomConductor, 
        apeConductor, 
        numDocConductor, 
        tipLicConductor, 
        fecVenLicConductor 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar tipo de licencia
      const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
      if (!validLicenses.includes(tipLicConductor)) {
        throw new Error('Tipo de licencia inválido');
      }

      // Validar fecha de vencimiento
      const fechaVencimiento = new Date(fecVenLicConductor);
      const hoy = new Date();
      if (fechaVencimiento <= hoy) {
        throw new Error('La fecha de vencimiento de la licencia debe ser futura');
      }

      const response = await apiClient.post('/conductores', {
        ...driverData,
        nomConductor: nomConductor.trim(),
        apeConductor: apeConductor.trim(),
        numDocConductor: numDocConductor.trim(),
        idEmpresa: idEmpresa || 1 // Empresa por defecto si no se especifica
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar conductor con validaciones
  actualizarDriver: async (id, driverData) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');

      // Validar datos si se proporcionan
      if (driverData.tipLicConductor) {
        const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
        if (!validLicenses.includes(driverData.tipLicConductor)) {
          throw new Error('Tipo de licencia inválido');
        }
      }

      if (driverData.fecVenLicConductor) {
        const fechaVencimiento = new Date(driverData.fecVenLicConductor);
        const hoy = new Date();
        if (fechaVencimiento <= hoy) {
          throw new Error('La fecha de vencimiento de la licencia debe ser futura');
        }
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...driverData };
      if (cleanedData.nomConductor) cleanedData.nomConductor = cleanedData.nomConductor.trim();
      if (cleanedData.apeConductor) cleanedData.apeConductor = cleanedData.apeConductor.trim();
      if (cleanedData.numDocConductor) cleanedData.numDocConductor = cleanedData.numDocConductor.trim();
      if (cleanedData.telConductor) cleanedData.telConductor = cleanedData.telConductor.trim();

      const response = await apiClient.put(`/conductores/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar conductor
  eliminarDriver: async (id) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');
      const response = await apiClient.delete(`/conductores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Cambiar estado de conductor
  cambiarEstadoConductor: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de conductor y nuevo estado son requeridos');
      }

      const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido');
      }

      const response = await apiClient.patch(`/conductores/${id}/estado`, {
        estConductor: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Asignar vehículo a conductor
  asignarVehiculoConductor: async (idConductor, idVehiculo) => {
    try {
      if (!idConductor || !idVehiculo) {
        throw new Error('ID de conductor e ID de vehículo son requeridos');
      }

      const response = await apiClient.patch(`/conductores/${idConductor}/asignar-vehiculo`, {
        idVehiculo
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Desasignar vehículo de conductor
  desasignarVehiculoConductor: async (idConductor) => {
    try {
      if (!idConductor) throw new Error('ID de conductor requerido');

      const response = await apiClient.patch(`/conductores/${idConductor}/desasignar-vehiculo`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductores disponibles (para asignación)
  getConductoresDisponibles: async () => {
    try {
      const response = await apiClient.get('/conductores/disponibles');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de conductores
  getEstadisticasConductores: async () => {
    try {
      const response = await apiClient.get('/conductores/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar vencimiento de licencias
  verificarVencimientoLicencias: async (diasAnticipacion = 30) => {
    try {
      const response = await apiClient.get(`/conductores/licencias-vencimiento?dias=${diasAnticipacion}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // SERVICIOS DE HORARIOS
  // ================================
  getHorarios: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/horarios${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  crearHorario: async (horarioData) => {
    try {
      const response = await apiClient.post('/horarios', horarioData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  actualizarHorario: async (id, horarioData) => {
    try {
      if (!id) throw new Error('ID de horario requerido');
      const response = await apiClient.put(`/horarios/${id}`, horarioData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  eliminarHorario: async (id) => {
    try {
      if (!id) throw new Error('ID de horario requerido');
      const response = await apiClient.delete(`/horarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE REPORTES E INFORMES
// ================================
export const reportService = {
  // Obtener informes generales
  getInformes: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/informes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de rutas
  generarReporteRutas: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/rutas', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de vehículos
  generarReporteVehiculos: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/vehiculos', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de conductores
  generarReporteConductores: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/conductores', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Exportar reporte
  exportarReporte: async (tipo, formato = 'pdf', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato });
      const response = await apiClient.get(`/informes/export/${tipo}${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipo}_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE EMERGENCIAS
// ================================
export const emergencyService = {
  // Obtener emergencias
  getEmergencias: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/emergencias${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Reportar emergencia
  reportarEmergencia: async (emergenciaData) => {
    try {
      const response = await apiClient.post('/emergencias', emergenciaData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar estado de emergencia
  actualizarEstadoEmergencia: async (id, estado) => {
    try {
      if (!id) throw new Error('ID de emergencia requerido');
      const response = await apiClient.patch(`/emergencias/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener emergencias activas
  getEmergenciasActivas: async () => {
    try {
      const response = await apiClient.get('/emergencias/activas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE EMPRESAS
// ================================
export const empresaService = {
  // Obtener empresas
  getEmpresas: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/empresas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener empresa por ID
  getEmpresaById: async (id) => {
    try {
      if (!id) throw new Error('ID de empresa requerido');
      const response = await apiClient.get(`/empresas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear empresa
  crearEmpresa: async (empresaData) => {
    try {
      const { nomEmpresa, nitEmpresa, dirEmpresa, telEmpresa } = empresaData;
      
      const missing = apiUtils.validateRequired({ 
        nomEmpresa, 
        nitEmpresa, 
        dirEmpresa, 
        telEmpresa 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post('/empresas', {
        ...empresaData,
        nomEmpresa: nomEmpresa.trim(),
        nitEmpresa: nitEmpresa.trim(),
        dirEmpresa: dirEmpresa.trim(),
        telEmpresa: telEmpresa.trim()
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar empresa
  actualizarEmpresa: async (id, empresaData) => {
    try {
      if (!id) throw new Error('ID de empresa requerido');

      // Limpiar campos de texto si existen
      const cleanedData = { ...empresaData };
      if (cleanedData.nomEmpresa) cleanedData.nomEmpresa = cleanedData.nomEmpresa.trim();
      if (cleanedData.nitEmpresa) cleanedData.nitEmpresa = cleanedData.nitEmpresa.trim();
      if (cleanedData.dirEmpresa) cleanedData.dirEmpresa = cleanedData.dirEmpresa.trim();
      if (cleanedData.telEmpresa) cleanedData.telEmpresa = cleanedData.telEmpresa.trim();

      const response = await apiClient.put(`/empresas/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar empresa
  eliminarEmpresa: async (id) => {
    try {
      if (!id) throw new Error('ID de empresa requerido');
      const response = await apiClient.delete(`/empresas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Cambiar estado de empresa
  cambiarEstadoEmpresa: async (id, estado) => {
    try {
      if (!id || typeof estado !== 'boolean') {
        throw new Error('ID de empresa y estado son requeridos');
      }

      const response = await apiClient.patch(`/empresas/${id}/estado`, {
        estActivo: estado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE NOTIFICACIONES
// ================================
export const notificationService = {
  // Obtener notificaciones del usuario
  getNotificaciones: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/notificaciones${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Marcar notificación como leída
  marcarComoLeida: async (id) => {
    try {
      if (!id) throw new Error('ID de notificación requerido');
      const response = await apiClient.patch(`/notificaciones/${id}/leer`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Marcar todas como leídas
  marcarTodasComoLeidas: async () => {
    try {
      const response = await apiClient.patch('/notificaciones/leer-todas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar notificación
  eliminarNotificacion: async (id) => {
    try {
      if (!id) throw new Error('ID de notificación requerido');
      const response = await apiClient.delete(`/notificaciones/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener contador de notificaciones no leídas
  getContadorNoLeidas: async () => {
    try {
      const response = await apiClient.get('/notificaciones/contador');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE MANTENIMIENTO
// ================================
export const maintenanceService = {
  // Obtener mantenimientos
  getMantenimientos: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/mantenimientos${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear mantenimiento
  crearMantenimiento: async (mantenimientoData) => {
    try {
      const { 
        idVehiculo, 
        tipMantenimiento, 
        fecMantenimiento
        // costoMantenimiento - removido ya que no se usa en la validación
      } = mantenimientoData;

      const missing = apiUtils.validateRequired({ 
        idVehiculo, 
        tipMantenimiento, 
        fecMantenimiento 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post('/mantenimientos', mantenimientoData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar mantenimiento
  actualizarMantenimiento: async (id, mantenimientoData) => {
    try {
      if (!id) throw new Error('ID de mantenimiento requerido');
      const response = await apiClient.put(`/mantenimientos/${id}`, mantenimientoData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar mantenimiento
  eliminarMantenimiento: async (id) => {
    try {
      if (!id) throw new Error('ID de mantenimiento requerido');
      const response = await apiClient.delete(`/mantenimientos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener próximos mantenimientos
  getProximosMantenimientos: async (dias = 30) => {
    try {
      const response = await apiClient.get(`/mantenimientos/proximos?dias=${dias}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE DASHBOARD/ESTADÍSTICAS
// ================================
export const dashboardService = {
  // Obtener estadísticas generales del dashboard
  getEstadisticasGenerales: async () => {
    try {
      const response = await apiClient.get('/dashboard/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener datos para gráficos
  getDatosGraficos: async (periodo = 'mes') => {
    try {
      const response = await apiClient.get(`/dashboard/graficos?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas activas
  getAlertasActivas: async () => {
    try {
      const response = await apiClient.get('/dashboard/alertas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener actividad reciente
  getActividadReciente: async (limite = 10) => {
    try {
      const response = await apiClient.get(`/dashboard/actividad?limite=${limite}`);
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
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'ERROR',
      connectivity: false,
      message: apiUtils.formatError(error),
      timestamp: new Date().toISOString(),
      responseTime: null
    };
  }
};

// ================================
// SERVICIO PRINCIPAL EXPORTADO
// ================================
const apiService = {
  client: apiClient,
  auth: authService,
  admin: adminService,
  data: dataService,
  report: reportService,
  emergency: emergencyService,
  empresa: empresaService,
  notification: notificationService,
  maintenance: maintenanceService,
  dashboard: dashboardService,
  utils: apiUtils,
  healthCheck
};

export default apiService;