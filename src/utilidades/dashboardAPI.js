// src/utilidades/driversAPI.js

import api from '../api/baseAPI'; // usamos el api con interceptor que agrega el token

const driversAPI = {
  // ================================
  // GESTIÓN BÁSICA DE CONDUCTORES
  // ================================

  // Obtener conductores con filtros
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/conductores', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Obtener conductor por ID
  getById: async (id) => {
    if (!id) throw new Error('ID de conductor requerido');
    const response = await api.get(`/conductores/${id}`);
    return response.data;
  },

  // Crear nuevo conductor
  create: async (driverData) => {
    const response = await api.post('/conductores', driverData);
    return response.data;
  },

  // Actualizar conductor
  update: async (id, driverData) => {
    if (!id) throw new Error('ID de conductor requerido');
    const response = await api.put(`/conductores/${id}`, driverData);
    return response.data;
  },

  // Eliminar conductor
  delete: async (id) => {
    if (!id) throw new Error('ID de conductor requerido');
    const response = await api.delete(`/conductores/${id}`);
    return response.data;
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================

  changeStatus: async (id, nuevoEstado) => {
    if (!id || !nuevoEstado) throw new Error('ID de conductor y nuevo estado son requeridos');
    const response = await api.patch(`/conductores/${id}/estado`, { estConductor: nuevoEstado });
    return response.data;
  },

  activate: (id) => driversAPI.changeStatus(id, 'ACTIVO'),
  deactivate: (id) => driversAPI.changeStatus(id, 'INACTIVO'),
  setResting: (id) => driversAPI.changeStatus(id, 'DIA_DESCANSO'),
  setIncapacitated: (id) => driversAPI.changeStatus(id, 'INCAPACITADO'),
  setOnVacation: (id) => driversAPI.changeStatus(id, 'DE_VACACIONES'),

  // ================================
  // GESTIÓN DE VEHÍCULOS
  // ================================

  assignVehicle: async (idConductor, idVehiculo) => {
    if (!idConductor || !idVehiculo) throw new Error('ID de conductor e ID de vehículo son requeridos');
    const response = await api.patch(`/conductores/${idConductor}/asignar-vehiculo`, { idVehiculo });
    return response.data;
  },

  unassignVehicle: async (idConductor) => {
    if (!idConductor) throw new Error('ID de conductor requerido');
    const response = await api.patch(`/conductores/${idConductor}/desasignar-vehiculo`);
    return response.data;
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================

  getAvailable: async () => {
    const response = await api.get('/conductores/disponibles');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/conductores', { params: { estConductor: 'ACTIVO' } });
    return response.data;
  },

  getUnassigned: async () => {
    const response = await api.get('/conductores', { params: { sinVehiculo: true } });
    return response.data;
  },

  search: async (term) => {
    if (!term || term.trim().length < 2) throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    const response = await api.get(`/conductores/buscar`, { params: { q: term.trim() } });
    return response.data;
  },

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================

  getStatistics: async () => {
    const response = await api.get('/conductores/estadisticas');
    return response.data;
  },

  getStatusDistribution: async () => {
    const response = await api.get('/conductores/distribucion-estados');
    return response.data;
  },

  // ================================
  // GESTIÓN DE LICENCIAS
  // ================================

  checkLicenseExpiration: async (days = 30) => {
    const response = await api.get('/conductores/licencias/vencimiento', { params: { dias: days } });
    return response.data;
  },

  renewLicense: async (id, nuevaFecha, tipoLicencia) => {
    if (!id || !nuevaFecha) throw new Error('ID y fecha son requeridos');
    const body = { fecVenLicConductor: nuevaFecha };
    if (tipoLicencia) body.tipLicConductor = tipoLicencia;
    const response = await api.patch(`/conductores/${id}/renovar-licencia`, body);
    return response.data;
  },
};

export default driversAPI;
