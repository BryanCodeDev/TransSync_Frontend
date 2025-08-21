// api/adminAPI.js - Servicio específico para administración
import { apiClient, apiUtils } from '../api/baseAPI'; // Fixed import path

const adminAPI = {
  // ================================
  // PANEL DE SUPERADMINISTRADOR
  // ================================
  
  // Acceso exclusivo para SUPERADMIN
  getSuperAdminPanel: async () => {
    try {
      const response = await apiClient.get('/admin/solo-superadmin');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ADMINISTRADORES
  // ================================
  
  // Listar administradores con filtros
  getAdministrators: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/listar-administradores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener administrador por ID
  getAdministratorById: async (id) => {
    try {
      if (!id) throw new Error('ID de administrador requerido');
      const response = await apiClient.get(`/admin/administrador/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ROLES
  // ================================
  
  // Asignar rol a usuario
  assignRole: async (userData) => {
    try {
      const {
        idUsuario,
        nuevoRol,
        nomAdministrador,
        apeAdministrador,
        numDocAdministrador,
        idEmpresa
      } = userData;

      // Validaciones básicas
      const missing = apiUtils.validateRequired({ idUsuario, nuevoRol });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar rol válido
      const validRoles = ['ADMINISTRADOR', 'SUPERADMIN', 'USER', 'PENDIENTE'];
      if (!validRoles.includes(nuevoRol)) {
        throw new Error(`Rol inválido. Roles válidos: ${validRoles.join(', ')}`);
      }

      // Validaciones adicionales para roles administrativos
      if (['ADMINISTRADOR', 'SUPERADMIN'].includes(nuevoRol)) {
        const adminRequired = { nomAdministrador, apeAdministrador, numDocAdministrador };
        const adminMissing = apiUtils.validateRequired(adminRequired);
        if (adminMissing.length > 0) {
          throw new Error(`Para roles administrativos se requieren: ${adminMissing.join(', ')}`);
        }

        // Validar número de documento
        if (numDocAdministrador.length < 6) {
          throw new Error('El número de documento debe tener al menos 6 caracteres');
        }
      }

      const response = await apiClient.put('/admin/asignar-rol', {
        idUsuario,
        nuevoRol,
        nomAdministrador: nomAdministrador?.trim(),
        apeAdministrador: apeAdministrador?.trim(),
        numDocAdministrador: numDocAdministrador?.trim(),
        idEmpresa
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Promover usuario a administrador
  promoteToAdmin: async (userId, adminData) => {
    return adminAPI.assignRole({
      idUsuario: userId,
      nuevoRol: 'ADMINISTRADOR',
      ...adminData
    });
  },

  // Promover administrador a superadmin
  promoteToSuperAdmin: async (userId, adminData) => {
    return adminAPI.assignRole({
      idUsuario: userId,
      nuevoRol: 'SUPERADMIN',
      ...adminData
    });
  },

  // Degradar a usuario normal
  demoteToUser: async (userId) => {
    return adminAPI.assignRole({
      idUsuario: userId,
      nuevoRol: 'USER'
    });
  },

  // ================================
  // EDICIÓN DE ADMINISTRADORES
  // ================================
  
  // Editar datos de administrador
  editAdministrator: async (idUsuario, adminData) => {
    try {
      if (!idUsuario) {
        throw new Error('ID de usuario requerido');
      }

      const { nomAdministrador, apeAdministrador, numDocAdministrador, telAdministrador } = adminData;

      // Validaciones de campos requeridos
      const missing = apiUtils.validateRequired({ 
        nomAdministrador, 
        apeAdministrador, 
        numDocAdministrador 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validaciones específicas
      if (nomAdministrador.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      if (apeAdministrador.trim().length < 2) {
        throw new Error('El apellido debe tener al menos 2 caracteres');
      }

      if (numDocAdministrador.trim().length < 6) {
        throw new Error('El número de documento debe tener al menos 6 caracteres');
      }

      // Validar teléfono si se proporciona
      if (telAdministrador && telAdministrador.trim().length < 7) {
        throw new Error('El número de teléfono debe tener al menos 7 dígitos');
      }

      const response = await apiClient.put(`/admin/editar-administrador/${idUsuario}`, {
        nomAdministrador: nomAdministrador.trim(),
        apeAdministrador: apeAdministrador.trim(),
        numDocAdministrador: numDocAdministrador.trim(),
        telAdministrador: telAdministrador?.trim()
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ELIMINACIÓN DE ADMINISTRADORES
  // ================================
  
  // Eliminar administrador
  deleteAdministrator: async (idUsuario) => {
    try {
      if (!idUsuario) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/admin/eliminar-administrador/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de administrador
  changeAdministratorStatus: async (idUsuario, estado) => {
    try {
      if (!idUsuario || typeof estado !== 'boolean') {
        throw new Error('ID de usuario y estado son requeridos');
      }

      const response = await apiClient.patch(`/admin/cambiar-estado/${idUsuario}`, {
        estActivo: estado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar administrador
  activateAdministrator: async (idUsuario) => {
    return adminAPI.changeAdministratorStatus(idUsuario, true);
  },

  // Desactivar administrador
  deactivateAdministrator: async (idUsuario) => {
    return adminAPI.changeAdministratorStatus(idUsuario, false);
  },

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================
  
  // Obtener estadísticas del sistema
  getSystemStatistics: async () => {
    try {
      const response = await apiClient.get('/admin/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de usuarios
  getUserStatistics: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/estadisticas-usuarios${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución de roles
  getRoleDistribution: async () => {
    try {
      const response = await apiClient.get('/admin/distribucion-roles');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener actividad del sistema
  getSystemActivity: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/actividad-sistema${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE USUARIOS
  // ================================
  
  // Listar todos los usuarios
  getAllUsers: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/usuarios${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar usuarios
  searchUsers: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const params = apiUtils.createUrlParams({ 
        ...filters, 
        search: searchTerm.trim() 
      });
      
      const response = await apiClient.get(`/admin/usuarios/buscar${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener usuarios pendientes de aprobación
  getPendingUsers: async () => {
    try {
      const response = await apiClient.get('/admin/usuarios-pendientes');
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
      const response = await apiClient.get('/admin/configuracion');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar configuración del sistema
  updateSystemConfig: async (configData) => {
    try {
      const response = await apiClient.put('/admin/configuracion', configData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // AUDITORÍA Y LOGS
  // ================================
  
  // Obtener logs de auditoría
  getAuditLogs: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/auditoria${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener logs de sistema
  getSystemLogs: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/admin/logs-sistema${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // RESPALDOS Y MANTENIMIENTO
  // ================================
  
  // Crear respaldo de la base de datos
  createBackup: async () => {
    try {
      const response = await apiClient.post('/admin/backup');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener lista de respaldos
  getBackups: async () => {
    try {
      const response = await apiClient.get('/admin/backups');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Restaurar respaldo
  restoreBackup: async (backupId) => {
    try {
      if (!backupId) throw new Error('ID de respaldo requerido');
      const response = await apiClient.post(`/admin/backup/${backupId}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Limpiar logs antiguos
  cleanupLogs: async (diasRetencion = 30) => {
    try {
      const response = await apiClient.post('/admin/limpiar-logs', { 
        diasRetencion 
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de administrador
  validateAdminData: (adminData) => {
    const errors = [];
    
    // Validar nombre
    if (!adminData.nomAdministrador || adminData.nomAdministrador.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    // Validar apellido
    if (!adminData.apeAdministrador || adminData.apeAdministrador.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar documento
    if (!adminData.numDocAdministrador || adminData.numDocAdministrador.trim().length < 6) {
      errors.push('El número de documento debe tener al menos 6 caracteres');
    }

    // Validar teléfono si se proporciona
    if (adminData.telAdministrador && adminData.telAdministrador.trim().length < 7) {
      errors.push('El número de teléfono debe tener al menos 7 dígitos');
    }

    return errors;
  },

  // Formatear datos de administrador para mostrar
  formatAdminData: (admin) => {
    return {
      ...admin,
      nombreCompleto: `${admin.nomAdministrador} ${admin.apeAdministrador}`,
      rolFormateado: adminAPI.getRoleLabel(admin.role),
      estadoFormateado: admin.estActivo ? 'Activo' : 'Inactivo',
      fechaRegistroFormateada: admin.fechaRegistro ? 
        new Date(admin.fechaRegistro).toLocaleDateString('es-ES') : 'N/A'
    };
  },

  // Obtener etiqueta del rol
  getRoleLabel: (role) => {
    const roleLabels = {
      'SUPERADMIN': 'Superadministrador',
      'ADMINISTRADOR': 'Administrador',
      'USER': 'Usuario',
      'PENDIENTE': 'Pendiente'
    };
    return roleLabels[role] || role;
  },

  // Obtener color del rol para UI
  getRoleColor: (role) => {
    const roleColors = {
      'SUPERADMIN': 'purple',
      'ADMINISTRADOR': 'blue',
      'USER': 'green',
      'PENDIENTE': 'orange'
    };
    return roleColors[role] || 'gray';
  },

  // Verificar permisos para acción específica
  checkPermission: (userRole, action) => {
    const permissions = {
      'SUPERADMIN': ['*'], // Todos los permisos
      'ADMINISTRADOR': [
        'view_users', 'edit_users', 'view_reports', 'manage_vehicles',
        'manage_drivers', 'manage_routes', 'view_statistics'
      ],
      'USER': ['view_profile', 'edit_profile']
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(action);
  },

  // Exportar lista de administradores
  exportAdministrators: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/admin/export${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `administradores_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Administradores exportados exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de actividad administrativa
  generateActivityReport: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/admin/reporte-actividad', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Export compatible con import { adminService } y import adminAPI
export const adminService = adminAPI;
export default adminAPI;