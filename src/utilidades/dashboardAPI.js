// src/utilidades/dashboardAPI.js - Servicio completo para dashboard con rutas corregidas

import { apiClient, apiUtils } from '../api/baseAPI';

export const dashboardAPI = {
  // Obtener estadísticas generales del dashboard
  getGeneralStatistics: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      return { estadisticas: { totalRutas: 0, totalVehiculos: 0, rutasActivas: 0 } };
    }
  },

  // Obtener datos para gráficos
  getChartsData: async (period = 'semana') => {
    try {
      const validPeriods = ['dia', 'semana', 'mes', 'trimestre', 'ano'];
      if (!validPeriods.includes(period)) {
        throw new Error('Período inválido');
      }

      const response = await apiClient.get(`/api/dashboard/graficos?periodo=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos de gráficos:', error);
      return { graficos: [] };
    }
  },

  // Obtener alertas activas
  getActiveAlerts: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/alertas');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas activas:', error);
      return { alertas: [] };
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/dashboard/actividad?limite=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return { actividades: [] };
    }
  },

  // Obtener indicadores clave (KPIs)
  getKPIs: async (dateRange = {}) => {
    try {
      const params = apiUtils.createUrlParams(dateRange);
      const response = await apiClient.get(`/api/dashboard/kpis${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo KPIs:', error);
      return { kpis: [] };
    }
  },

  // Obtener resumen ejecutivo
  getExecutiveSummary: async (period = 'mes') => {
    try {
      const response = await apiClient.get(`/api/dashboard/resumen-ejecutivo?periodo=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen ejecutivo:', error);
      return { resumen: {} };
    }
  },

  // Obtener datos en tiempo real
  getRealTimeData: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/tiempo-real');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos en tiempo real:', error);
      // Retornar datos vacíos si el endpoint no está disponible
      return {
        viajesEnCurso: 0,
        alertasCriticas: 0,
        timestamp: new Date().toISOString(),
        message: 'Datos en tiempo real no disponibles'
      };
    }
  },

  // Probar conectividad del dashboard
  testConnection: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/test');
      return response.data;
    } catch (error) {
      console.error('Error en test de conexión dashboard:', error);
      return { connected: false, message: 'Conexión no disponible' };
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
      console.error('Error obteniendo todos los datos del dashboard:', error);
      throw new Error('Error al cargar los datos del dashboard');
    }
  }
};

export default dashboardAPI;