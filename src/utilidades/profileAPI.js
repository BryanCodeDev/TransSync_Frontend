// src/utilidades/profileAPI.js - APIs específicas para gestión de perfil de usuario
import { apiClient, apiUtils } from '../api/baseAPI';

/**
 * API para gestión de perfil de usuario
 * Funcionalidades específicas para la gestión de datos personales
 */
const profileAPI = {
  // ================================
  // GESTIÓN DE PERFIL BÁSICO
  // ================================

  /**
   * Obtener datos completos del perfil del usuario
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al obtener perfil');
      }

      // El backend devuelve los datos en response.data.data
      const profileData = response.data.data || response.data;

      return {
        success: true,
        profile: profileData,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        profile: null,
        error: {
          code: error.code || 'GET_PROFILE_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  /**
   * Actualizar información básica del perfil
   * @param {Object} profileData - Datos a actualizar
   * @param {string} profileData.nomUsuario - Nombres del usuario
   * @param {string} profileData.apeUsuario - Apellidos del usuario
   * @param {string} profileData.email - Correo electrónico
   * @param {string} profileData.telUsuario - Teléfono del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateUserProfile: async (profileData) => {
    try {
      // Validaciones mejoradas según especificaciones del backend
      if (!profileData.nomUsuario || !profileData.apeUsuario) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Nombres y apellidos son requeridos',
            details: 'Los campos nomUsuario y apeUsuario son obligatorios'
          }
        };
      }

      // Validar nombres: solo letras y espacios, 2-80 caracteres
      if (profileData.nomUsuario && (profileData.nomUsuario.length < 2 || profileData.nomUsuario.length > 80)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_NAME_LENGTH',
            message: 'El nombre debe tener entre 2 y 80 caracteres',
            details: 'Longitud del nombre fuera del rango permitido'
          }
        };
      }

      if (profileData.nomUsuario && !/^[a-zA-ZÀ-ÿ\s]+$/.test(profileData.nomUsuario)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_NAME_FORMAT',
            message: 'El nombre solo puede contener letras y espacios',
            details: 'Formato de nombre no válido'
          }
        };
      }

      if (profileData.apeUsuario && (profileData.apeUsuario.length < 2 || profileData.apeUsuario.length > 80)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_LASTNAME_LENGTH',
            message: 'Los apellidos deben tener entre 2 y 80 caracteres',
            details: 'Longitud de apellidos fuera del rango permitido'
          }
        };
      }

      if (profileData.apeUsuario && !/^[a-zA-ZÀ-ÿ\s]+$/.test(profileData.apeUsuario)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_LASTNAME_FORMAT',
            message: 'Los apellidos solo pueden contener letras y espacios',
            details: 'Formato de apellidos no válido'
          }
        };
      }

      if (profileData.email && profileData.email.length > 80) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_EMAIL_LENGTH',
            message: 'El email no puede tener más de 80 caracteres',
            details: 'Longitud del email excede el límite'
          }
        };
      }

      if (profileData.email && !apiUtils.isValidEmail(profileData.email)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_EMAIL_FORMAT',
            message: 'Formato de email inválido',
            details: 'El email debe tener un formato válido'
          }
        };
      }

      if (profileData.telUsuario && (profileData.telUsuario.length < 7 || profileData.telUsuario.length > 16)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_PHONE_LENGTH',
            message: 'El teléfono debe tener entre 7 y 16 dígitos',
            details: 'Longitud del teléfono fuera del rango permitido'
          }
        };
      }

      if (profileData.telUsuario && !/^[\d\s\-+()]+$/.test(profileData.telUsuario)) {
        return {
          success: false,
          profile: null,
          error: {
            code: 'INVALID_PHONE_FORMAT',
            message: 'El teléfono solo puede contener números, espacios, guiones, paréntesis y +',
            details: 'Formato de teléfono no válido'
          }
        };
      }

      const response = await apiClient.put('/api/user/profile', {
        nomUsuario: profileData.nomUsuario.trim(),
        apeUsuario: profileData.apeUsuario.trim(),
        email: profileData.email?.trim().toLowerCase(),
        telUsuario: profileData.telUsuario?.trim()
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al actualizar perfil');
      }

      return {
        success: true,
        profile: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        profile: null,
        error: {
          code: error.code || 'UPDATE_PROFILE_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  /**
   * Cambiar contraseña del usuario
   * @param {Object} passwordData - Datos de la contraseña
   * @param {string} passwordData.currentPassword - Contraseña actual
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @param {string} passwordData.confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  changeUserPassword: async (passwordData) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Todos los campos de contraseña son requeridos',
            details: 'Se deben proporcionar la contraseña actual, nueva y confirmación'
          }
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: {
            code: 'PASSWORDS_NOT_MATCH',
            message: 'Las contraseñas no coinciden',
            details: 'La nueva contraseña y su confirmación deben ser idénticas'
          }
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: {
            code: 'PASSWORD_TOO_SHORT',
            message: 'La nueva contraseña debe tener al menos 6 caracteres',
            details: 'Longitud mínima requerida: 6 caracteres'
          }
        };
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          error: {
            code: 'SAME_PASSWORD',
            message: 'La nueva contraseña debe ser diferente a la actual',
            details: 'Debe elegir una contraseña diferente a la actual'
          }
        };
      }

      const response = await apiClient.put('/api/user/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'Error al cambiar contraseña');
      }

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'CHANGE_PASSWORD_ERROR',
          message: apiUtils.formatError(error),
          details: error.message
        }
      };
    }
  },

  // ================================
  // GESTIÓN DE PREFERENCIAS
  // ================================

  /**
   * Obtener preferencias del usuario
   * @returns {Promise<Object>} Preferencias del usuario
   */
  getUserPreferences: async () => {
    try {
      const response = await apiClient.get('/api/user/preferences');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar preferencias del usuario
   * @param {Object} preferences - Preferencias a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateUserPreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/api/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE NOTIFICACIONES
  // ================================

  /**
   * Obtener configuración de notificaciones
   * @returns {Promise<Object>} Configuración de notificaciones
   */
  getNotificationSettings: async () => {
    try {
      const response = await apiClient.get('/api/user/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar configuración de notificaciones
   * @param {Object} settings - Configuración de notificaciones
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateNotificationSettings: async (settings) => {
    try {
      const response = await apiClient.put('/api/user/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE EMPRESA
  // ================================

  /**
   * Obtener información de la empresa del usuario
   * @returns {Promise<Object>} Información de la empresa
   */
  getUserCompany: async () => {
    try {
      const response = await apiClient.get('/api/user/company');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar información de la empresa (solo para gestores)
   * @param {Object} companyData - Datos de la empresa
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateCompanyInfo: async (companyData) => {
    try {
      const response = await apiClient.put('/api/user/company', companyData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ESTADÍSTICAS Y ACTIVIDAD
  // ================================

  /**
   * Obtener estadísticas de actividad del usuario
   * @returns {Promise<Object>} Estadísticas de actividad
   */
  getUserActivity: async () => {
    try {
      const response = await apiClient.get('/api/user/activity');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener historial de sesiones del usuario
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Historial de sesiones
   */
  getUserSessions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiClient.get(`/api/user/sessions?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Cerrar todas las sesiones activas (excepto la actual)
   * @returns {Promise<Object>} Respuesta del servidor
   */
  logoutAllSessions: async () => {
    try {
      const response = await apiClient.post('/api/user/sessions/logout-all');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // VERIFICACIÓN Y SEGURIDAD
  // ================================

  /**
   * Verificar estado de la cuenta
   * @returns {Promise<Object>} Estado de la cuenta
   */
  verifyAccountStatus: async () => {
    try {
      const response = await apiClient.get('/api/user/account-status');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Solicitar verificación de email
   * @param {string} email - Email a verificar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  requestEmailVerification: async (email) => {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await apiClient.post('/api/user/request-verification', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Verificar email con token
   * @param {string} token - Token de verificación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  verifyEmail: async (token) => {
    try {
      if (!token) {
        throw new Error('Token de verificación requerido');
      }

      const response = await apiClient.post('/api/user/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // EXPORTAR DATOS
  // ================================

  /**
   * Exportar datos del usuario
   * @param {string} format - Formato de exportación (json, csv, pdf)
   * @returns {Promise<Object>} Datos exportados
   */
  exportUserData: async (format = 'json') => {
    try {
      const response = await apiClient.get(`/api/user/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Solicitar eliminación de cuenta
   * @param {string} reason - Razón de la eliminación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  requestAccountDeletion: async (reason = '') => {
    try {
      const response = await apiClient.post('/api/user/request-deletion', {
        reason: reason.trim()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Exportaciones
export default profileAPI;
export const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPreferences,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getUserCompany,
  updateCompanyInfo,
  getUserActivity,
  getUserSessions,
  logoutAllSessions,
  verifyAccountStatus,
  requestEmailVerification,
  verifyEmail,
  exportUserData,
  requestAccountDeletion
} = profileAPI;