// utilidades/vehiculosAPI.js - Servicio corregido para vehículos
import { apiClient, apiUtils } from '../api/baseAPI';
import { errorHandler } from './errorHandler';

const vehiculosAPI = {
  // ================================
  // GESTIÓN BÁSICA DE VEHÍCULOS
  // ================================
  
  // Obtener vehículos con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/vehiculos${params ? `?${params}` : ''}`);

      // Log para debugging
      console.log('vehiculosAPI.getAll - Response data type:', typeof response.data);
      console.log('vehiculosAPI.getAll - Response data:', response.data);

      // Asegurar que response.data sea un array - manejo más robusto
      let dataArray = [];

      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto, verificar si es un vehículo individual o un objeto contenedor
        if (response.data.idVehiculo || response.data.plaVehiculo) {
          // Es un vehículo individual, convertirlo en array
          dataArray = [response.data];
        } else if (response.data.vehiculos && Array.isArray(response.data.vehiculos)) {
          // Es un objeto contenedor con array de vehículos
          dataArray = response.data.vehiculos;
        } else {
          // Es otro tipo de objeto, intentar convertirlo
          dataArray = [response.data];
        }
      } else if (typeof response.data === 'string') {
        // Si es un string, intentar parsear como JSON
        try {
          const parsedData = JSON.parse(response.data);
          if (Array.isArray(parsedData)) {
            dataArray = parsedData;
          } else if (parsedData && typeof parsedData === 'object') {
            if (parsedData.idVehiculo || parsedData.plaVehiculo) {
              dataArray = [parsedData];
            } else if (parsedData.vehiculos && Array.isArray(parsedData.vehiculos)) {
              dataArray = parsedData.vehiculos;
            }
          }
        } catch (parseError) {
          console.warn('vehiculosAPI.getAll - No se pudo parsear response.data como JSON:', response.data);
          dataArray = [];
        }
      }
      // Si response.data es null, undefined, número, boolean, etc., dataArray queda como array vacío

      // Adaptar la respuesta para que tenga la estructura esperada
      const vehiculos = dataArray.map(vehiculo => ({
        ...vehiculo,
        estVehiculo: vehiculo.estVehiculo || 'DISPONIBLE',
        lat: vehiculo.lat,
        lng: vehiculo.lng,
        speed: vehiculo.speed || 0,
        direction: vehiculo.direction || 0
      }));

      console.log('vehiculosAPI.getAll - Vehículos procesados:', vehiculos.length);
      return {
        success: true,
        vehiculos,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.getAll');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculos: [],
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    try {
      if (!id) {
        return {
          success: false,
          vehiculo: null,
          error: {
            code: 'MISSING_ID',
            message: 'ID de vehículo requerido',
            details: 'Se debe proporcionar un ID válido'
          }
        };
      }

      const response = await apiClient.get(`/api/vehiculos/${id}`);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al obtener vehículo');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.getById');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Crear nuevo vehículo
  create: async (vehicleData) => {
    try {
      // Validaciones específicas para vehículos según la base de datos
      const { 
        numVehiculo, 
        plaVehiculo, 
        marVehiculo, 
        modVehiculo, 
        anioVehiculo,
        fecVenSOAT,
        fecVenTec,
        estVehiculo,
        idEmpresa,
        idConductorAsignado
      } = vehicleData;

      const missing = apiUtils.validateRequired({ 
        numVehiculo,
        plaVehiculo, 
        marVehiculo, 
        modVehiculo, 
        anioVehiculo,
        fecVenSOAT,
        fecVenTec
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar placa (formato ABC123 o ABC12D)
      const placaRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/;
      if (!placaRegex.test(plaVehiculo)) {
        throw new Error('La placa debe tener formato ABC123 o ABC12D');
      }

      // Validar año
      const currentYear = new Date().getFullYear();
      if (anioVehiculo < 1950 || anioVehiculo > currentYear + 1) {
        throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
      }

      // Validar que el año sea un número válido
      if (isNaN(anioVehiculo) || anioVehiculo <= 0) {
        throw new Error('El año debe ser un número válido');
      }

      // Validar estado de vehículo
      const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
      if (estVehiculo && !validStates.includes(estVehiculo)) {
        throw new Error('Estado de vehículo inválido. Debe ser: ' + validStates.join(', '));
      }

      // Validar fechas de vencimiento
      const fechaSOAT = new Date(fecVenSOAT);
      const fechaTec = new Date(fecVenTec);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas

      if (isNaN(fechaSOAT.getTime()) || isNaN(fechaTec.getTime())) {
        throw new Error('Las fechas de vencimiento deben ser válidas');
      }

      if (fechaSOAT <= hoy) {
        throw new Error('La fecha de vencimiento del SOAT debe ser futura');
      }

      if (fechaTec <= hoy) {
        throw new Error('La fecha de vencimiento de la revisión técnica debe ser futura');
      }

      // Validar que las fechas no sean demasiado lejanas (máximo 2 años)
      const dosAnios = new Date();
      dosAnios.setFullYear(dosAnios.getFullYear() + 2);

      if (fechaSOAT > dosAnios) {
        throw new Error('La fecha de vencimiento del SOAT no puede ser mayor a 2 años');
      }

      if (fechaTec > dosAnios) {
        throw new Error('La fecha de vencimiento de la revisión técnica no puede ser mayor a 2 años');
      }

      const response = await apiClient.post('/api/vehiculos', {
        numVehiculo: numVehiculo.trim(),
        plaVehiculo: plaVehiculo.trim().toUpperCase(),
        marVehiculo: marVehiculo.trim(),
        modVehiculo: modVehiculo.trim(),
        anioVehiculo,
        fecVenSOAT,
        fecVenTec,
        estVehiculo: estVehiculo || 'DISPONIBLE',
        idEmpresa: idEmpresa || 1,
        idConductorAsignado: idConductorAsignado || null
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al crear vehículo');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.create');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Actualizar vehículo
  update: async (id, vehicleData) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');

      // Validar datos si se proporcionan
      if (vehicleData.plaVehiculo) {
        const placaRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/;
        if (!placaRegex.test(vehicleData.plaVehiculo)) {
          throw new Error('La placa debe tener formato ABC123 o ABC12D');
        }
      }

      if (vehicleData.anioVehiculo) {
        const currentYear = new Date().getFullYear();
        if (vehicleData.anioVehiculo < 1950 || vehicleData.anioVehiculo > currentYear + 1) {
          throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
        }
        if (isNaN(vehicleData.anioVehiculo) || vehicleData.anioVehiculo <= 0) {
          throw new Error('El año debe ser un número válido');
        }
      }

      if (vehicleData.fecVenSOAT) {
        const fechaSOAT = new Date(vehicleData.fecVenSOAT);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (isNaN(fechaSOAT.getTime())) {
          throw new Error('La fecha de vencimiento del SOAT debe ser válida');
        }
        if (fechaSOAT <= hoy) {
          throw new Error('La fecha de vencimiento del SOAT debe ser futura');
        }
      }

      if (vehicleData.fecVenTec) {
        const fechaTec = new Date(vehicleData.fecVenTec);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (isNaN(fechaTec.getTime())) {
          throw new Error('La fecha de vencimiento de la revisión técnica debe ser válida');
        }
        if (fechaTec <= hoy) {
          throw new Error('La fecha de vencimiento de la revisión técnica debe ser futura');
        }
      }

      if (vehicleData.estVehiculo) {
        const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
        if (!validStates.includes(vehicleData.estVehiculo)) {
          throw new Error('Estado de vehículo inválido');
        }
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...vehicleData };
      if (cleanedData.plaVehiculo) cleanedData.plaVehiculo = cleanedData.plaVehiculo.trim().toUpperCase();
      if (cleanedData.marVehiculo) cleanedData.marVehiculo = cleanedData.marVehiculo.trim();
      if (cleanedData.modVehiculo) cleanedData.modVehiculo = cleanedData.modVehiculo.trim();
      if (cleanedData.numVehiculo) cleanedData.numVehiculo = cleanedData.numVehiculo.trim();

      const response = await apiClient.put(`/api/vehiculos/${id}`, cleanedData);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al actualizar vehículo');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.update');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Eliminar vehículo
  delete: async (id) => {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'ID de vehículo requerido',
            details: 'Se debe proporcionar un ID válido'
          }
        };
      }

      const response = await apiClient.delete(`/api/vehiculos/${id}`);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al eliminar vehículo');
      }

      return {
        success: true,
        message: 'Vehículo eliminado exitosamente',
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.delete');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de vehículo
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de vehículo y nuevo estado son requeridos');
      }

      const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/vehiculos/${id}/estado`, {
        estVehiculo: nuevoEstado
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al cambiar estado del vehículo');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.changeStatus');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Asignar conductor a vehículo
  assignDriver: async (idVehiculo, idConductor) => {
    try {
      if (!idVehiculo || !idConductor) {
        return {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'ID de vehículo e ID de conductor son requeridos',
            details: 'Se deben proporcionar ambos IDs'
          }
        };
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/asignar-conductor`, {
        idConductor
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al asignar conductor');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.assignDriver');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Desasignar conductor de vehículo
  unassignDriver: async (idVehiculo) => {
    try {
      if (!idVehiculo) {
        return {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'ID de vehículo es requerido',
            details: 'Se debe proporcionar un ID válido'
          }
        };
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/desasignar-conductor`);

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al desasignar conductor');
      }

      return {
        success: true,
        vehiculo: response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.unassignDriver');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        vehiculo: null,
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener estadísticas de vehículos
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos/estadisticas');

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al obtener estadísticas');
      }

      return {
        success: true,
        estadisticas: response.data.estadisticas || response.data,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.getStatistics');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        estadisticas: {
          total: 0,
          disponibles: 0,
          enRuta: 0,
          enMantenimiento: 0,
          fueraDeServicio: 0
        },
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  },

  // Obtener conductores disponibles para asignar
  getConductoresDisponibles: async () => {
    try {
      // Usar el endpoint existente de conductores con filtro de estado
      const response = await apiClient.get('/api/conductores?estConductor=ACTIVO');

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al obtener conductores');
      }

      // Filtrar conductores que no tienen vehículo asignado
      let conductoresDisponibles = [];
      if (Array.isArray(response.data)) {
        conductoresDisponibles = response.data.filter(conductor =>
          !conductor.plaVehiculo // Si no tiene placa asignada, está disponible
        );
      } else if (response.data.conductores && Array.isArray(response.data.conductores)) {
        conductoresDisponibles = response.data.conductores.filter(conductor =>
          !conductor.plaVehiculo
        );
      }

      return {
        success: true,
        conductoresDisponibles,
        error: null
      };
    } catch (error) {
      errorHandler.logError(error, 'vehiculosAPI.getConductoresDisponibles');
      const processedError = errorHandler.processError(error);

      return {
        success: false,
        conductoresDisponibles: [],
        error: processedError,
        userMessage: errorHandler.getUserFriendlyMessage(error)
      };
    }
  }
};

export default vehiculosAPI;