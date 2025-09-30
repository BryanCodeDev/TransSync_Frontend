import { apiClient, apiUtils } from '../api/baseAPI';

export const informesAPI = {
  // Obtener informes generales
  getAll: async (filters = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId automáticamente en filtros
      const filtrosConEmpresa = {
        ...filters,
        idEmpresa: empresaId  // ✅ Filtro de seguridad por empresa
      };

      const params = apiUtils.createUrlParams(filtrosConEmpresa);
      const response = await apiClient.get(`/informes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de rutas
  generateRoutesReport: async (dateRange = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en reporte de rutas
      const filtrosConEmpresa = {
        ...dateRange,
        idEmpresa: empresaId
      };

      const response = await apiClient.post('/informes/rutas', filtrosConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de vehículos
  generateVehiclesReport: async (dateRange = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en reporte de vehículos
      const filtrosConEmpresa = {
        ...dateRange,
        idEmpresa: empresaId
      };

      const response = await apiClient.post('/informes/vehiculos', filtrosConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de conductores
  generateDriversReport: async (dateRange = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en reporte de conductores
      const filtrosConEmpresa = {
        ...dateRange,
        idEmpresa: empresaId
      };

      const response = await apiClient.post('/informes/conductores', filtrosConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de productividad
  generateProductivityReport: async (filters = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en reporte de productividad
      const filtrosConEmpresa = {
        ...filters,
        idEmpresa: empresaId
      };

      const response = await apiClient.post('/informes/productividad', filtrosConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte financiero
  generateFinancialReport: async (dateRange = {}) => {
    try {
      const { fechaInicio, fechaFin } = dateRange;

      if (!fechaInicio || !fechaFin) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en reporte financiero
      const filtrosConEmpresa = {
        ...dateRange,
        idEmpresa: empresaId
      };

      const response = await apiClient.post('/informes/financiero', filtrosConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Exportar reporte
  exportReport: async (tipo, formato = 'pdf', filters = {}) => {
    try {
      const validTypes = ['rutas', 'vehiculos', 'conductores', 'productividad', 'financiero'];
      if (!validTypes.includes(tipo)) {
        throw new Error('Tipo de reporte inválido');
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en filtros de exportación
      const filtrosConEmpresa = {
        ...filters,
        idEmpresa: empresaId,
        formato
      };

      const params = apiUtils.createUrlParams(filtrosConEmpresa);
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
  },

  // Programar reporte automático
  scheduleReport: async (reportConfig) => {
    try {
      const { tipo, frecuencia, destinatarios, configuracion } = reportConfig;

      const missing = apiUtils.validateRequired({ tipo, frecuencia, destinatarios });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en configuración de reporte programado
      const configConEmpresa = {
        ...reportConfig,
        configuracion: {
          ...configuracion,
          idEmpresa: empresaId
        }
      };

      const response = await apiClient.post('/informes/programar', configConEmpresa);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};