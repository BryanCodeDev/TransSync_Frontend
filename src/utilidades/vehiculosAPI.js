// api/vehiculosAPI.js - Servicio específico para vehículos
import { apiClient, apiUtils } from './baseAPI';

const vehiculosAPI = {
  // ================================
  // GESTIÓN BÁSICA DE VEHÍCULOS
  // ================================
  
  // Obtener vehículos con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/vehiculos${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo vehículo
  create: async (vehicleData) => {
    try {
      // Validaciones específicas para vehículos
      const { 
        placaVehiculo, 
        marcaVehiculo, 
        modeloVehiculo, 
        anoVehiculo,
        capacidadVehiculo,
        tipVehiculo,
        idEmpresa 
      } = vehicleData;

      const missing = apiUtils.validateRequired({ 
        placaVehiculo, 
        marcaVehiculo, 
        modeloVehiculo, 
        anoVehiculo,
        capacidadVehiculo,
        tipVehiculo
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar placa (formato básico)
      if (placaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      // Validar año
      const currentYear = new Date().getFullYear();
      if (anoVehiculo < 1950 || anoVehiculo > currentYear + 1) {
        throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
      }

      // Validar capacidad
      if (capacidadVehiculo < 1 || capacidadVehiculo > 100) {
        throw new Error('La capacidad debe estar entre 1 y 100 pasajeros');
      }

      // Validar tipo de vehículo
      const validTypes = ['BUS', 'MICROBUS', 'VAN', 'AUTOMOVIL', 'CAMION'];
      if (!validTypes.includes(tipVehiculo)) {
        throw new Error('Tipo de vehículo inválido. Debe ser: ' + validTypes.join(', '));
      }

      const response = await apiClient.post('/vehiculos', {
        ...vehicleData,
        placaVehiculo: placaVehiculo.trim().toUpperCase(),
        marcaVehiculo: marcaVehiculo.trim(),
        modeloVehiculo: modeloVehiculo.trim(),
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
      if (vehicleData.placaVehiculo && vehicleData.placaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      if (vehicleData.anoVehiculo) {
        const currentYear = new Date().getFullYear();
        if (vehicleData.anoVehiculo < 1950 || vehicleData.anoVehiculo > currentYear + 1) {
          throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
        }
      }

      if (vehicleData.capacidadVehiculo) {
        if (vehicleData.capacidadVehiculo < 1 || vehicleData.capacidadVehiculo > 100) {
          throw new Error('La capacidad debe estar entre 1 y 100 pasajeros');
        }
      }

      if (vehicleData.tipVehiculo) {
        const validTypes = ['BUS', 'MICROBUS', 'VAN', 'AUTOMOVIL', 'CAMION'];
        if (!validTypes.includes(vehicleData.tipVehiculo)) {
          throw new Error('Tipo de vehículo inválido');
        }
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...vehicleData };
      if (cleanedData.placaVehiculo) cleanedData.placaVehiculo = cleanedData.placaVehiculo.trim().toUpperCase();
      if (cleanedData.marcaVehiculo) cleanedData.marcaVehiculo = cleanedData.marcaVehiculo.trim();
      if (cleanedData.modeloVehiculo) cleanedData.modeloVehiculo = cleanedData.modeloVehiculo.trim();

      const response = await apiClient.put(`/vehiculos/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar vehículo
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.delete(`/vehiculos/${id}`);
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

      const validStates = ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO', 'REPARACION', 'FUERA_DE_SERVICIO'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/vehiculos/${id}/estado`, {
        estVehiculo: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar vehículo
  activate: async (id) => {
    return vehiculosAPI.changeStatus(id, 'ACTIVO');
  },

  // Desactivar vehículo
  deactivate: async (id) => {
    return vehiculosAPI.changeStatus(id, 'INACTIVO');
  },

  // Marcar como en mantenimiento
  setMaintenance: async (id) => {
    return vehiculosAPI.changeStatus(id, 'MANTENIMIENTO');
  },

  // Marcar como en reparación
  setRepair: async (id) => {
    return vehiculosAPI.changeStatus(id, 'REPARACION');
  },

  // Marcar como fuera de servicio
  setOutOfService: async (id) => {
    return vehiculosAPI.changeStatus(id, 'FUERA_DE_SERVICIO');
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener vehículos disponibles
  getAvailable: async () => {
    try {
      const response = await apiClient.get('/vehiculos?estVehiculo=ACTIVO&sinConductor=true');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículos activos
  getActive: async () => {
    try {
      const response = await apiClient.get('/vehiculos?estVehiculo=ACTIVO');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículos sin conductor asignado
  getUnassigned: async () => {
    try {
      const response = await apiClient.get('/vehiculos?sinConductor=true');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener vehículos en mantenimiento
  getInMaintenance: async () => {
    try {
      const response = await apiClient.get('/vehiculos?estVehiculo=MANTENIMIENTO,REPARACION');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar vehículos por placa o marca
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const response = await apiClient.get(`/vehiculos/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // MANTENIMIENTO
  // ================================
  
  // Obtener historial de mantenimiento
  getMaintenanceHistory: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.get(`/vehiculos/${id}/mantenimientos`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Programar mantenimiento
  scheduleMaintenance: async (id, maintenanceData) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      
      const { fechaMantenimiento, tipoMantenimiento, descripcion } = maintenanceData;
      
      const missing = apiUtils.validateRequired({ 
        fechaMantenimiento, 
        tipoMantenimiento 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post(`/vehiculos/${id}/mantenimientos`, {
        fechaMantenimiento,
        tipoMantenimiento,
        descripcion: descripcion?.trim()
      });

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
      const response = await apiClient.get('/vehiculos/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución por tipo
  getTypeDistribution: async () => {
    try {
      const response = await apiClient.get('/vehiculos/distribucion-tipos');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución por estado
  getStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/vehiculos/distribucion-estados');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de vehículo
  validateVehicleData: (vehicleData) => {
    const errors = [];
    
    // Validar placa
    if (!vehicleData.placaVehiculo || vehicleData.placaVehiculo.trim().length < 6) {
      errors.push('La placa debe tener al menos 6 caracteres');
    }
    
    // Validar marca
    if (!vehicleData.marcaVehiculo || vehicleData.marcaVehiculo.trim().length < 2) {
      errors.push('La marca debe tener al menos 2 caracteres');
    }

    // Validar modelo
    if (!vehicleData.modeloVehiculo || vehicleData.modeloVehiculo.trim().length < 2) {
      errors.push('El modelo debe tener al menos 2 caracteres');
    }

    // Validar año
    const currentYear = new Date().getFullYear();
    if (!vehicleData.anoVehiculo || vehicleData.anoVehiculo < 1950 || vehicleData.anoVehiculo > currentYear + 1) {
      errors.push(`El año debe estar entre 1950 y ${currentYear + 1}`);
    }

    // Validar capacidad
    if (!vehicleData.capacidadVehiculo || vehicleData.capacidadVehiculo < 1 || vehicleData.capacidadVehiculo > 100) {
      errors.push('La capacidad debe estar entre 1 y 100 pasajeros');
    }

    // Validar tipo
    const validTypes = ['BUS', 'MICROBUS', 'VAN', 'AUTOMOVIL', 'CAMION'];
    if (!vehicleData.tipVehiculo || !validTypes.includes(vehicleData.tipVehiculo)) {
      errors.push('Debe seleccionar un tipo de vehículo válido');
    }

    return errors;
  },

  // Formatear datos de vehículo para mostrar
  formatVehicleData: (vehicle) => {
    return {
      ...vehicle,
      descripcionCompleta: `${vehicle.marcaVehiculo} ${vehicle.modeloVehiculo} ${vehicle.anoVehiculo}`,
      placaFormateada: vehicle.placaVehiculo?.toUpperCase(),
      estadoFormateado: vehiculosAPI.getStatusLabel(vehicle.estVehiculo),
      tipoFormateado: vehiculosAPI.getTypeLabel(vehicle.tipVehiculo),
      capacidadFormateada: `${vehicle.capacidadVehiculo} pasajeros`
    };
  },

  // Obtener etiqueta del estado
  getStatusLabel: (status) => {
    const statusLabels = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'MANTENIMIENTO': 'En mantenimiento',
      'REPARACION': 'En reparación',
      'FUERA_DE_SERVICIO': 'Fuera de servicio'
    };
    return statusLabels[status] || status;
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'ACTIVO': 'green',
      'INACTIVO': 'red',
      'MANTENIMIENTO': 'blue',
      'REPARACION': 'orange',
      'FUERA_DE_SERVICIO': 'gray'
    };
    return statusColors[status] || 'gray';
  },

  // Obtener etiqueta del tipo
  getTypeLabel: (type) => {
    const typeLabels = {
      'BUS': 'Bus',
      'MICROBUS': 'Microbus',
      'VAN': 'Van',
      'AUTOMOVIL': 'Automóvil',
      'CAMION': 'Camión'
    };
    return typeLabels[type] || type;
  },

  // Exportar lista de vehículos
  exportVehicles: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/vehiculos/export${params ? `?${params}` : ''}`, {
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