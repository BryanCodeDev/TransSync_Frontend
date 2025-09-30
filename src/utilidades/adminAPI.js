import { apiClient, apiUtils } from '../api/baseAPI';

const adminAPI = {
  // ================================
  // GESTIÓN DE USUARIOS
  // ================================

  // Listar conductores y usuarios pendientes
  getUsers: async (filters = {}) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      const params = new URLSearchParams();

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId como filtro obligatorio
      params.append('idEmpresa', empresaId);

      // Agregar filtros adicionales si existen
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Listar conductores y gestores
  getConductoresYGestionadores: async () => {
    try {
      const response = await apiClient.get('/api/admin/conductores-gestores');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId, newRole) => {
    try {
      if (!userId || !newRole) {
        throw new Error('ID de usuario y nuevo rol son requeridos');
      }

      const response = await apiClient.put(`/api/admin/users/${userId}/role`, {
        nuevoRol: newRole
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ROLES Y PERMISOS
  // ================================

  // Obtener todos los roles disponibles
  getRoles: async () => {
    try {
      const response = await apiClient.get('/api/admin/roles');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo rol
  createRole: async (roleData) => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Según esquema corregido, solo necesitamos nombre
      const { name } = roleData;

      if (!name) {
        throw new Error('Nombre del rol es requerido');
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Solo enviar campos que existen en la BD (idRol, nomRol)
      const response = await apiClient.post('/api/admin/roles', {
        nomRol: name.trim(), // ✅ CORRECCIÓN CRÍTICA: Usar nomRol según esquema corregido
        idEmpresa: empresaId  // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId para seguridad
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar rol
  updateRole: async (roleId, roleData) => {
    try {
      if (!roleId) {
        throw new Error('ID del rol requerido');
      }

      const response = await apiClient.put(`/api/admin/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar rol
  deleteRole: async (roleId) => {
    try {
      if (!roleId) {
        throw new Error('ID del rol requerido');
      }

      const response = await apiClient.delete(`/api/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================

  // Obtener estadísticas generales
  getStats: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en estadísticas generales
      const response = await apiClient.get(`/api/admin/stats?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en estadísticas de usuarios
      const response = await apiClient.get(`/api/admin/stats/users?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de sistema
  getSystemStats: async () => {
    try {
      // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
      const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
      const empresaId = userContext.empresaId || userContext.idEmpresa;

      if (!empresaId) {
        throw new Error('empresaId no encontrado en el contexto del usuario');
      }

      // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en estadísticas de sistema
      const response = await apiClient.get(`/api/admin/stats/system?idEmpresa=${empresaId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // CONFIGURACIÓN DEL SISTEMA
  // ================================

  // Obtener configuración del sistema
  getSystemConfig: async () => {
    try {
      const response = await apiClient.get('/api/admin/config');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar configuración del sistema
  updateSystemConfig: async (configData) => {
    try {
      const response = await apiClient.put('/api/admin/config', configData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // AUDITORÍA Y LOGS
  // ================================

  // Obtener logs del sistema
  getSystemLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.level) params.append('level', filters.level);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const endpoint = `/api/admin/logs${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener logs de auditoría
  getAuditLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const queryString = params.toString();
      const endpoint = `/api/admin/audit${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES
  // ================================

  // Verificar permisos de administrador
  checkAdminAccess: async () => {
    try {
      const response = await apiClient.get('/api/admin/access-check');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Health check del sistema de administración
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/api/admin/health');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Exportaciones individuales para compatibilidad
export const {
  getUsers,
  getConductoresYGestionadores,
  deleteUser,
  updateUserRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getStats,
  getUserStats,
  getSystemStats,
  getSystemConfig,
  updateSystemConfig,
  getSystemLogs,
  getAuditLogs,
  checkAdminAccess,
  healthCheck
} = adminAPI;

export default adminAPI;