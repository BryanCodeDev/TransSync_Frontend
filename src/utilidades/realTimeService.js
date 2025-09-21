// src/utilidades/realTimeService.js - Servicio de Notificaciones en Tiempo Real
import { io } from 'socket.io-client';

class RealTimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 segundo
    this.userContext = null;
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(userContext = null) {
    if (this.socket?.connected) {
      console.log('🔗 WebSocket ya está conectado');
      return;
    }

    this.userContext = userContext;

    try {
      // Conectar al servidor WebSocket
      this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
        auth: {
          token: localStorage.getItem('authToken'),
          userId: userContext?.idUsuario,
          empresaId: userContext?.idEmpresa
        }
      });

      this.setupEventListeners();
      this.setupReconnection();

      console.log('🔗 Conectando a WebSocket...');

    } catch (error) {
      console.error('❌ Error conectando a WebSocket:', error);
      this.handleConnectionError(error);
    }
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
        timestamp: new Date()
      });
    });

    // Evento de desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión
        this.reconnect();
      }
    });

    // Evento de error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.handleConnectionError(error);
    });

    // Eventos de datos en tiempo real
    this.setupDataEventListeners();
  }

  /**
   * Configurar listeners para eventos de datos
   */
  setupDataEventListeners() {
    // Nuevos conductores
    this.socket.on('conductor:created', (data) => {
      console.log('👨‍💼 Nuevo conductor registrado:', data);
      this.handleNewConductor(data);
    });

    // Actualizaciones de conductores
    this.socket.on('conductor:updated', (data) => {
      console.log('👨‍💼 Conductor actualizado:', data);
      this.handleConductorUpdate(data);
    });

    // Nuevos vehículos
    this.socket.on('vehiculo:created', (data) => {
      console.log('🚗 Nuevo vehículo registrado:', data);
      this.handleNewVehicle(data);
    });

    // Actualizaciones de vehículos
    this.socket.on('vehiculo:updated', (data) => {
      console.log('🚗 Vehículo actualizado:', data);
      this.handleVehicleUpdate(data);
    });

    // Nuevas rutas
    this.socket.on('ruta:created', (data) => {
      console.log('🗺️ Nueva ruta registrada:', data);
      this.handleNewRoute(data);
    });

    // Nuevos viajes
    this.socket.on('viaje:created', (data) => {
      console.log('⏰ Nuevo viaje programado:', data);
      this.handleNewTrip(data);
    });

    // Actualizaciones de viajes
    this.socket.on('viaje:updated', (data) => {
      console.log('⏰ Viaje actualizado:', data);
      this.handleTripUpdate(data);
    });

    // Alertas de vencimientos
    this.socket.on('vencimiento:alert', (data) => {
      console.log('⚠️ Nueva alerta de vencimiento:', data);
      this.handleExpirationAlert(data);
    });

    // Cambios en el sistema
    this.socket.on('system:status_changed', (data) => {
      console.log('📊 Cambio en estado del sistema:', data);
      this.handleSystemStatusChange(data);
    });

    // Notificaciones del chatbot
    this.socket.on('chatbot:notification', (data) => {
      console.log('🤖 Notificación del chatbot:', data);
      this.handleChatbotNotification(data);
    });
  }

  /**
   * Unirse a salas específicas del usuario
   */
  joinRooms() {
    if (!this.socket || !this.userContext) return;

    // Unirse a sala de empresa
    this.socket.emit('join:empresa', {
      empresaId: this.userContext.idEmpresa
    });

    // Unirse a sala de usuario
    this.socket.emit('join:usuario', {
      userId: this.userContext.idUsuario
    });

    // Unirse a sala de rol
    this.socket.emit('join:rol', {
      rol: this.userContext.rol
    });

    console.log('🏠 Unido a salas:', {
      empresa: this.userContext.idEmpresa,
      usuario: this.userContext.idUsuario,
      rol: this.userContext.rol
    });
  }

  /**
   * Configurar reconexión automática
   */
  setupReconnection() {
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Intento de reconexión ${attempt}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attempt;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Fallaron todos los intentos de reconexión');
      this.isConnected = false;
      this.emit('connection:failed', {
        attempts: this.reconnectAttempts,
        timestamp: new Date()
      });
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconectado exitosamente en intento ${attempt}`);
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
    console.error('❌ Error de conexión WebSocket:', error);

    this.emit('connection:error', {
      error: error.message,
      timestamp: new Date()
    });

    // Intentar reconectar si no se ha alcanzado el límite
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect() {
    if (this.socket && !this.socket.connected) {
      console.log('🔄 Intentando reconectar...');
      this.socket.connect();
    }
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket...');
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Verificar estado de conexión
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Enviar evento personalizado
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error en listener de evento ${event}:`, error);
      }
    });
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
      this.socket.emit('notification:send', {
        type,
        title,
        message,
        data,
        priority,
        userId: this.userContext?.idUsuario,
        empresaId: this.userContext?.idEmpresa,
        timestamp: new Date()
      });
    }
  }

  /**
   * Obtener estadísticas de conexión
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastConnectionTime: this.socket?.connected ? new Date() : null,
      userContext: this.userContext,
      activeRooms: this.userContext ? [
        `empresa_${this.userContext.idEmpresa}`,
        `usuario_${this.userContext.idUsuario}`,
        `rol_${this.userContext.rol}`
      ] : []
    };
  }
}

// Crear instancia singleton
const realTimeService = new RealTimeService();

export default realTimeService;