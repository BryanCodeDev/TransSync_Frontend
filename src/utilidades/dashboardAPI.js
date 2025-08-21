// api/dashboardAPI.js - Servicio específico para dashboard
export const dashboardAPI = {
  // Obtener estadísticas generales del dashboard
  getGeneralStatistics: async () => {
    try {
      const response = await apiClient.get('/dashboard/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener datos para gráficos
  getChartsData: async (period = 'mes') => {
    try {
      const validPeriods = ['dia', 'semana', 'mes', 'trimestre', 'ano'];
      if (!validPeriods.includes(period)) {
        throw new Error('Período inválido');
      }

      const response = await apiClient.get(`/dashboard/graficos?periodo=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener alertas activas
  getActiveAlerts: async () => {
    try {
      const response = await apiClient.get('/dashboard/alertas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/dashboard/actividad?limite=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener indicadores clave (KPIs)
  getKPIs: async (dateRange = {}) => {
    try {
      const params = apiUtils.createUrlParams(dateRange);
      const response = await apiClient.get(`/dashboard/kpis${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener resumen ejecutivo
  getExecutiveSummary: async (period = 'mes') => {
    try {
      const response = await apiClient.get(`/dashboard/resumen-ejecutivo?periodo=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener datos en tiempo real
  getRealTimeData: async () => {
    try {
      const response = await apiClient.get('/dashboard/tiempo-real');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Marcar alerta como vista
  markAlertAsRead: async (alertId) => {
    try {
      if (!alertId) throw new Error('ID de alerta requerido');
      const response = await apiClient.patch(`/dashboard/alertas/${alertId}/marcar-leida`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Configurar preferencias del dashboard
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/dashboard/preferencias', preferences);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

export default { horariosAPI, informesAPI, emergencyAPI, dashboardAPI };