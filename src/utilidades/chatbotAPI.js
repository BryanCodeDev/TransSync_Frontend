// src/utilidades/chatbotAPI.js - Servicio para el sistema de chatbot
import { apiClient, apiUtils } from '../api/baseAPI';
import conversationMemory from '../utilidades/conversationMemory';

const chatbotAPI = {
  // ================================
  // GESTIÓN DE INTERACCIONES
  // ================================

  /**
   * Enviar mensaje al chatbot
   * @param {string} mensaje - Mensaje del usuario
   * @param {number} idEmpresa - ID de la empresa
   * @param {number} idUsuario - ID del usuario (opcional)
   * @returns {Promise<Object>} Respuesta del chatbot
   */
  sendMessage: async (mensaje, idEmpresa, idUsuario = null) => {
    try {
      if (!mensaje || !idEmpresa) {
        throw new Error('Mensaje e ID de empresa son requeridos');
      }

      const response = await apiClient.post('/api/chatbot/consulta', {
        mensaje: mensaje.trim(),
        idEmpresa: parseInt(idEmpresa),
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
   * @param {number} filters.idEmpresa - ID de la empresa
   * @param {number} filters.idUsuario - ID del usuario (opcional)
   * @param {string} filters.intencion - Intención específica (opcional)
   * @param {boolean} filters.exitosa - Si la respuesta fue exitosa (opcional)
   * @param {number} filters.limit - Límite de resultados (opcional)
   * @returns {Promise<Object>} Historial de interacciones
   */
  getInteractionHistory: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/chatbot/interacciones${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener estadísticas de uso del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @param {string} period - Período (dia, semana, mes)
   * @returns {Promise<Object>} Estadísticas de uso
   */
  getChatbotStats: async (idEmpresa, period = 'semana') => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const response = await apiClient.get(`/api/chatbot/estadisticas?idEmpresa=${idEmpresa}&period=${period}`);
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
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Configuración del chatbot
   */
  getConfiguration: async (idEmpresa) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const response = await apiClient.get(`/api/chatbot/configuracion?idEmpresa=${idEmpresa}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar configuración del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateConfiguration: async (idEmpresa, configData) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const response = await apiClient.put(`/api/chatbot/configuracion?idEmpresa=${idEmpresa}`, configData);
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
   * @param {number} idEmpresa - ID de la empresa
   * @param {string} categoria - Categoría específica (opcional)
   * @returns {Promise<Object>} Lista de respuestas predefinidas
   */
  getPredefinedResponses: async (idEmpresa, categoria = null) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const params = categoria ? `?idEmpresa=${idEmpresa}&categoria=${categoria}` : `?idEmpresa=${idEmpresa}`;
      const response = await apiClient.get(`/api/chatbot/respuestas${params}`);
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
      const { idEmpresa, palabrasClave, categoria, respuesta } = responseData;

      const missing = apiUtils.validateRequired({
        idEmpresa,
        palabrasClave,
        categoria,
        respuesta
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post('/api/chatbot/respuestas', {
        idEmpresa: parseInt(idEmpresa),
        palabrasClave: palabrasClave.trim(),
        categoria,
        respuesta: respuesta.trim(),
        prioridad: responseData.prioridad || 1,
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

      const response = await apiClient.put(`/api/chatbot/respuestas/${idRespuesta}`, responseData);
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

      const response = await apiClient.delete(`/api/chatbot/respuestas/${idRespuesta}`);
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

  // ================================
  // FUNCIONES DE PROCESAMIENTO INTELIGENTE
  // ================================

  /**
   * Procesar consulta inteligente avanzada
   * @param {string} mensaje - Mensaje del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta procesada
   */
  procesarConsultaInteligente: async (mensaje, options = {}) => {
    try {
      if (!mensaje || mensaje.trim() === '') {
        throw new Error('El mensaje es requerido');
      }

      // Obtener contexto del usuario
      const contextoUsuario = options.contextoUsuario || this.obtenerContextoUsuario();

      // Procesar mensaje con el backend
      const response = await this.sendMessage(mensaje, contextoUsuario.idEmpresa, contextoUsuario.idUsuario);

      // Agregar metadata si se solicita
      if (options.incluirMetadata) {
        response.metadata = {
          tiempoProcesamiento: response.tiempoProcesamiento || 0,
          confianza: response.confianza || 0.5,
          entidadesEncontradas: response.entidades || [],
          complejidadConsulta: response.complejidad || 1
        };
      }

      return response;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener contexto del usuario actual
   * @returns {Object} Contexto del usuario
   */
  obtenerContextoUsuario: () => {
    try {
      // Obtener datos del localStorage
      const userData = localStorage.getItem('userData');
      const empresaData = localStorage.getItem('empresaData');

      if (userData && empresaData) {
        const user = JSON.parse(userData);
        const empresa = JSON.parse(empresaData);

        return {
          esUsuarioAutenticado: true,
          idUsuario: user.idUsuario || user.id,
          nombreUsuario: user.nombreUsuario || user.nombre || user.name,
          idEmpresa: empresa.idEmpresa || empresa.id,
          empresa: empresa.nombreEmpresa || empresa.nombre || empresa.name,
          rol: user.rol || user.role,
          permisos: user.permisos || user.permissions || []
        };
      }

      // Usuario no autenticado
      return {
        esUsuarioAutenticado: false,
        idUsuario: null,
        nombreUsuario: 'Usuario Anónimo',
        idEmpresa: 1,
        empresa: 'TransSync',
        rol: 'guest',
        permisos: []
      };
    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error);
      return {
        esUsuarioAutenticado: false,
        idUsuario: null,
        nombreUsuario: 'Usuario Anónimo',
        idEmpresa: 1,
        empresa: 'TransSync',
        rol: 'guest',
        permisos: []
      };
    }
  },

  /**
   * Obtener sugerencias inteligentes
   * @param {number} idUsuario - ID del usuario (opcional)
   * @param {number} idEmpresa - ID de la empresa (opcional)
   * @returns {Array} Array de sugerencias
   */
  obtenerSugerencias: (idUsuario = null, idEmpresa = 1) => {
    try {
      // Si no hay usuario específico, usar sugerencias generales
      if (!idUsuario) {
        return [
          { texto: '¿Cuántos conductores están activos?', icono: '👨‍💼', categoria: 'conductores' },
          { texto: '¿Qué vehículos están disponibles?', icono: '🚗', categoria: 'vehiculos' },
          { texto: '¿Cuál es el estado del sistema?', icono: '📊', categoria: 'sistema' },
          { texto: '¿Hay licencias próximas a vencer?', icono: '⚠️', categoria: 'vencimientos' }
        ];
      }

      // Obtener sugerencias basadas en el historial del usuario
      const sugerenciasInteligentes = conversationMemory.getSuggestions(idUsuario, idEmpresa);

      if (sugerenciasInteligentes && sugerenciasInteligentes.length > 0) {
        return sugerenciasInteligentes.map(s => ({
          texto: s.text,
          icono: s.icon || '💡',
          categoria: s.category || 'general'
        }));
      }

      // Fallback a sugerencias generales
      return [
        { texto: '¿Cuántos conductores están activos?', icono: '👨‍💼', categoria: 'conductores' },
        { texto: '¿Qué vehículos están disponibles?', icono: '🚗', categoria: 'vehiculos' },
        { texto: '¿Cuál es el estado del sistema?', icono: '📊', categoria: 'sistema' },
        { texto: '¿Hay licencias próximas a vencer?', icono: '⚠️', categoria: 'vencimientos' }
      ];
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [
        { texto: '¿Cuántos conductores están activos?', icono: '👨‍💼', categoria: 'conductores' },
        { texto: '¿Qué vehículos están disponibles?', icono: '🚗', categoria: 'vehiculos' },
        { texto: '¿Cuál es el estado del sistema?', icono: '📊', categoria: 'sistema' },
        { texto: '¿Hay licencias próximas a vencer?', icono: '⚠️', categoria: 'vencimientos' }
      ];
    }
  },

  /**
   * Validar mensaje antes de enviarlo
   * @param {string} mensaje - Mensaje a validar
   * @returns {Object} Resultado de validación
   */
  validarMensaje: (mensaje) => {
    try {
      if (!mensaje || typeof mensaje !== 'string') {
        return {
          esValido: false,
          error: 'El mensaje debe ser una cadena de texto válida'
        };
      }

      const mensajeLimpio = mensaje.trim();

      if (mensajeLimpio === '') {
        return {
          esValido: false,
          error: 'El mensaje no puede estar vacío'
        };
      }

      if (mensajeLimpio.length < 2) {
        return {
          esValido: false,
          error: 'El mensaje debe tener al menos 2 caracteres'
        };
      }

      if (mensajeLimpio.length > 1000) {
        return {
          esValido: false,
          error: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
        };
      }

      // Verificar contenido potencialmente peligroso
      const patronPeligroso = /<script|javascript:|vbscript:|onload=|onerror=/i;
      if (patronPeligroso.test(mensajeLimpio)) {
        return {
          esValido: false,
          error: 'El mensaje contiene contenido no permitido'
        };
      }

      return {
        esValido: true,
        mensajeLimpio: mensajeLimpio,
        longitud: mensajeLimpio.length
      };
    } catch (error) {
      return {
        esValido: false,
        error: 'Error interno al validar el mensaje'
      };
    }
  },

  /**
   * Formatear mensaje para mostrar en el chat
   * @param {string} mensaje - Mensaje a formatear
   * @returns {string} Mensaje formateado
   */
  formatearMensaje: (mensaje) => {
    try {
      if (!mensaje || typeof mensaje !== 'string') {
        return '';
      }

      let mensajeFormateado = mensaje;

      // Convertir saltos de línea a <br>
      mensajeFormateado = mensajeFormateado.replace(/\n/g, '<br>');

      // Formatear listas (líneas que empiezan con - o *)
      mensajeFormateado = mensajeFormateado.replace(/^(\s*)([-*])\s+/gm, '$1• ');

      // Formatear números de lista (1. 2. etc.)
      mensajeFormateado = mensajeFormateado.replace(/^(\s*)(\d+)\.\s+/gm, '$1<span style="font-weight: bold; color: #1a237e;">$2.</span> ');

      // Formatear encabezados (líneas que terminan con : y están solas)
      mensajeFormateado = mensajeFormateado.replace(/^([^<\n]+):\s*$/gm, '<strong style="color: #1a237e; display: block; margin: 8px 0 4px 0;">$1:</strong>');

      // Formatear texto en negrita (**texto**)
      mensajeFormateado = mensajeFormateado.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1a237e;">$1</strong>');

      // Formatear texto en cursiva (*texto*)
      mensajeFormateado = mensajeFormateado.replace(/\*(.*?)\*/g, '<em style="opacity: 0.8;">$1</em>');

      // Formatear código (`código`)
      mensajeFormateado = mensajeFormateado.replace(/`([^`]+)`/g, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');

      // Formatear enlaces
      mensajeFormateado = mensajeFormateado.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" style="color: #1a237e; text-decoration: underline;">$1</a>'
      );

      return mensajeFormateado;
    } catch (error) {
      console.error('Error formateando mensaje:', error);
      return mensaje;
    }
  },

  /**
   * Verificar estado del servicio de chatbot
   * @returns {Promise<Object>} Estado del servicio
   */
  verificarEstado: async () => {
    try {
      // Intentar hacer una consulta simple para verificar conectividad
      const response = await apiClient.get('/api/chatbot/health');
      return response.data;
    } catch (error) {
      // Si falla, intentar con una consulta básica
      try {
        await apiClient.get('/api/chatbot/estadisticas?idEmpresa=1&period=dia');
        return {
          success: true,
          message: 'Servicio disponible',
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        return {
          success: false,
          message: 'Servicio no disponible',
          error: apiUtils.formatError(error),
          timestamp: new Date().toISOString()
        };
      }
    }
  }
};

export default chatbotAPI;