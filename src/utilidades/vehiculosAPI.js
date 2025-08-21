// utilidades/vehiculosAPI.js - Servicio actualizado para vehículos
import { apiClient, apiUtils } from '../api/baseAPI';

const vehiculosAPI = {
  // ================================
  // GESTIÓN BÁSICA DE VEHÍCULOS
  // ================================
  
  // Obtener vehículos con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/vehiculos${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.get(`/api/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
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
        idEmpresa 
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

      // Validar placa (formato básico)
      if (plaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      // Validar año
      const currentYear = new Date().getFullYear();
      if (anioVehiculo < 1950 || anioVehiculo > currentYear + 1) {
        throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
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
      
      if (fechaSOAT <= hoy) {
        throw new Error('La fecha de vencimiento del SOAT debe ser futura');
      }

      if (fechaTec <= hoy) {
        throw new Error('La fecha de vencimiento de la revisión técnica debe ser futura');
      }

      const response = await apiClient.post('/api/vehiculos', {
        ...vehicleData,
        plaVehiculo: plaVehiculo.trim().toUpperCase(),
        marVehiculo: marVehiculo.trim(),
        modVehiculo: modVehiculo.trim(),
        numVehiculo: numVehiculo.trim(),
        idEmpresa: idEmpresa || 1
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar vehículo
  update: async (id, vehicleData) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');

      // Validar datos si se proporcionan
      if (vehicleData.plaVehiculo && vehicleData.plaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      if (vehicleData.anioVehiculo) {
        const currentYear = new Date().getFullYear();
        if (vehicleData.anioVehiculo < 1950 || vehicleData.anioVehiculo > currentYear + 1) {
          throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
        }
      }

      if (vehicleData.estVehiculo) {
        const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
        if (!validStates.includes(vehicleData.estVehiculo)) {
          throw new Error('Estado de vehículo inválido');
        }
      }

      // Validar fechas de vencimiento si se proporcionan
      if (vehicleData.fecVenSOAT) {
        const fechaSOAT = new Date(vehicleData.fecVenSOAT);
        const hoy = new Date();
        if (fechaSOAT <= hoy) {
          throw new Error('La fecha de vencimiento del SOAT debe ser futura');
        }
      }

      if (vehicleData.fecVenTec) {
        const fechaTec = new Date(vehicleData.fecVenTec);
        const hoy = new Date();
        if (fechaTec <= hoy) {
          throw new Error('La fecha de vencimiento de la revisión técnica debe ser futura');
        }
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...vehicleData };
      if (cleanedData.plaVehiculo) cleanedData.plaVehiculo = cleanedData.plaVehiculo.trim().toUpperCase();
      if (cleanedData.marVehiculo) cleanedData.marVehiculo = cleanedData.marVehiculo.trim();
      if (cleanedData.modVehiculo) cleanedData.modVehiculo = cleanedData.modVehiculo.trim();
      if (cleanedData.numVehiculo) cleanedData.numVehiculo = cleanedData.numVehiculo.trim();

      const response = await apiClient.put(`/api/vehiculos/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar vehículo
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.delete(`/api/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
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

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar vehículo
  activate: async (id) => {
    return vehiculosAPI.changeStatus(id, 'DISPONIBLE');
  },

  // Desactivar vehículo
  deactivate: async (id) => {
    return vehiculosAPI.changeStatus(id, 'FUERA_DE_SERVICIO');
  },

  // Marcar como en mantenimiento
  setMaintenance: async (id) => {
    return vehiculosAPI.changeStatus(id, 'EN_MANTENIMIENTO');
  },

  // Marcar como en ruta
  setOnRoute: async (id) => {
    return vehiculosAPI.changeStatus(id, 'EN_RUTA');
  },

  // ================================
  // GESTIÓN DE CONDUCTORES
  // ================================

  // Asignar conductor a vehículo
  assignDriver: async (idVehiculo, idConductor) => {
    try {
      if (!idVehiculo || !idConductor) {
        throw new Error('ID de vehículo e ID de conductor son requeridos');
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/asignar-conductor`, {
        idConductor
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Desasignar conductor de vehículo
  unassignDriver: async (idVehiculo) => {
    try {
      if (!idVehiculo) {
        throw new Error('ID de vehículo es requerido');
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/desasignar-conductor`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener vehículos disponibles
  getAvailable: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos?estado=DISPONIBLE');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículos sin conductor asignado
  getUnassigned: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos?sinConductor=true');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículos en mantenimiento
  getInMaintenance: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos?estado=EN_MANTENIMIENTO');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar vehículos
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const response = await apiClient.get(`/api/vehiculos?search=${encodeURIComponent(searchTerm.trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================
  
  // Obtener estadísticas de vehículos
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar vencimientos de documentos
  checkExpirations: async (dias = 30) => {
    try {
      const response = await apiClient.get(`/api/vehiculos/vencimientos?dias=${dias}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de vehículo según la base de datos
  validateVehicleData: (vehicleData) => {
    const errors = [];
    
    // Validar número interno
    if (!vehicleData.numVehiculo || vehicleData.numVehiculo.trim().length < 1) {
      errors.push('El número interno es requerido');
    }
    
    // Validar placa
    if (!vehicleData.plaVehiculo || vehicleData.plaVehiculo.trim().length < 6) {
      errors.push('La placa debe tener al menos 6 caracteres');
    }
    
    // Validar marca
    if (!vehicleData.marVehiculo || vehicleData.marVehiculo.trim().length < 2) {
      errors.push('La marca debe tener al menos 2 caracteres');
    }

    // Validar modelo
    if (!vehicleData.modVehiculo || vehicleData.modVehiculo.trim().length < 1) {
      errors.push('El modelo es requerido');
    }

    // Validar año
    const currentYear = new Date().getFullYear();
    if (!vehicleData.anioVehiculo || vehicleData.anioVehiculo < 1950 || vehicleData.anioVehiculo > currentYear + 1) {
      errors.push(`El año debe estar entre 1950 y ${currentYear + 1}`);
    }

    // Validar estado
    if (vehicleData.estVehiculo) {
      const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
      if (!validStates.includes(vehicleData.estVehiculo)) {
        errors.push('Debe seleccionar un estado válido');
      }
    }

    // Validar fechas de vencimiento
    if (vehicleData.fecVenSOAT) {
      const fechaSOAT = new Date(vehicleData.fecVenSOAT);
      const hoy = new Date();
      if (fechaSOAT <= hoy) {
        errors.push('La fecha de vencimiento del SOAT debe ser futura');
      }
    }

    if (vehicleData.fecVenTec) {
      const fechaTec = new Date(vehicleData.fecVenTec);
      const hoy = new Date();
      if (fechaTec <= hoy) {
        errors.push('La fecha de vencimiento de la revisión técnica debe ser futura');
      }
    }

    return errors;
  },

  // Formatear datos de vehículo para mostrar
  formatVehicleData: (vehicle) => {
    return {
      ...vehicle,
      descripcionCompleta: `${vehicle.marVehiculo} ${vehicle.modVehiculo} ${vehicle.anioVehiculo}`,
      placaFormateada: vehicle.plaVehiculo?.toUpperCase(),
      estadoFormateado: vehiculosAPI.getStatusLabel(vehicle.estVehiculo),
      conductorAsignado: vehicle.conductor ? vehicle.conductor.nombre : 'Sin asignar',
      diasVencimientoSOAT: vehicle.diasVencimientoSOAT,
      diasVencimientoTecnica: vehicle.diasVencimientoTec
    };
  },

  // Obtener etiqueta del estado según la base de datos
  getStatusLabel: (status) => {
    const statusLabels = {
      'DISPONIBLE': 'Disponible',
      'EN_RUTA': 'En Ruta',
      'EN_MANTENIMIENTO': 'En Mantenimiento',
      'FUERA_DE_SERVICIO': 'Fuera de Servicio'
    };
    return statusLabels[status] || status;
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'DISPONIBLE': 'green',
      'EN_RUTA': 'blue',
      'EN_MANTENIMIENTO': 'orange',
      'FUERA_DE_SERVICIO': 'red'
    };
    return statusColors[status] || 'gray';
  },

  // Exportar lista de vehículos
  exportVehicles: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/api/vehiculos/export${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vehiculos_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Vehículos exportados exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

export default vehiculosAPI;