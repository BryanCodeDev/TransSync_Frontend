// api/horariosAPI.js - Servicio específico para horarios
import { apiClient, apiUtils } from './baseAPI';

export const horariosAPI = {
  // Obtener horarios con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/horarios${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear horario
  create: async (scheduleData) => {
    try {
      const { horaInicio, horaFin, idRuta, idConductor, idVehiculo } = scheduleData;
      
      const missing = apiUtils.validateRequired({ horaInicio, horaFin, idRuta });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar que hora inicio sea menor que hora fin
      if (horaInicio >= horaFin) {
        throw new Error('La hora de inicio debe ser menor que la hora de fin');
      }

      const response = await apiClient.post('/horarios', scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar horario
  update: async (id, scheduleData) => {
    try {
      if (!id) throw new Error('ID de horario requerido');
      
      // Validar horas si se proporcionan
      if (scheduleData.horaInicio && scheduleData.horaFin && 
          scheduleData.horaInicio >= scheduleData.horaFin) {
        throw new Error('La hora de inicio debe ser menor que la hora de fin');
      }

      const response = await apiClient.put(`/horarios/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar horario
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de horario requerido');
      const response = await apiClient.delete(`/horarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener horarios por ruta
  getByRoute: async (idRuta) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/horarios?idRuta=${idRuta}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar conflictos de horario
  checkConflicts: async (scheduleData) => {
    try {
      const response = await apiClient.post('/horarios/verificar-conflictos', scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};