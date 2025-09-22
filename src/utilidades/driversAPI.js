// src/utilidades/driversAPI.js

import { apiClient, apiUtils } from '../api/baseAPI';

const driversAPI = {
  /**
   * Obtiene la lista de todos los conductores. Acepta un objeto de filtros.
   * getAll({ estConductor: 'ACTIVO' }) -> GET /api/conductores?estConductor=ACTIVO
   */
  getAll: async (filters = {}) => {
    try {
      // Validación frontend
      if (typeof filters !== 'object' || filters === null) {
        throw new Error('Los filtros deben ser un objeto válido');
      }

      // Validar campos específicos
      const validFields = ['estConductor', 'tipLicConductor', 'conVehiculo', 'nomUsuario', 'apeUsuario'];
      for (const key in filters) {
        if (!validFields.includes(key)) {
          console.warn(`Campo de filtro no válido: ${key}`);
        }
      }

      const params = new URLSearchParams(filters).toString();
      const url = `/api/conductores?${params}`;

      // Temporalmente sin cache para debugging
      const response = await apiClient.get(url);

      // Estructura de respuesta consistente
      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al obtener conductores');
      }

      const data = response.data;

      // Asegurar que la respuesta sea un array
      let conductoresArray = [];
      if (Array.isArray(data)) {
        conductoresArray = data;
      } else if (data && typeof data === 'object') {
        if (data.conductores && Array.isArray(data.conductores)) {
          conductoresArray = data.conductores;
        } else if (data.idConductor || data.nomUsuario) {
          conductoresArray = [data];
        } else {
          conductoresArray = [];
        }
      }

      return {
        success: true,
        conductores: conductoresArray,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        conductores: [],
        error: {
          code: error.code || 'GET_CONDUCTORES_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  /**
   * Crea un nuevo conductor.
   * POST /api/conductores
   */
  create: async (driverData) => {
    try {
      const response = await apiClient.post('/api/conductores', driverData);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al crear conductor');
      }

      return {
        success: true,
        conductor: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        conductor: null,
        error: {
          code: error.code || 'CREATE_CONDUCTOR_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  /**
   * Actualiza un conductor existente por su ID.
   * PUT /api/conductores/:idConductor
   */
  update: async (idConductor, driverData) => {
    try {
      if (!idConductor) {
        return {
          success: false,
          conductor: null,
          error: {
            code: 'MISSING_ID',
            message: 'El ID del conductor es requerido para actualizar',
            details: 'Se debe proporcionar un ID válido'
          }
        };
      }

      const response = await apiClient.put(`/api/conductores/${idConductor}`, driverData);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al actualizar conductor');
      }

      return {
        success: true,
        conductor: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        conductor: null,
        error: {
          code: error.code || 'UPDATE_CONDUCTOR_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  /**
   * Elimina un conductor por su ID.
   * DELETE /api/conductores/:idConductor
   */
  delete: async (idConductor) => {
    try {
      if (!idConductor) {
        return {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'El ID del conductor es requerido para eliminar',
            details: 'Se debe proporcionar un ID válido'
          }
        };
      }

      const response = await apiClient.delete(`/api/conductores/${idConductor}`);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al eliminar conductor');
      }

      return {
        success: true,
        message: 'Conductor eliminado exitosamente',
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'DELETE_CONDUCTOR_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },
};

export default driversAPI;