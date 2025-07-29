// services/apiService.js - Servicio unificado y completo para tu API
import axios from "axios";

// ================================
// CONFIGURACIÓN BASE
// ================================
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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
// INTERCEPTORES MEJORADOS
// ================================

// Request interceptor - agregar token y logging
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('userData');
      
      // Notificar a la aplicación sobre el logout
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Redirigir solo si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Sin permisos
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    } else if (error.response?.status >= 500) {
      // Error del servidor
      window.dispatchEvent(new CustomEvent('api:server-error', {
        detail: { message: error.response?.data?.message || 'Error del servidor' }
      }));
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

  // Reintentar solicitud
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Solo reintentar en errores de red o 5xx
        if (error.code === 'NETWORK_ERROR' || 
            (error.response?.status >= 500 && error.response?.status < 600)) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw error;
      }
    }
  },

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
      const { name, email, password } = userData;
      
      if (!name || !email || !password) {
        throw new Error('Todos los campos son requeridos');
      }

      const response = await apiClient.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });

      // Si viene token en el registro, guardarlo
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        window.dispatchEvent(new CustomEvent('auth:login', { detail: response.data.user }));
      }

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
        window.dispatchEvent(new CustomEvent('auth:login', { detail: response.data.user }));
      }

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Logout
  logout: async () => {
    try {
      // Intentar logout en el servidor si hay endpoint
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignorar errores del servidor en logout
        console.warn('Error en logout del servidor:', error.message);
      }
    } finally {
      // Limpiar siempre el localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Redirigir a login
      window.location.href = '/login';
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  },

  // Obtener datos del usuario actual
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parseando userData:', error);
      return null;
    }
  },

  // Refrescar token (si tu backend lo soporta)
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        return response.data;
      }
      throw new Error('No se recibió nuevo token');
    } catch (error) {
      // Si falla el refresh, hacer logout
      authService.logout();
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Restablecer contraseña
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE USUARIOS
// ================================
export const userService = {
  // Obtener todos los usuarios (con paginación)
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters
      };

      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    try {
      if (!userId) throw new Error('ID de usuario requerido');
      
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      
      // Actualizar userData en localStorage
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        window.dispatchEvent(new CustomEvent('user:profile-updated', { detail: response.data.user }));
      }

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Subir avatar
  uploadAvatar: async (file) => {
    try {
      if (!file) throw new Error('Archivo requerido');
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// ================================
// SERVICIOS DE MAPAS (MEJORADOS)
// ================================
export const mapService = {
  // Buscar lugares
  searchPlaces: async (query, options = {}) => {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
      }

      const { limit = 5, countrycodes = 'co', timeout = 8000 } = options;
      const params = new URLSearchParams({
        limit: Math.min(limit, 20).toString(),
        countrycodes
      });

      const response = await apiClient.get(
        `/maps/search/${encodeURIComponent(query.trim())}?${params}`,
        { timeout }
      );

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Geocoding inverso
  reverseGeocode: async (lat, lon, zoom = 18) => {
    try {
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        throw new Error('Coordenadas válidas requeridas');
      }

      const response = await apiClient.get(`/maps/reverse/${lat}/${lon}?zoom=${zoom}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Lugares cercanos
  findNearbyPlaces: async (lat, lon, type, radius = 1000) => {
    try {
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        throw new Error('Coordenadas válidas requeridas');
      }

      if (!type) {
        throw new Error('Tipo de lugar requerido');
      }

      const validRadius = Math.min(Math.max(radius, 100), 10000);
      const response = await apiClient.get(
        `/maps/nearby/${lat}/${lon}/${type}?radius=${validRadius}`
      );

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Calcular ruta
  calculateRoute: async (startLat, startLon, endLat, endLon, profile = 'driving') => {
    try {
      const coords = [
        { name: 'startLat', value: startLat },
        { name: 'startLon', value: startLon },
        { name: 'endLat', value: endLat },
        { name: 'endLon', value: endLon }
      ];

      // Validar coordenadas
      for (const coord of coords) {
        if (!coord.value || isNaN(coord.value)) {
          throw new Error(`${coord.name} debe ser un número válido`);
        }
      }

      const validProfiles = ['driving', 'walking', 'cycling'];
      if (!validProfiles.includes(profile)) {
        throw new Error(`Perfil inválido. Debe ser: ${validProfiles.join(', ')}`);
      }

      const response = await apiClient.get(
        `/maps/route/${startLat}/${startLon}/${endLat}/${endLon}?profile=${profile}`,
        { timeout: 15000 }
      );

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Detalles de lugar
  getPlaceDetails: async (placeId) => {
    try {
      if (!placeId) throw new Error('ID de lugar requerido');
      
      const response = await apiClient.get(`/maps/place/${placeId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener tipos de lugares disponibles
  getPlaceTypes: async () => {
    try {
      const response = await apiClient.get('/maps/place-types');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Status del servicio de mapas
  getMapStatus: async () => {
    try {
      const response = await apiClient.get('/maps/status');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES DE MAPAS (MEJORADAS)
  // ================================

  // Formatear distancia
  formatDistance: (meters) => {
    if (typeof meters !== 'number' || meters < 0) return '0 m';
    
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else if (meters < 100000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters / 1000)} km`;
    }
  },

  // Formatear duración
  formatDuration: (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '<1m';
    }
  },

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * (Math.PI / 180);
    
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distancia en metros
  },

  // Obtener ubicación actual con mejores opciones
  getCurrentLocation: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          let message = 'Error desconocido';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado. Habilita la geolocalización.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Ubicación no disponible. Intenta de nuevo.';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado obteniendo ubicación.';
              break;
          }
          reject(new Error(message));
        },
        defaultOptions
      );
    });
  },

  // Validar coordenadas
  validateCoordinates: (lat, lon) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return false;
    }
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  // Obtener bounds para múltiples puntos
  getBounds: (points) => {
    if (!Array.isArray(points) || points.length === 0) {
      return null;
    }

    const validPoints = points.filter(p => 
      p && typeof p.lat === 'number' && typeof p.lon === 'number'
    );

    if (validPoints.length === 0) return null;

    const lats = validPoints.map(p => p.lat);
    const lons = validPoints.map(p => p.lon);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons)
    };
  }
};

// ================================
// SERVICIOS DE TRANSPORTE (NUEVOS)
// ================================
export const transportService = {
  // Obtener todas las rutas
  getRoutes: async () => {
    try {
      const response = await apiClient.get('/transport/routes');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener una ruta específica
  getRouteById: async (routeId) => {
    try {
      if (!routeId) throw new Error('ID de ruta requerido');
      
      const response = await apiClient.get(`/transport/routes/${routeId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener todas las paradas
  getStops: async () => {
    try {
      const response = await apiClient.get('/transport/stops');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Agregar una nueva parada
  addStop: async (stopData) => {
    try {
      const { lat, lng, name } = stopData;
      
      if (!lat || !lng || !name) {
        throw new Error('Se requieren latitud, longitud y nombre');
      }

      const response = await apiClient.post('/transport/stops', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: name.trim()
      });

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
    const response = await apiClient.get('/health', { timeout: 5000 });
    return {
      ...response.data,
      connectivity: true,
      responseTime: Date.now() - response.config.metadata?.startTime || 0
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
  users: userService,
  maps: mapService,
  transport: transportService, // Nuevo servicio añadido
  utils: apiUtils,
  healthCheck
};