// api/adminAPI.js - Servicio específico para administración
import { apiClient, apiUtils } from '../api/baseAPI';

const adminAPI = {
  // ================================
  // GESTIÓN DE ADMINISTRADORES
  // ================================
  
  // Listar administradores con filtros - RUTA CORREGIDA
  getAdministrators: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      // CAMBIADO: de '/admin/listar-administradores' a '/api/admin/listar-administradores'
      const response = await apiClient.get(`/api/admin/listar-administradores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener administrador por ID - RUTA CORREGIDA
  getAdministratorById: async (id) => {
    try {
      if (!id) throw new Error('ID de administrador requerido');
      const response = await apiClient.get(`/api/admin/administrador/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ROLES
  // ================================
  
  // Asignar rol a usuario - RUTA CORREGIDA
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

      const response = await apiClient.put('/api/admin/asignar-rol', {
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

  // ================================
  // ELIMINACIÓN DE ADMINISTRADORES
  // ================================
  
  // Eliminar administrador - RUTA CORREGIDA
  deleteAdministrator: async (idUsuario) => {
    try {
      if (!idUsuario) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/api/admin/eliminar-administrador/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // EDICIÓN DE ADMINISTRADORES
  // ================================
  
  // Editar datos de administrador - RUTA CORREGIDA
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

      const response = await apiClient.put(`/api/admin/editar-administrador/${idUsuario}`, {
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
  // ACCESO EXCLUSIVO SUPERADMIN
  // ================================
  
  // Acceso exclusivo para SUPERADMIN - RUTA CORREGIDA
  getSuperAdminPanel: async () => {
    try {
      const response = await apiClient.get('/api/admin/solo-superadmin');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES Y HELPERS
  // ================================
  
  // Formatear datos de administrador para mostrar
  formatAdminData: (admin) => {
    return {
      ...admin,
      nombreCompleto: `${admin.nomAdministrador || ''} ${admin.apeAdministrador || ''}`.trim(),
      rolFormateado: adminAPI.getRoleLabel(admin.rol),
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
  }
};

// Export compatible con import { adminService } y import adminAPI
export const adminService = adminAPI;
export default adminAPI;