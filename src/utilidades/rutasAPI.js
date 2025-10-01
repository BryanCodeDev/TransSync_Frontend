// api/rutasAPI.js - Servicio específico para rutas
import { apiClient, apiUtils } from '../api/baseAPI';

const rutasAPI = {
  // ================================
  // GESTIÓN BÁSICA DE RUTAS
  // ================================
  
  // Obtener rutas con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/rutas${params ? `?${params}` : ''}`);
      // Adaptar la respuesta para que tenga la estructura esperada
      const rutas = response.data.map(ruta => ({
        ...ruta,
        estRuta: ruta.estRuta || 'ACTIVA'
      }));
      return { rutas };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener ruta por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/api/rutas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nueva ruta
  create: async (routeData) => {
    try {
      // Validaciones específicas para rutas según la base de datos
      const {
        nomRuta,
        oriRuta,
        desRuta,
        idEmpresa
      } = routeData;

      const missing = apiUtils.validateRequired({
        nomRuta,
        oriRuta,
        desRuta
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar que origen y destino sean diferentes
      if (oriRuta.trim().toLowerCase() === desRuta.trim().toLowerCase()) {
        throw new Error('El origen y destino deben ser diferentes');
      }

      // Validar longitud de campos
      if (nomRuta.trim().length < 3) {
        throw new Error('El nombre de la ruta debe tener al menos 3 caracteres');
      }

      if (oriRuta.trim().length < 2) {
        throw new Error('El origen debe tener al menos 2 caracteres');
      }

      if (desRuta.trim().length < 2) {
        throw new Error('El destino debe tener al menos 2 caracteres');
      }

      const response = await apiClient.post('/api/rutas', {
        nomRuta: nomRuta.trim(),
        oriRuta: oriRuta.trim(),
        desRuta: desRuta.trim(),
        idEmpresa: idEmpresa || 1
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar ruta
  update: async (id, routeData) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');

      // Validar que origen y destino sean diferentes si ambos están presentes
      if (routeData.oriRuta && routeData.desRuta &&
          routeData.oriRuta.trim().toLowerCase() === routeData.desRuta.trim().toLowerCase()) {
        throw new Error('El origen y destino deben ser diferentes');
      }

      // Validar longitud de campos si se proporcionan
      if (routeData.nomRuta && routeData.nomRuta.trim().length < 3) {
        throw new Error('El nombre de la ruta debe tener al menos 3 caracteres');
      }

      if (routeData.oriRuta && routeData.oriRuta.trim().length < 2) {
        throw new Error('El origen debe tener al menos 2 caracteres');
      }

      if (routeData.desRuta && routeData.desRuta.trim().length < 2) {
        throw new Error('El destino debe tener al menos 2 caracteres');
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...routeData };
      if (cleanedData.nomRuta) cleanedData.nomRuta = cleanedData.nomRuta.trim();
      if (cleanedData.oriRuta) cleanedData.oriRuta = cleanedData.oriRuta.trim();
      if (cleanedData.desRuta) cleanedData.desRuta = cleanedData.desRuta.trim();

      const response = await apiClient.put(`/api/rutas/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar ruta
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.delete(`/api/rutas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de ruta
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de ruta y nuevo estado son requeridos');
      }

      const validStates = ['ACTIVA', 'INACTIVA', 'EN_MANTENIMIENTO', 'SUSPENDIDA'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/rutas/${id}/estado`, {
        estRuta: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar ruta
  activate: async (id) => {
    return rutasAPI.changeStatus(id, 'ACTIVA');
  },

  // Desactivar ruta
  deactivate: async (id) => {
    return rutasAPI.changeStatus(id, 'INACTIVA');
  },

  // Marcar como en mantenimiento
  setMaintenance: async (id) => {
    return rutasAPI.changeStatus(id, 'EN_MANTENIMIENTO');
  },

  // Suspender ruta
  suspend: async (id) => {
    return rutasAPI.changeStatus(id, 'SUSPENDIDA');
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener rutas activas (por ahora todas las rutas ya que no hay campo estRuta)
  getActive: async () => {
    try {
      const response = await apiClient.get('/api/rutas');
      // Adaptar la respuesta para que tenga la estructura esperada
      const rutas = response.data.map(ruta => ({
        ...ruta,
        estRuta: ruta.estRuta || 'ACTIVA'
      }));
      return { rutas };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar rutas por origen o destino
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      // Buscar en todas las rutas y filtrar por origen o destino
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.oriRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.desRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.nomRuta.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas por origen
  getByOrigin: async (origen) => {
    try {
      if (!origen) throw new Error('Origen requerido');
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.oriRuta.toLowerCase().includes(origen.toLowerCase())
      );
      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas por destino
  getByDestination: async (destino) => {
    try {
      if (!destino) throw new Error('Destino requerido');
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.desRuta.toLowerCase().includes(destino.toLowerCase())
      );
      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // PARADAS Y PUNTOS DE RUTA
  // ================================
  
  // Obtener paradas de una ruta
  getStops: async (idRuta) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/api/rutas/${idRuta}/paradas`);
      return response.data;
    } catch (error) {
      // Si las paradas no están implementadas, retornar array vacío
      console.warn(`Paradas no disponibles para ruta ${idRuta}:`, error.message);
      return { paradas: [] };
    }
  },

  // Agregar parada a ruta
  addStop: async (idRuta, stopData) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      
      const { nombreParada, latitud, longitud, orden, tiempoEstimado } = stopData;
      
      const missing = apiUtils.validateRequired({ 
        nombreParada, 
        latitud, 
        longitud, 
        orden 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar coordenadas
      if (latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90');
      }

      if (longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180');
      }

      // Validar orden
      if (orden < 1) {
        throw new Error('El orden debe ser mayor a 0');
      }

      const response = await apiClient.post(`/api/rutas/${idRuta}/paradas`, {
        nombreParada: nombreParada.trim(),
        latitud,
        longitud,
        orden,
        tiempoEstimado: tiempoEstimado || 0
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar parada
  updateStop: async (idRuta, idParada, stopData) => {
    try {
      if (!idRuta || !idParada) throw new Error('ID de ruta e ID de parada requeridos');

      // Validar coordenadas si se proporcionan
      if (stopData.latitud && (stopData.latitud < -90 || stopData.latitud > 90)) {
        throw new Error('La latitud debe estar entre -90 y 90');
      }

      if (stopData.longitud && (stopData.longitud < -180 || stopData.longitud > 180)) {
        throw new Error('La longitud debe estar entre -180 y 180');
      }

      if (stopData.orden && stopData.orden < 1) {
        throw new Error('El orden debe ser mayor a 0');
      }

      const cleanedData = { ...stopData };
      if (cleanedData.nombreParada) cleanedData.nombreParada = cleanedData.nombreParada.trim();

      const response = await apiClient.put(`/api/rutas/${idRuta}/paradas/${idParada}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar parada
  deleteStop: async (idRuta, idParada) => {
    try {
      if (!idRuta || !idParada) throw new Error('ID de ruta e ID de parada requeridos');
      const response = await apiClient.delete(`/api/rutas/${idRuta}/paradas/${idParada}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================
  
  // Obtener estadísticas de rutas
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/rutas/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución por estado
  getStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/api/rutas/distribucion-estados');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas más utilizadas
  getMostUsed: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/rutas/mas-utilizadas?limite=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener análisis de rentabilidad
  getProfitabilityAnalysis: async (fechaInicio, fechaFin) => {
    try {
      const params = apiUtils.createUrlParams({ fechaInicio, fechaFin });
      const response = await apiClient.get(`/api/rutas/analisis-rentabilidad${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de ruta
  validateRouteData: (routeData) => {
    const errors = [];

    // Validar nombre
    if (!routeData.nomRuta || routeData.nomRuta.trim().length < 3) {
      errors.push('El nombre de la ruta debe tener al menos 3 caracteres');
    }

    // Validar origen
    if (!routeData.oriRuta || routeData.oriRuta.trim().length < 2) {
      errors.push('El origen debe tener al menos 2 caracteres');
    }

    // Validar destino
    if (!routeData.desRuta || routeData.desRuta.trim().length < 2) {
      errors.push('El destino debe tener al menos 2 caracteres');
    }

    // Validar que origen y destino sean diferentes
    if (routeData.oriRuta && routeData.desRuta &&
        routeData.oriRuta.trim().toLowerCase() === routeData.desRuta.trim().toLowerCase()) {
      errors.push('El origen y destino deben ser diferentes');
    }

    return errors;
  },

  // Formatear datos de ruta para mostrar
  formatRouteData: (route) => {
    return {
      ...route,
      descripcionCompleta: `${route.oriRuta} → ${route.desRuta}`,
      estadoFormateado: rutasAPI.getStatusLabel(route.estRuta),
      rutaDisplay: `${route.nomRuta} (${route.oriRuta} - ${route.desRuta})`
    };
  },

  // Obtener etiqueta del estado
  getStatusLabel: (status) => {
    const statusLabels = {
      'ACTIVA': 'Activa',
      'INACTIVA': 'Inactiva',
      'EN_MANTENIMIENTO': 'En mantenimiento',
      'SUSPENDIDA': 'Suspendida'
    };
    return statusLabels[status] || status || 'Activa';
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'ACTIVA': 'green',
      'INACTIVA': 'red',
      'EN_MANTENIMIENTO': 'blue',
      'SUSPENDIDA': 'orange'
    };
    return statusColors[status] || 'gray';
  },

  // Calcular distancia entre dos coordenadas (fórmula de Haversine)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Exportar lista de rutas
  exportRoutes: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/api/rutas/export${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutas_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Rutas exportadas exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // FUNCIONALIDADES WAZE-STYLE
  // ================================

  // Obtener rutas cercanas a una ubicación
  getNearbyRoutes: async (latitude, longitude, radiusKm = 5) => {
    try {
      if (!latitude || !longitude) {
        throw new Error('Coordenadas requeridas');
      }

      const response = await apiClient.get(`/api/rutas/cerca?lat=${latitude}&lng=${longitude}&radio=${radiusKm}`);
      return response.data;
    } catch (error) {
      // Si no está implementado, buscar rutas cercanas manualmente
      console.warn('API de rutas cercanas no disponible, usando búsqueda manual');
      return rutasAPI.findNearbyRoutesManual(latitude, longitude, radiusKm);
    }
  },

  // Buscar rutas cercanas manualmente (fallback)
  findNearbyRoutesManual: async (latitude, longitude, radiusKm = 5) => {
    try {
      const response = await rutasAPI.getAll();
      const nearbyRoutes = [];

      response.rutas.forEach(route => {
        if (route.coordenadasRuta) {
          try {
            const coordinates = JSON.parse(route.coordenadasRuta);
            let isNearby = false;

            // Verificar si alguna coordenada de la ruta está dentro del radio
            coordinates.forEach(coord => {
              if (coord.length >= 2) {
                const distance = rutasAPI.calculateDistance(
                  latitude, longitude,
                  coord[0], coord[1]
                );
                if (distance <= radiusKm) {
                  isNearby = true;
                }
              }
            });

            if (isNearby) {
              nearbyRoutes.push({
                ...route,
                distanceToRoute: rutasAPI.getMinDistanceToRoute(latitude, longitude, coordinates)
              });
            }
          } catch (error) {
            console.error('Error procesando coordenadas de ruta:', route.idRuta);
          }
        }
      });

      return { rutas: nearbyRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Calcular distancia mínima desde un punto a una ruta
  getMinDistanceToRoute: (lat, lng, routeCoordinates) => {
    if (!routeCoordinates || routeCoordinates.length === 0) return null;

    let minDistance = Infinity;
    routeCoordinates.forEach(coord => {
      if (coord.length >= 2) {
        const distance = rutasAPI.calculateDistance(lat, lng, coord[0], coord[1]);
        minDistance = Math.min(minDistance, distance);
      }
    });

    return minDistance === Infinity ? null : minDistance;
  },

  // Obtener tiempo estimado de llegada a una ruta
  getEstimatedArrival: async (routeId, userLat, userLng) => {
    try {
      if (!routeId || !userLat || !userLng) {
        throw new Error('ID de ruta y coordenadas requeridas');
      }

      const response = await apiClient.get(`/api/rutas/${routeId}/eta?lat=${userLat}&lng=${userLng}`);
      return response.data;
    } catch (error) {
      // Calcular ETA manualmente si no está disponible
      console.warn('API de ETA no disponible, calculando manualmente');
      return rutasAPI.calculateETA(routeId, userLat, userLng);
    }
  },

  // Calcular ETA manualmente
  calculateETA: async (routeId, userLat, userLng) => {
    try {
      const routeResponse = await rutasAPI.getById(routeId);
      const route = routeResponse;

      if (!route.coordenadasRuta) {
        return { eta: null, distance: null };
      }

      const coordinates = JSON.parse(route.coordenadasRuta);
      const minDistance = rutasAPI.getMinDistanceToRoute(userLat, userLng, coordinates);

      if (!minDistance) {
        return { eta: null, distance: null };
      }

      // Asumir velocidad promedio de bus (30 km/h)
      const avgSpeedKmh = 30;
      const timeInHours = minDistance / avgSpeedKmh;
      const etaMinutes = Math.ceil(timeInHours * 60);

      return {
        eta: etaMinutes,
        distance: minDistance,
        arrivalTime: new Date(Date.now() + (etaMinutes * 60 * 1000))
      };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas populares basadas en uso
  getPopularRoutes: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/rutas/populares?limite=${limit}`);
      return response.data;
    } catch (error) {
      // Si no está implementado, retornar rutas ordenadas por nombre
      console.warn('API de rutas populares no disponible');
      const response = await rutasAPI.getAll();
      return {
        rutas: response.rutas
          .sort((a, b) => a.nomRuta.localeCompare(b.nomRuta))
          .slice(0, limit)
      };
    }
  },

  // Registrar uso de ruta (analytics)
  registerRouteUsage: async (routeId, userLocation = null) => {
    try {
      if (!routeId) throw new Error('ID de ruta requerido');

      const usageData = {
        routeId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      if (userLocation) {
        usageData.userLocation = userLocation;
      }

      const response = await apiClient.post('/api/rutas/usage', usageData);
      return response.data;
    } catch (error) {
      // No lanzar error si falla el registro de uso (no crítico)
      console.warn('Error registrando uso de ruta:', error);
      return { success: false };
    }
  },

  // Obtener rutas con tráfico en tiempo real
  getTrafficData: async (routeId) => {
    try {
      if (!routeId) throw new Error('ID de ruta requerido');

      const response = await apiClient.get(`/api/rutas/${routeId}/trafico`);
      return response.data;
    } catch (error) {
      // Retornar datos de tráfico por defecto si no está disponible
      console.warn('API de tráfico no disponible');
      return {
        routeId,
        trafficLevel: 'normal',
        estimatedDelay: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  // Obtener rutas alternativas
  getAlternativeRoutes: async (origin, destination, currentRouteId = null) => {
    try {
      if (!origin || !destination) {
        throw new Error('Origen y destino requeridos');
      }

      const params = apiUtils.createUrlParams({
        origen: origin,
        destino: destination,
        excluir: currentRouteId
      });

      const response = await apiClient.get(`/api/rutas/alternativas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      // Buscar rutas alternativas manualmente
      console.warn('API de rutas alternativas no disponible, buscando manualmente');
      return rutasAPI.findAlternativeRoutesManual(origin, destination, currentRouteId);
    }
  },

  // Buscar rutas alternativas manualmente
  findAlternativeRoutesManual: async (origin, destination, excludeRouteId = null) => {
    try {
      const response = await rutasAPI.getAll();
      const alternatives = response.rutas.filter(route =>
        route.idRuta !== excludeRouteId &&
        (route.oriRuta.toLowerCase().includes(origin.toLowerCase()) ||
         route.desRuta.toLowerCase().includes(destination.toLowerCase()))
      );

      return { rutas: alternatives };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener puntos de interés cercanos a una ruta
  getNearbyPOIs: async (routeId, poiType = null) => {
    try {
      if (!routeId) throw new Error('ID de ruta requerido');

      const params = poiType ? `?tipo=${poiType}` : '';
      const response = await apiClient.get(`/api/rutas/${routeId}/pois${params}`);
      return response.data;
    } catch (error) {
      console.warn('API de POIs no disponible');
      return { pois: [] };
    }
  },

  // Obtener notificaciones de ruta (alertas, cambios, etc.)
  getRouteNotifications: async (routeId) => {
    try {
      if (!routeId) throw new Error('ID de ruta requerido');

      const response = await apiClient.get(`/api/rutas/${routeId}/notificaciones`);
      return response.data;
    } catch (error) {
      console.warn('API de notificaciones no disponible');
      return { notifications: [] };
    }
  }
};

export default rutasAPI;