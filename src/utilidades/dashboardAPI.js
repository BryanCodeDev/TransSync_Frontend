import { apiClient, apiUtils } from '../api/baseAPI';

export const dashboardAPI = {
  // ================================
  // ESTADÍSTICAS GENERALES
  // ================================

  // Obtener estadísticas generales del dashboard
  getGeneralStatistics: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en estadísticas generales
      const response = await apiClient.get(`/api/dashboard/estadisticas?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener resumen operacional desde la tabla ResumenOperacional
  getOperationalSummary: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en resumen operacional
      const response = await apiClient.get(`/api/dashboard/resumen-operacional?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener datos para gráficos
  getChartsData: async (period = 'semana') => {
    try {
      const validPeriods = ['dia', 'semana', 'mes', 'trimestre', 'ano'];
      if (!validPeriods.includes(period)) {
        throw new Error('Período inválido');
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en datos de gráficos
      const response = await apiClient.get(`/api/dashboard/graficos?periodo=${period}&idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas activas
  getActiveAlerts: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en alertas activas
      const response = await apiClient.get(`/api/dashboard/alertas?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas de vencimientos desde la tabla AlertasVencimientos
  getExpirationAlerts: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en alertas de vencimientos
      const response = await apiClient.get(`/api/dashboard/alertas-vencimientos?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas próximas a vencer (próximos 30 días)
  getUpcomingAlerts: async (dias = 30) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en alertas próximas
      const response = await apiClient.get(`/api/dashboard/alertas-proximas?idEmpresa=${empresaId}&dias=${dias}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas vencidas
  getOverdueAlerts: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en alertas vencidas
      const response = await apiClient.get(`/api/dashboard/alertas-vencidas?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit = 10) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en actividad reciente
      const response = await apiClient.get(`/api/dashboard/actividad?limite=${limit}&idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener indicadores clave (KPIs)
  getKPIs: async (dateRange = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en KPIs
      const filtrosConEmpresa = { ...dateRange, idEmpresa: empresaId };
      const params = apiUtils.createUrlParams(filtrosConEmpresa);
      const response = await apiClient.get(`/api/dashboard/kpis${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener resumen ejecutivo
  getExecutiveSummary: async (period = 'mes') => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en resumen ejecutivo
      const response = await apiClient.get(`/api/dashboard/resumen-ejecutivo?periodo=${period}&idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener datos en tiempo real
  getRealTimeData: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en datos en tiempo real
      const response = await apiClient.get(`/api/dashboard/tiempo-real?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Probar conectividad del dashboard
  testConnection: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/test');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Método para obtener todos los datos del dashboard de una vez
  getAllDashboardData: async (period = 'semana') => {
    try {
      const [
        statsResponse,
        chartsResponse,
        alertsResponse,
        realTimeResponse
      ] = await Promise.allSettled([
        dashboardAPI.getGeneralStatistics(),
        dashboardAPI.getChartsData(period),
        dashboardAPI.getActiveAlerts(),
        dashboardAPI.getRealTimeData()
      ]);

      return {
        statistics: statsResponse.status === 'fulfilled' ? statsResponse.value : null,
        charts: chartsResponse.status === 'fulfilled' ? chartsResponse.value : null,
        alerts: alertsResponse.status === 'fulfilled' ? alertsResponse.value : null,
        realTime: realTimeResponse.status === 'fulfilled' ? realTimeResponse.value : null,
        errors: [
          ...(statsResponse.status === 'rejected' ? ['statistics'] : []),
          ...(chartsResponse.status === 'rejected' ? ['charts'] : []),
          ...(alertsResponse.status === 'rejected' ? ['alerts'] : []),
          ...(realTimeResponse.status === 'rejected' ? ['realTime'] : [])
        ]
      };
    } catch (error) {
      throw new Error('Error al cargar los datos del dashboard');
    }
  },

  // ========================================
  // NUEVOS ENDPOINTS PARA DASHBOARD MEJORADO
  // ========================================

  // Control de actualizaciones automáticas
  startUpdates: async () => {
    try {
      const response = await apiClient.post('/api/dashboard/start-updates');
      return response.data;
    } catch (error) {
      throw new Error('Error al iniciar actualizaciones automáticas');
    }
  },

  stopUpdates: async () => {
    try {
      const response = await apiClient.post('/api/dashboard/stop-updates');
      return response.data;
    } catch (error) {
      throw new Error('Error al detener actualizaciones automáticas');
    }
  },

  getUpdateStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/update-stats');
      return response.data;
    } catch (error) {
      throw new Error('Error obteniendo estadísticas de actualizaciones');
    }
  },

  // Gestión de cache
  clearCache: async (cacheType = null) => {
    try {
      const response = await apiClient.post('/api/dashboard/cache/clear', { cacheType });
      return response.data;
    } catch (error) {
      throw new Error('Error al limpiar cache');
    }
  },

  preloadCache: async () => {
    try {
      const response = await apiClient.post('/api/dashboard/cache/preload');
      return response.data;
    } catch (error) {
      
      throw new Error('Error al precargar cache');
    }
  },

  getCacheStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/cache/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas del cache:', error);
      return { status: 'error', message: 'No se pudieron obtener las estadísticas del cache' };
    }
  },

  // Gestión de eventos
  getEventStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/events/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de eventos:', error);
      return { status: 'error', message: 'No se pudieron obtener las estadísticas de eventos' };
    }
  },

  getEventHistory: async (limit = 20, eventType = null) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (eventType) params.append('eventType', eventType);

      const response = await apiClient.get(`/api/dashboard/events/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial de eventos:', error);
      return { events: [], status: 'error', message: 'No se pudo obtener el historial de eventos' };
    }
  },

  emitEvent: async (eventType, eventData) => {
    try {
      const response = await apiClient.post('/api/dashboard/events/emit', {
        eventType,
        eventData
      });
      return response.data;
    } catch (error) {
      console.error('Error emitiendo evento:', error);
      throw new Error('Error al emitir evento');
    }
  },

  // Actualizaciones forzadas
  forceUpdate: async (dataType) => {
    try {
      const response = await apiClient.post('/api/dashboard/force-update', { dataType });
      return response.data;
    } catch (error) {
      console.error('Error forzando actualización:', error);
      throw new Error('Error al forzar actualización');
    }
  },

  // Configuración de auto-actualización
  getAutoUpdateConfig: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/auto-update/config');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuración de auto-actualización:', error);
      return { status: 'error', message: 'No se pudo obtener la configuración' };
    }
  },

  // Métricas de rendimiento
  getPerformanceMetrics: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/performance');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error);
      return { status: 'error', message: 'No se pudieron obtener las métricas de rendimiento' };
    }
  },

  // Gestión de notificaciones
  getNotificationStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      return { status: 'error', message: 'No se pudieron obtener las estadísticas de notificaciones' };
    }
  },

  getNotificationHistory: async (limit = 20) => {
    try {
      const response = await apiClient.get(`/api/dashboard/notifications/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial de notificaciones:', error);
      return { notifications: [], status: 'error', message: 'No se pudo obtener el historial de notificaciones' };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/api/dashboard/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw new Error('Error al marcar notificación como leída');
    }
  },

  acknowledgeNotification: async (notificationId) => {
    try {
      const response = await apiClient.put(`/api/dashboard/notifications/${notificationId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Error reconociendo notificación:', error);
      throw new Error('Error al reconocer notificación');
    }
  },

  // Método para obtener todos los datos del dashboard mejorado
  getAllDashboardDataEnhanced: async (period = 'semana') => {
    try {
      const [
        statsResponse,
        chartsResponse,
        alertsResponse,
        realTimeResponse,
        updateStatsResponse,
        cacheStatsResponse,
        performanceResponse
      ] = await Promise.allSettled([
        dashboardAPI.getGeneralStatistics(),
        dashboardAPI.getChartsData(period),
        dashboardAPI.getActiveAlerts(),
        dashboardAPI.getRealTimeData(),
        dashboardAPI.getUpdateStats(),
        dashboardAPI.getCacheStats(),
        dashboardAPI.getPerformanceMetrics()
      ]);

      return {
        statistics: statsResponse.status === 'fulfilled' ? statsResponse.value : null,
        charts: chartsResponse.status === 'fulfilled' ? chartsResponse.value : null,
        alerts: alertsResponse.status === 'fulfilled' ? alertsResponse.value : null,
        realTime: realTimeResponse.status === 'fulfilled' ? realTimeResponse.value : null,
        updateStats: updateStatsResponse.status === 'fulfilled' ? updateStatsResponse.value : null,
        cacheStats: cacheStatsResponse.status === 'fulfilled' ? cacheStatsResponse.value : null,
        performance: performanceResponse.status === 'fulfilled' ? performanceResponse.value : null,
        errors: [
          ...(statsResponse.status === 'rejected' ? ['statistics'] : []),
          ...(chartsResponse.status === 'rejected' ? ['charts'] : []),
          ...(alertsResponse.status === 'rejected' ? ['alerts'] : []),
          ...(realTimeResponse.status === 'rejected' ? ['realTime'] : []),
          ...(updateStatsResponse.status === 'rejected' ? ['updateStats'] : []),
          ...(cacheStatsResponse.status === 'rejected' ? ['cacheStats'] : []),
          ...(performanceResponse.status === 'rejected' ? ['performance'] : [])
        ]
      };
    } catch (error) {
      console.error('Error obteniendo todos los datos del dashboard mejorado:', error);
      throw new Error('Error al cargar los datos del dashboard mejorado');
    }
  }
};

export default dashboardAPI;