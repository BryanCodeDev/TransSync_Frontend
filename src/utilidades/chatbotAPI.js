// src/utilidades/chatbotAPI.js - Servicio para el sistema de chatbot
import { apiClient, apiUtils } from '../api/baseAPI';
import conversationMemory from './conversationMemory';

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
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  getInteractionHistory: async (filters = {}) => {
    try {
      // TODO: Implementar endpoint /api/chatbot/interactions en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar /api/chatbot/interactions');

      // const params = apiUtils.createUrlParams(filters);
      // const response = await apiClient.get(`/api/chatbot/interactions${params ? `?${params}` : ''}`);
      // return response.data;
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
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  getConfiguration: async (idEmpresa) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      // TODO: Implementar endpoint /api/chatbot/config en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar GET /api/chatbot/config');

      // const response = await apiClient.get(`/api/chatbot/config?idEmpresa=${idEmpresa}`);
      // return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar configuración del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Respuesta del servidor
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  updateConfiguration: async (idEmpresa, configData) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      // TODO: Implementar endpoint /api/chatbot/config en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar PUT /api/chatbot/config');

      // const response = await apiClient.put(`/api/chatbot/config?idEmpresa=${idEmpresa}`, configData);
      // return response.data;
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
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  getPredefinedResponses: async (idEmpresa, categoria = null) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      // TODO: Implementar endpoint /api/chatbot/responses en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar GET /api/chatbot/responses');

      // const params = categoria ? `?idEmpresa=${idEmpresa}&categoria=${categoria}` : `?idEmpresa=${idEmpresa}`;
      // const response = await apiClient.get(`/api/chatbot/responses${params}`);
      // return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Crear nueva respuesta predefinida
   * @param {Object} responseData - Datos de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   * @deprecated Este endpoint no está implementado en el backend actual
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

      // TODO: Implementar endpoint /api/chatbot/responses en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar POST /api/chatbot/responses');

      // const response = await apiClient.post('/api/chatbot/responses', {
      //   idEmpresa: parseInt(idEmpresa),
      //   palabrasClave: palabrasClave.trim(),
      //   categoria,
      //   respuesta: respuesta.trim(),
      //   prioridad: prioridad || 1,
      //   activa: true
      // });

      // return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @param {Object} responseData - Datos a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  updatePredefinedResponse: async (idRespuesta, responseData) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      // TODO: Implementar endpoint /api/chatbot/responses en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar PUT /api/chatbot/responses/:id');

      // const response = await apiClient.put(`/api/chatbot/responses/${idRespuesta}`, responseData);
      // return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Eliminar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   * @deprecated Este endpoint no está implementado en el backend actual
   */
  deletePredefinedResponse: async (idRespuesta) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      // TODO: Implementar endpoint /api/chatbot/responses en el backend
      throw new Error('Endpoint no implementado en el backend. Se requiere implementar DELETE /api/chatbot/responses/:id');

      // const response = await apiClient.delete(`/api/chatbot/responses/${idRespuesta}`);
      // return response.data;
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

      // Obtener contexto del usuario con validación
      let contextoUsuario = options.contextoUsuario;
      if (!contextoUsuario) {
        contextoUsuario = this.obtenerContextoUsuario();
      }

      // Validar que el contexto tenga valores seguros
      if (!contextoUsuario || !contextoUsuario.idUsuario || !contextoUsuario.idEmpresa) {
        console.warn('⚠️ Contexto de usuario inválido, usando contexto seguro');
        contextoUsuario = {
          esUsuarioAutenticado: false,
          idUsuario: 1,
          nombreUsuario: 'Usuario',
          idEmpresa: 1,
          empresa: 'TransSync',
          rol: 'guest',
          permisos: []
        };
      }

      // Verificar estado del servicio primero
      let estadoServicio;
      try {
        estadoServicio = await this.verificarEstado();
      } catch (estadoError) {
        console.warn('⚠️ Error verificando estado del servicio:', estadoError);
        estadoServicio = { mode: 'offline' };
      }

      // Si estamos en modo offline, proporcionar respuestas básicas
      if (estadoServicio.mode === 'offline') {
        return this.generarRespuestaOffline(mensaje, contextoUsuario);
      }

      // Procesar mensaje con el backend con manejo de errores mejorado
      let response;
      try {
        response = await this.sendMessage(mensaje, contextoUsuario.idEmpresa, contextoUsuario.idUsuario);
      } catch (sendError) {
        console.warn('❌ Error enviando mensaje, usando modo offline:', sendError.message);
        return this.generarRespuestaOffline(mensaje, contextoUsuario);
      }

      // Validar respuesta del backend
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

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
      // Si hay error de conexión, intentar modo offline
      console.warn('❌ Error procesando consulta, intentando modo offline:', error.message);

      try {
        const contextoUsuario = options.contextoUsuario || this.obtenerContextoUsuario();
        return this.generarRespuestaOffline(mensaje, contextoUsuario);
      } catch (fallbackError) {
        console.error('❌ Error incluso en modo offline:', fallbackError);
        // Respuesta de emergencia
        return {
          respuesta: 'Lo siento, estoy teniendo problemas técnicos en este momento. Por favor intenta de nuevo más tarde.',
          intencion: 'error',
          confianza: 0,
          tiempoProcesamiento: 0,
          success: false,
          mode: 'error',
          timestamp: new Date().toISOString()
        };
      }
    }
  },

  /**
   * Generar respuesta básica en modo offline
   * @param {string} mensaje - Mensaje del usuario
   * @param {Object} contextoUsuario - Contexto del usuario
   * @returns {Object} Respuesta offline
   */
  generarRespuestaOffline: (mensaje, contextoUsuario) => {
    const mensajeLower = mensaje.toLowerCase();

    let respuesta = '';
    let intencion = 'unknown';

    // Respuestas básicas por palabras clave
    if (mensajeLower.includes('hola') || mensajeLower.includes('buenos') || mensajeLower.includes('saludos')) {
      respuesta = `¡Hola${contextoUsuario.esUsuarioAutenticado ? ` ${contextoUsuario.nombreUsuario}` : ''}! Soy el asistente de TransSync. Actualmente estoy funcionando en modo básico porque el servidor no está disponible. Puedes preguntarme sobre funcionalidades generales del sistema.`;
      intencion = 'greeting';
    } else if (mensajeLower.includes('ayuda') || mensajeLower.includes('que puedes hacer')) {
      respuesta = '🤖 **Modo Básico - Funcionalidades Disponibles:**\n\n• Información general sobre conductores\n• Consulta de vehículos disponibles\n• Estados del sistema\n• Rutas y horarios\n• Vencimientos y alertas\n\nPara información en tiempo real, el servidor principal debe estar conectado.';
      intencion = 'help';
    } else if (mensajeLower.includes('conductor') || mensajeLower.includes('chofer')) {
      respuesta = '👨‍💼 **Conductores:** Actualmente no puedo acceder a datos específicos de conductores porque el servidor no está disponible. En condiciones normales puedo proporcionarte información sobre conductores activos, licencias próximas a vencer, y asignaciones.';
      intencion = 'count_driver';
    } else if (mensajeLower.includes('vehiculo') || mensajeLower.includes('bus') || mensajeLower.includes('auto')) {
      respuesta = '🚗 **Vehículos:** No puedo consultar información específica de vehículos en este momento. Normalmente puedo mostrarte vehículos disponibles, en mantenimiento, y próximos vencimientos de documentos.';
      intencion = 'list_vehicle';
    } else if (mensajeLower.includes('estado') || mensajeLower.includes('situacion')) {
      respuesta = '📊 **Estado del Sistema:** Actualmente estoy funcionando en modo básico. El servidor principal no está disponible, pero puedo proporcionarte información general sobre las funcionalidades del sistema TransSync.';
      intencion = 'system_status';
    } else if (mensajeLower.includes('gracias') || mensajeLower.includes('thank')) {
      respuesta = '¡De nada! 😊 Estoy aquí para ayudarte. Cuando el servidor principal esté disponible, podré proporcionarte información más detallada y en tiempo real.';
      intencion = 'farewell';
    } else {
      respuesta = `🤔 **Consulta recibida:** "${mensaje}"\n\nActualmente estoy funcionando en modo básico porque el servidor no está disponible. Esta consulta requiere acceso a la base de datos para proporcionarte una respuesta precisa.\n\n**¿Te puedo ayudar con algo más básico como:**\n• Información general del sistema\n• Funcionalidades disponibles\n• Guía de uso del asistente`;
      intencion = 'unknown';
    }

    return {
      respuesta: respuesta,
      intencion: intencion,
      confianza: 0.8,
      tiempoProcesamiento: 50,
      success: true,
      mode: 'offline',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Obtener contexto del usuario actual
   * @returns {Object} Contexto del usuario
   */
  obtenerContextoUsuario: () => {
    try {
      // Obtener token para verificar autenticación
      const token = localStorage.getItem('authToken') || localStorage.getItem('userToken') || localStorage.getItem('token');

      if (!token) {
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
      }

      // Obtener datos del usuario desde diferentes posibles fuentes
      const userData = localStorage.getItem('userData');
      const empresaData = localStorage.getItem('empresaData');

      let user = null;
      let empresa = null;

      // Parsear datos si existen
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (e) {
          console.warn('Error parseando userData del localStorage');
        }
      }

      if (empresaData) {
        try {
          empresa = JSON.parse(empresaData);
        } catch (e) {
          console.warn('Error parseando empresaData del localStorage');
        }
      }

      // Si no hay datos estructurados, intentar obtener del objeto user del contexto de auth
      if (!user) {
        // Intentar obtener datos básicos del localStorage
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole') || localStorage.getItem('userRol');

        if (userId) {
          user = {
            id: userId,
            idUsuario: userId,
            rol: userRole,
            role: userRole
          };
        }
      }

      // Construir contexto del usuario
      const contextoUsuario = {
        esUsuarioAutenticado: true,
        idUsuario: user?.idUsuario || user?.id || null,
        nombreUsuario: user?.nombreUsuario || user?.nombre || user?.name || 'Usuario',
        idEmpresa: empresa?.idEmpresa || empresa?.id || 'default-company',
        empresa: empresa?.nombreEmpresa || empresa?.nombre || empresa?.name || 'TransSync',
        rol: user?.rol || user?.role || 'USER',
        permisos: user?.permisos || user?.permissions || []
      };

      // Log para debugging
      console.log('🤖 Contexto de usuario obtenido:', contextoUsuario);

      return contextoUsuario;
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
      // Si falla el endpoint de health, intentar con una consulta básica
      try {
        await apiClient.get('/api/chatbot/estadisticas?idEmpresa=1&period=dia');
        return {
          success: true,
          message: 'Servicio disponible',
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        // Si ambos endpoints fallan, asumir que el servicio no está disponible
        // pero no lanzar error para evitar excepciones no manejadas
        console.warn('⚠️ Servicio de chatbot no disponible:', apiUtils.formatError(fallbackError));

        // En lugar de devolver un estado de error, devolver un estado de "modo offline"
        // para que el chatbot pueda seguir funcionando con respuestas básicas
        return {
          success: true,
          message: 'Modo offline - respuestas básicas disponibles',
          mode: 'offline',
          timestamp: new Date().toISOString()
        };
      }
    }
  }
};

export default chatbotAPI;