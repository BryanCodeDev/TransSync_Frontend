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

      // Agregar filtro de empresa automáticamente desde el contexto del usuario
      const userContext = JSON.parse(localStorage.getItem('userData') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('No se pudo obtener el ID de empresa del usuario');
      }

      // Crear filtros con empresa incluida
      const filtrosConEmpresa = {
        ...filters,
        idEmpresa: empresaId
      };

      // Validar campos específicos (incluyendo idEmpresa)
      const validFields = ['estConductor', 'tipLicConductor', 'conVehiculo', 'nomUsuario', 'apeUsuario', 'idEmpresa'];
      for (const key in filtrosConEmpresa) {
        if (!validFields.includes(key)) {
          // Campo de filtro no válido - logged in production builds
        }
      }

      const params = new URLSearchParams(filtrosConEmpresa).toString();
      const url = `/api/conductores?${params}`;

      // Temporalmente sin cache para debugging
      const response = await apiClient.get(url);
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

      return conductoresArray;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Crea un nuevo conductor.
   * POST /api/conductores
   */
  create: async (driverData) => {
    try {
      const response = await apiClient.post('/api/conductores', driverData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualiza un conductor existente por su ID.
   * PUT /api/conductores/:idConductor
   */
  update: async (idConductor, driverData) => {
    try {
      if (!idConductor) throw new Error('El ID del conductor es requerido para actualizar.');
      const response = await apiClient.put(`/api/conductores/${idConductor}`, driverData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Elimina un conductor por su ID.
   * DELETE /api/conductores/:idConductor
   */
  delete: async (idConductor) => {
    try {
      if (!idConductor) throw new Error('El ID del conductor es requerido para eliminar.');
      const response = await apiClient.delete(`/api/conductores/${idConductor}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },
};

export default driversAPI;