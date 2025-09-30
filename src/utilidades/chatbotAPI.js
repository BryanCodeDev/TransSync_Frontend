import { apiClient, apiUtils } from '../api/baseAPI';

const chatbotAPI = {
  // ================================
  // GESTIÓN DE INTERACCIONES
  // ================================

  /**
    * Enviar mensaje al chatbot
    * @param {string} mensaje - Mensaje del usuario
    * @param {number} idUsuario - ID del usuario (opcional)
    * @returns {Promise<Object>} Respuesta del chatbot
    */
   sendMessage: async (mensaje, idUsuario = null) => {
     try {
       if (!mensaje) {
         throw new Error('Mensaje es requerido');
       }

       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       const response = await apiClient.post('/api/chatbot/consulta', {
         mensaje: mensaje.trim(),
         idEmpresa: empresaId, // ✅ CORRECCIÓN CRÍTICA: empresaId del contexto
         idUsuario: idUsuario ? parseInt(idUsuario) : null
       });

       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

  /**
    * Obtener historial de interacciones
    * @param {Object} filters - Filtros para la consulta
    * @param {number} filters.idUsuario - ID del usuario (opcional)
    * @param {string} filters.intencion - Intención específica (opcional)
    * @param {boolean} filters.exitosa - Si la respuesta fue exitosa (opcional)
    * @param {number} filters.limit - Límite de resultados (opcional)
    * @returns {Promise<Object>} Historial de interacciones
    */
   getInteractionHistory: async (filters = {}) => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId automáticamente en filtros
       const filtrosConEmpresa = {
         ...filters,
         idEmpresa: empresaId  // ✅ Filtro de seguridad por empresa
       };

       const params = apiUtils.createUrlParams(filtrosConEmpresa);
       const response = await apiClient.get(`/api/chatbot/interactions${params ? `?${params}` : ''}`);
       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

  /**
    * Obtener estadísticas de uso del chatbot
    * @param {string} period - Período (dia, semana, mes)
    * @returns {Promise<Object>} Estadísticas de uso
    */
   getChatbotStats: async (period = 'semana') => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en estadísticas
       const response = await apiClient.get(`/api/chatbot/estadisticas?idEmpresa=${empresaId}&period=${period}`);
       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

   // ================================
   // GESTIÓN DE CONFIGURACIÓN
   // ================================

   /**
    * Obtener configuración del chatbot
    * @returns {Promise<Object>} Configuración del chatbot
    */
   getConfiguration: async () => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en configuración
       const response = await apiClient.get(`/api/chatbot/config?idEmpresa=${empresaId}`);
       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

   /**
    * Actualizar configuración del chatbot
    * @param {Object} configData - Datos de configuración
    * @returns {Promise<Object>} Respuesta del servidor
    */
   updateConfiguration: async (configData) => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en actualización de configuración
       const response = await apiClient.put(`/api/chatbot/config?idEmpresa=${empresaId}`, configData);
       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

   // ================================
   // GESTIÓN DE RESPUESTAS PREDEFINIDAS
   // ================================

   /**
    * Obtener respuestas predefinidas
    * @param {string} categoria - Categoría específica (opcional)
    * @returns {Promise<Object>} Lista de respuestas predefinidas
    */
   getPredefinedResponses: async (categoria = null) => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       // ✅ CORRECCIÓN CRÍTICA: Incluir empresaId en consulta de respuestas
       const params = categoria ? `?idEmpresa=${empresaId}&categoria=${categoria}` : `?idEmpresa=${empresaId}`;
       const response = await apiClient.get(`/api/chatbot/responses${params}`);
       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

   /**
    * Crear nueva respuesta predefinida
    * @param {Object} responseData - Datos de la respuesta
    * @returns {Promise<Object>} Respuesta del servidor
    */
   createPredefinedResponse: async (responseData) => {
     try {
       // ✅ CORRECCIÓN CRÍTICA: Obtener empresaId del contexto de usuario
       const userContext = JSON.parse(localStorage.getItem('userContext') || '{}');
       const empresaId = userContext.empresaId || userContext.idEmpresa;

       if (!empresaId) {
         throw new Error('empresaId no encontrado en el contexto del usuario');
       }

       const { idEmpresa, palabrasClave, categoria, respuesta, prioridad } = responseData;

       const missing = apiUtils.validateRequired({
         palabrasClave,
         categoria,
         respuesta
       });

       if (missing.length > 0) {
         throw new Error(`Campos requeridos: ${missing.join(', ')}`);
       }

       // ✅ CORRECCIÓN CRÍTICA: Validar que el idEmpresa del formulario coincida con el contexto
       if (idEmpresa && idEmpresa !== empresaId) {
         throw new Error('No tienes permisos para crear respuestas en esta empresa');
       }

       const response = await apiClient.post('/api/chatbot/responses', {
         idEmpresa: empresaId, // ✅ CORRECCIÓN CRÍTICA: Usar empresaId del contexto
         palabrasClave: palabrasClave.trim(),
         categoria,
         respuesta: respuesta.trim(),
         prioridad: prioridad || 1,
         activa: true
       });

       return response.data;
     } catch (error) {
       throw new Error(apiUtils.formatError(error));
     }
   },

  /**
   * Actualizar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @param {Object} responseData - Datos a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updatePredefinedResponse: async (idRespuesta, responseData) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      const response = await apiClient.put(`/api/chatbot/responses/${idRespuesta}`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Eliminar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  deletePredefinedResponse: async (idRespuesta) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      const response = await apiClient.delete(`/api/chatbot/responses/${idRespuesta}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES
  // ================================

  /**
   * Categorías disponibles para respuestas predefinidas
   */
  getAvailableCategories: () => {
    return [
      'saludo',
      'conductores',
      'vehiculos',
      'rutas',
      'horarios',
      'reportes',
      'ayuda',
      'despedida',
      'personalizada'
    ];
  },

  /**
   * Obtener etiqueta de categoría
   * @param {string} categoria - Categoría
   * @returns {string} Etiqueta legible
   */
  getCategoryLabel: (categoria) => {
    const labels = {
      'saludo': 'Saludo',
      'conductores': 'Conductores',
      'vehiculos': 'Vehículos',
      'rutas': 'Rutas',
      'horarios': 'Horarios',
      'reportes': 'Reportes',
      'ayuda': 'Ayuda',
      'despedida': 'Despedida',
      'personalizada': 'Personalizada'
    };
    return labels[categoria] || categoria;
  },

  /**
   * Validar datos de respuesta predefinida
   * @param {Object} responseData - Datos a validar
   * @returns {Array} Array de errores
   */
  validateResponseData: (responseData) => {
    const errors = [];

    if (!responseData.palabrasClave || responseData.palabrasClave.trim().length < 2) {
      errors.push('Las palabras clave deben tener al menos 2 caracteres');
    }

    if (!responseData.respuesta || responseData.respuesta.trim().length < 5) {
      errors.push('La respuesta debe tener al menos 5 caracteres');
    }

    const validCategories = chatbotAPI.getAvailableCategories();
    if (!validCategories.includes(responseData.categoria)) {
      errors.push('Categoría inválida');
    }

    return errors;
  },

  /**
   * Obtener sugerencias para el chatbot
   * @param {number} idEmpresa - ID de la empresa (opcional)
   * @returns {Array} Array de sugerencias
   */
  obtenerSugerencias: (idEmpresa = null) => {
    return [
      {
        id: 1,
        texto: '¿Cómo puedo ver mis rutas?',
        categoria: 'rutas',
        icono: 'map-marked-alt'
      },
      {
        id: 2,
        texto: 'Ver conductores disponibles',
        categoria: 'conductores',
        icono: 'users'
      },
      {
        id: 3,
        texto: 'Consultar vehículos',
        categoria: 'vehiculos',
        icono: 'car'
      },
      {
        id: 4,
        texto: 'Ver horarios de transporte',
        categoria: 'horarios',
        icono: 'clock'
      },
      {
        id: 5,
        texto: 'Generar informes',
        categoria: 'reportes',
        icono: 'chart-bar'
      },
      {
        id: 6,
        texto: 'Ayuda general',
        categoria: 'ayuda',
        icono: 'question-circle'
      }
    ];
  },

  /**
   * Obtener contexto del usuario actual
   * @returns {Object} Contexto del usuario
   */
  obtenerContextoUsuario: () => {
    try {
      // Obtener datos del localStorage
      const userData = localStorage.getItem('userData');
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');
      const empresaId = localStorage.getItem('empresaId');
      const empresaNombre = localStorage.getItem('empresaNombre');

      // Verificar si el usuario está autenticado
      const esUsuarioAutenticado = !!(userData && userId && userEmail);

      if (esUsuarioAutenticado) {
        const userDataParsed = JSON.parse(userData);
        return {
          esUsuarioAutenticado: true,
          idUsuario: userId,
          nombreUsuario: userName || userDataParsed.name || 'Usuario',
          email: userEmail,
          rol: userRole,
          idEmpresa: empresaId,
          empresa: empresaNombre || 'Empresa',
          datosCompletos: userDataParsed
        };
      } else {
        return {
          esUsuarioAutenticado: false,
          idUsuario: null,
          nombreUsuario: 'Invitado',
          email: null,
          rol: null,
          idEmpresa: null,
          empresa: 'TransSync',
          datosCompletos: null
        };
      }
    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error);
      return {
        esUsuarioAutenticado: false,
        idUsuario: null,
        nombreUsuario: 'Invitado',
        email: null,
        rol: null,
        idEmpresa: null,
        empresa: 'TransSync',
        datosCompletos: null
      };
    }
  }
};

export default chatbotAPI;