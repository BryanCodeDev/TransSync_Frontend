import { io } from 'socket.io-client';

class RealTimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // Aumentado
    this.reconnectDelay = 5000; // 5 segundos inicial
    this.maxReconnectDelay = 300000; // 5 minutos máximo
    this.userContext = null;

    // Control de frecuencia de actualizaciones
    this.updateInterval = 60 * 60 * 1000; // 1 hora por defecto
    this.lastUpdateTime = 0;
    this.updateTimer = null;
    this.isRealTimeMode = false; // Por defecto modo horario

    // Throttling para eventos
    this.eventThrottleTimers = new Map();
    this.eventThrottleDelay = 5000; // 5 segundos entre eventos del mismo tipo
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(userContext = null) {
    if (this.socket?.connected) {
      return;
    }

    this.userContext = userContext;

    try {
      // Verificar que tenemos token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ No hay token de autenticación disponible para WebSocket');
        this.emit('connection:error', {
          error: 'No authentication token available',
          timestamp: new Date()
        });
        return;
      }

      // Verificar que tenemos datos de usuario válidos
      if (!userContext || !userContext.idUsuario) {
        console.warn('⚠️ Datos de usuario incompletos para WebSocket');
        this.emit('connection:error', {
          error: 'Incomplete user context',
          timestamp: new Date()
        });
        return;
      }

      // ✅ CORRECCIÓN CRÍTICA: empresaId es obligatorio según correcciones de seguridad
      if (!userContext.empresaId && !userContext.idEmpresa) {
        console.error('❌ empresaId es requerido para la conexión WebSocket');
        this.emit('connection:error', {
          error: 'empresaId is required for WebSocket connection',
          timestamp: new Date()
        });
        return;
      }

      console.log('🔗 Conectando WebSocket con contexto:', {
        userId: userContext.idUsuario,
        empresaId: userContext.idEmpresa,
        rol: userContext.rol
      });

      // Conectar al servidor WebSocket con configuración mejorada
      const wsUrl = process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app';

      console.log('🔗 Intentando conectar a WebSocket:', wsUrl);
      console.log('🔑 Datos de autenticación:', {
        userId: userContext.idUsuario,
        empresaId: userContext.idEmpresa,
        rol: userContext.rol
      });

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false, // No forzar nueva conexión, reutilizar si es posible
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        randomizationFactor: 0.5, // Factor de aleatorización para evitar thundering herd
        auth: {
          token: token,
          userId: userContext.idUsuario,
          empresaId: userContext.idEmpresa,
          rol: userContext.rol || 'USER'
        },
        // Configuración adicional para mejorar estabilidad
        upgrade: true,
        rememberUpgrade: true, // Recordar el upgrade para mejorar rendimiento
        rejectUnauthorized: false,
        // Configuración adicional para prevenir desconexiones
        pingTimeout: 60000, // 60 segundos antes de considerar timeout
        pingInterval: 25000 // Ping cada 25 segundos para mantener conexión
      });

      this.setupEventListeners();
      this.setupReconnection();

      // Iniciar en modo horario por defecto (no tiempo real)
      this.setUpdateMode(false, 60); // 60 minutos = 1 hora

    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Configurar delay de throttling para eventos
   */
  setThrottleDelay(delayMs = 5000) {
    this.eventThrottleDelay = delayMs;
  }

  /**
   * Configurar listeners de eventos
   */
  setupEventListeners() {
    // Evento de conexión exitosa
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado exitosamente');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Unirse a salas específicas
      if (this.userContext) {
        this.joinRooms();
      }

      // Notificar conexión exitosa
      this.emit('connection:established', {
        userId: this.userContext?.idUsuario,
        empresaId: this.userContext?.idEmpresa,
        timestamp: new Date(),
        socketId: this.socket.id
      });

      // Emitir evento de dashboard conectado (compatibilidad con socketService)
      this.emit('dashboard:connected', {
        timestamp: new Date().toISOString(),
        userId: this.userContext?.idUsuario || null,
        empresaId: this.userContext?.idEmpresa || null,
        socketId: this.socket.id
      });
    });

    // Eventos de autenticación
    this.socket.on('auth:success', (data) => {
      this.emit('auth:success', data);
    });

    this.socket.on('auth:error', (error) => {
      this.emit('auth:error', error);
    });

    // Evento de desconexión
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión
        this.reconnect();
      }
    });

    // Evento de error de conexión
    this.socket.on('connect_error', (error) => {
      this.handleConnectionError(error);
    });

    // Eventos de datos en tiempo real
    this.setupDataEventListeners();

    // Eventos del dashboard
    this.setupDashboardListeners();
  }

  /**
   * Configurar listeners para eventos de datos
   */
  setupDataEventListeners() {
    // Nuevos conductores
    this.socket.on('conductor:created', (data) => {
      this.handleNewConductor(data);
    });

    // Actualizaciones de conductores
    this.socket.on('conductor:updated', (data) => {
      this.handleConductorUpdate(data);
    });

    // Nuevos vehículos
    this.socket.on('vehiculo:created', (data) => {
      this.handleNewVehicle(data);
    });

    // Actualizaciones de vehículos
    this.socket.on('vehiculo:updated', (data) => {
      this.handleVehicleUpdate(data);
    });

    // Nuevas rutas
    this.socket.on('ruta:created', (data) => {
      this.handleNewRoute(data);
    });

    // Nuevos viajes
    this.socket.on('viaje:created', (data) => {
      this.handleNewTrip(data);
    });

    // Actualizaciones de viajes
    this.socket.on('viaje:updated', (data) => {
      this.handleTripUpdate(data);
    });

    // Alertas de vencimientos
    this.socket.on('vencimiento:alert', (data) => {
      this.handleExpirationAlert(data);
    });

    // Cambios en el sistema
    this.socket.on('system:status_changed', (data) => {
      this.handleSystemStatusChange(data);
    });

    // Notificaciones del chatbot
    this.socket.on('chatbot:notification', (data) => {
      this.handleChatbotNotification(data);
    });
  }

  /**
   * Configurar listeners para eventos del dashboard
   */
  setupDashboardListeners() {
    if (!this.socket) return;

    // Estadísticas actualizadas
    this.socket.on('dashboard:stats:update', (data) => {
      this.emit('dashboard:stats:update', data);
    });

    // Datos en tiempo real actualizados
    this.socket.on('dashboard:realtime:update', (data) => {
      this.emit('dashboard:realtime:update', data);
    });

    // Alertas actualizadas
    this.socket.on('dashboard:alerts:update', (data) => {
      this.emit('dashboard:alerts:update', data);
    });

    // Nueva notificación
    this.socket.on('dashboard:notification', (data) => {
      this.emit('dashboard:notification', data);
    });

    // Estado de actualizaciones automáticas
    this.socket.on('dashboard:updates:status', (data) => {
      this.emit('dashboard:updates:status', data);
    });

    // Métricas de rendimiento
    this.socket.on('dashboard:performance', (data) => {
      this.emit('dashboard:performance', data);
    });

    // Eventos de cache
    this.socket.on('dashboard:cache:invalidated', (data) => {
      this.emit('dashboard:cache:invalidated', data);
    });
  }

  /**
   * Unirse a salas específicas del usuario
   */
  joinRooms() {
    if (!this.socket || !this.userContext) return;

    // ✅ CORRECCIÓN CRÍTICA: Usar empresaId correcto (empresaId o idEmpresa)
    const empresaId = this.userContext.empresaId || this.userContext.idEmpresa;

    // Unirse a sala de empresa
    this.socket.emit('join:empresa', {
      empresaId: empresaId
    });

    // Unirse a sala de usuario
    this.socket.emit('join:usuario', {
      userId: this.userContext.idUsuario
    });

    // Unirse a sala de rol
    this.socket.emit('join:rol', {
      rol: this.userContext.rol
    });

    console.log('🔗 Salas unidas:', {
      empresaId: empresaId,
      userId: this.userContext.idUsuario,
      rol: this.userContext.rol
    });
  }

  /**
   * Configurar reconexión automática
   */
  setupReconnection() {
    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
    });

    this.socket.on('reconnect_failed', () => {
      this.isConnected = false;
      this.emit('connection:failed', {
        attempts: this.reconnectAttempts,
        timestamp: new Date()
      });
    });

    this.socket.on('reconnect', (attempt) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:reestablished', {
        attempt: attempt,
        timestamp: new Date()
      });
    });
  }

  /**
   * Manejar errores de conexión
   */
  handleConnectionError(error) {
    this.isConnected = false;

    console.error('❌ Error de conexión WebSocket:', {
      message: error.message,
      code: error.code,
      type: error.type,
      attempts: this.reconnectAttempts
    });

    this.emit('connection:error', {
      error: error.message,
      code: error.code,
      type: error.type,
      attempts: this.reconnectAttempts,
      timestamp: new Date()
    });

    // Intentar reconectar si no se ha alcanzado el límite
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      // Calcular delay con backoff exponencial pero limitado
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        this.maxReconnectDelay
      );

      console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.reconnect();
      }, delay);
    } else {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      this.emit('connection:failed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        timestamp: new Date()
      });
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect() {
    if (this.socket) {
      if (!this.socket.connected) {
        console.log('🔄 Reconectando WebSocket...');
        this.socket.connect();
      } else {
        console.log('✅ WebSocket ya está conectado');
      }
    } else {
      console.log('🔄 Creando nueva conexión WebSocket...');
      if (this.userContext) {
        this.connect(this.userContext);
      } else {
        console.error('❌ No se puede reconectar sin contexto de usuario');
      }
    }
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }

    // Limpiar timers
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    // Limpiar throttling timers
    this.eventThrottleTimers.clear();
  }

  /**
   * Configurar modo de actualización (tiempo real vs horario)
   */
  setUpdateMode(realTime = false, intervalMinutes = 60) {
    this.isRealTimeMode = realTime;
    this.updateInterval = intervalMinutes * 60 * 1000;

    if (realTime) {
      this.stopScheduledUpdates();
    } else {
      this.startScheduledUpdates();
    }
  }

  /**
   * Iniciar actualizaciones programadas cada hora
   */
  startScheduledUpdates() {
    this.stopScheduledUpdates(); // Limpiar timer anterior

    this.updateTimer = setInterval(() => {
      if (this.isConnected) {
        this.requestDashboardUpdate();
      }
    }, this.updateInterval);
  }

  /**
   * Detener actualizaciones programadas
   */
  stopScheduledUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Solicitar actualización manual del dashboard
   */
  requestDashboardUpdate() {
    if (this.socket && this.isConnected) {
      this.socket.emit('dashboard:request_update', {
        timestamp: new Date(),
        userId: this.userContext?.idUsuario
      });
    }
  }

  /**
   * Verificar estado de conexión
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Enviar evento personalizado con throttling
   */
  emit(event, data) {
    // Verificar si el evento debe ser throttled
    const throttleKey = `${event}_${JSON.stringify(data).slice(0, 100)}`; // Key única por evento y datos similares

    if (this.eventThrottleTimers.has(throttleKey)) {
      // Evento ya emitido recientemente, ignorar
      return;
    }

    // Emitir el evento
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
      }
    });

    // Configurar throttling para este tipo de evento
    this.eventThrottleTimers.set(throttleKey, setTimeout(() => {
      this.eventThrottleTimers.delete(throttleKey);
    }, this.eventThrottleDelay));
  }

  /**
   * Registrar listener para eventos
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remover listener de eventos
   */
  off(event, callback = null) {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  // ===============================
  // MANEJADORES DE EVENTOS DE DATOS
  // ===============================

  /**
   * Manejar nuevo conductor
   */
  handleNewConductor(data) {
    const notification = {
      type: 'conductor_nuevo',
      title: '👨‍💼 Nuevo Conductor Registrado',
      message: `Se ha registrado el conductor ${data.nomConductor} ${data.apeConductor}`,
      data: data,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.emit('notification:new_conductor', notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Manejar actualización de conductor
   */
  handleConductorUpdate(data) {
    const notification = {
      type: 'conductor_actualizado',
      title: '👨‍💼 Conductor Actualizado',
      message: `Se actualizó la información del conductor ${data.nomConductor} ${data.apeConductor}`,
      data: data,
      timestamp: new Date(),
      priority: 'low'
    };

    this.emit('notification:conductor_updated', notification);
  }

  /**
   * Manejar nuevo vehículo
   */
  handleNewVehicle(data) {
    const notification = {
      type: 'vehiculo_nuevo',
      title: '🚗 Nuevo Vehículo Registrado',
      message: `Se ha registrado el vehículo ${data.marVehiculo} ${data.modVehiculo} (${data.plaVehiculo})`,
      data: data,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.emit('notification:new_vehicle', notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Manejar actualización de vehículo
   */
  handleVehicleUpdate(data) {
    const notification = {
      type: 'vehiculo_actualizado',
      title: '🚗 Vehículo Actualizado',
      message: `Se actualizó la información del vehículo ${data.plaVehiculo}`,
      data: data,
      timestamp: new Date(),
      priority: 'low'
    };

    this.emit('notification:vehicle_updated', notification);
  }

  /**
   * Manejar nueva ruta
   */
  handleNewRoute(data) {
    const notification = {
      type: 'ruta_nueva',
      title: '🗺️ Nueva Ruta Registrada',
      message: `Se ha registrado la ruta "${data.nomRuta}"`,
      data: data,
      timestamp: new Date(),
      priority: 'low'
    };

    this.emit('notification:new_route', notification);
  }

  /**
   * Manejar nuevo viaje
   */
  handleNewTrip(data) {
    const notification = {
      type: 'viaje_nuevo',
      title: '⏰ Nuevo Viaje Programado',
      message: `Se programó un nuevo viaje para la ruta ${data.nomRuta || 'sin nombre'}`,
      data: data,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.emit('notification:new_trip', notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Manejar actualización de viaje
   */
  handleTripUpdate(data) {
    const notification = {
      type: 'viaje_actualizado',
      title: '⏰ Viaje Actualizado',
      message: `Se actualizó el viaje ${data.idViaje}`,
      data: data,
      timestamp: new Date(),
      priority: 'low'
    };

    this.emit('notification:trip_updated', notification);
  }

  /**
   * Manejar alertas de vencimientos
   */
  handleExpirationAlert(data) {
    const notification = {
      type: 'vencimiento_alerta',
      title: '⚠️ Alerta de Vencimiento',
      message: `Documento próximo a vencer: ${data.tipoDocumento} - ${data.titular}`,
      data: data,
      timestamp: new Date(),
      priority: 'high'
    };

    this.emit('notification:expiration_alert', notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Manejar cambios en el estado del sistema
   */
  handleSystemStatusChange(data) {
    const notification = {
      type: 'sistema_cambio',
      title: '📊 Cambio en Sistema',
      message: `Estado del sistema actualizado: ${data.status}`,
      data: data,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.emit('notification:system_status', notification);
  }

  /**
   * Manejar notificaciones del chatbot
   */
  handleChatbotNotification(data) {
    const notification = {
      type: 'chatbot_notificacion',
      title: '🤖 Notificación del Chatbot',
      message: data.message,
      data: data,
      timestamp: new Date(),
      priority: data.priority || 'medium'
    };

    this.emit('notification:chatbot', notification);

    if (data.showBrowserNotification) {
      this.showBrowserNotification(notification);
    }
  }

  /**
   * Mostrar notificación del navegador
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type,
        requireInteraction: notification.priority === 'high',
        silent: false
      };

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto-cerrar después de 5 segundos (excepto high priority)
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  /**
   * Solicitar permisos para notificaciones del navegador
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Enviar notificación manual
   */
  sendNotification(type, title, message, data = {}, priority = 'medium') {
    if (this.socket && this.isConnected) {
      // ✅ CORRECCIÓN CRÍTICA: Usar empresaId correcto (empresaId o idEmpresa)
      const empresaId = this.userContext?.empresaId || this.userContext?.idEmpresa;

      this.socket.emit('notification:send', {
        type,
        title,
        message,
        data,
        priority,
        userId: this.userContext?.idUsuario,
        empresaId: empresaId, // ✅ CORRECCIÓN CRÍTICA: empresaId obligatorio
        timestamp: new Date()
      });
    }
  }

  /**
   * Obtener estadísticas de conexión
   */
  getConnectionStats() {
    // ✅ CORRECCIÓN CRÍTICA: Usar empresaId correcto (empresaId o idEmpresa)
    const empresaId = this.userContext?.empresaId || this.userContext?.idEmpresa;

    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastConnectionTime: this.socket?.connected ? new Date() : null,
      userContext: this.userContext,
      activeRooms: this.userContext ? [
        `empresa_${empresaId}`, // ✅ CORRECCIÓN CRÍTICA: empresaId correcto
        `usuario_${this.userContext.idUsuario}`,
        `rol_${this.userContext.rol || 'USER'}`
      ] : []
    };
  }

  /**
   * Obtener estadísticas del servicio desde el backend
   */
  async getServiceStats() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app'}/api/realtime/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener estadísticas');
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener clientes conectados desde el backend
   */
  async getConnectedClients() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app'}/api/realtime/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener clientes conectados');
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Enviar notificación vía API REST
   */
  async sendNotificationViaAPI(targetType, targetId, event, data, priority = 'medium') {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app'}/api/realtime/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetType,
          targetId,
          event,
          data,
          priority
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al enviar notificación');
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener métricas de rendimiento
   */
  async getPerformanceMetrics() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app'}/api/realtime/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener métricas');
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener estado del servicio
   */
  getServiceStatus() {
    return {
      isConnected: this.isConnected,
      isRealTimeMode: this.isRealTimeMode,
      updateInterval: this.updateInterval,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      eventThrottleDelay: this.eventThrottleDelay,
      activeThrottledEvents: this.eventThrottleTimers.size
    };
  }
}

// Crear instancia singleton
const realTimeService = new RealTimeService();

// Hook para usar el servicio WebSocket (compatibilidad con socketService)
export const useSocket = (authData = null) => {
  return {
    socket: realTimeService.socket,
    isConnected: () => realTimeService.isConnected,
    connect: (customAuthData = null) => realTimeService.connect(customAuthData || authData),
    disconnect: () => realTimeService.disconnect(),
    emit: (event, data) => realTimeService.emit(event, data),
    on: (event, callback) => realTimeService.on(event, callback),
    off: (event, callback) => realTimeService.off(event, callback),
    getConnectionStatus: () => ({
      connected: realTimeService.isConnected,
      socketId: realTimeService.socket?.id,
      reconnectAttempts: realTimeService.reconnectAttempts,
      maxReconnectAttempts: realTimeService.maxReconnectAttempts
    }),
    reconnect: () => realTimeService.reconnect(),
    getStats: () => realTimeService.getServiceStatus()
  };
};

export default realTimeService;

// Exportar también la clase para casos donde se necesite una instancia específica
export { RealTimeService };