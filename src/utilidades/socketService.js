// src/utilidades/socketService.js - Servicio WebSocket para dashboard en tiempo real

import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.authData = null;
  }

  // Conectar al servidor WebSocket con autenticación
  connect(authData = null) {
    return new Promise((resolve, reject) => {
      try {
        // Usar datos de autenticación proporcionados o intentar obtener del localStorage
        if (authData) {
          this.authData = authData;
        } else {
          // Fallback: intentar obtener token del localStorage
          const token = localStorage.getItem('authToken') || localStorage.getItem('userToken') || localStorage.getItem('token');
          if (!token) {
            reject(new Error('Usuario no autenticado - no se encontró token'));
            return;
          }
          this.authData = { token };
        }

        // Configurar conexión WebSocket
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
          transports: ['websocket', 'polling'],
          auth: this.authData,
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
          randomizationFactor: 0.5
        });

        // Manejar conexión exitosa
        this.socket.on('connect', () => {
          console.log('✅ WebSocket conectado:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Emitir evento de conexión exitosa
          this.emit('dashboard:connected', {
            timestamp: new Date().toISOString(),
            userId: authData?.userId || null,
            empresaId: authData?.empresaId || null
          });

          resolve(this.socket);
        });

        // Manejar errores de conexión
        this.socket.on('connect_error', (error) => {
          console.error('❌ Error de conexión WebSocket:', error);
          this.isConnected = false;

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          } else {
            reject(new Error(`Error de conexión después de ${this.maxReconnectAttempts} intentos: ${error.message}`));
          }
        });

        // Manejar desconexión
        this.socket.on('disconnect', (reason) => {
          console.log('📡 WebSocket desconectado:', reason);
          this.isConnected = false;

          if (reason === 'io server disconnect') {
            // El servidor cerró la conexión, intentar reconectar
            setTimeout(() => {
              this.connect();
            }, this.reconnectDelay);
          }
        });

        // Manejar errores generales
        this.socket.on('error', (error) => {
          console.error('❌ Error WebSocket:', error);
        });

        // Configurar listeners para eventos del dashboard
        this.setupDashboardListeners();

      } catch (error) {
        console.error('❌ Error inicializando WebSocket:', error);
        reject(error);
      }
    });
  }

  // Configurar listeners para eventos del dashboard
  setupDashboardListeners() {
    if (!this.socket) return;

    // Estadísticas actualizadas
    this.socket.on('dashboard:stats:update', (data) => {
      console.log('📊 Estadísticas actualizadas:', data);
      this.notifyListeners('stats:update', data);
    });

    // Datos en tiempo real actualizados
    this.socket.on('dashboard:realtime:update', (data) => {
      console.log('⚡ Datos en tiempo real:', data);
      this.notifyListeners('realtime:update', data);
    });

    // Alertas actualizadas
    this.socket.on('dashboard:alerts:update', (data) => {
      console.log('🚨 Alertas actualizadas:', data);
      this.notifyListeners('alerts:update', data);
    });

    // Nueva notificación
    this.socket.on('dashboard:notification', (data) => {
      console.log('📱 Nueva notificación:', data);
      this.notifyListeners('notification', data);
    });

    // Estado de actualizaciones automáticas
    this.socket.on('dashboard:updates:status', (data) => {
      console.log('🔄 Estado de actualizaciones:', data);
      this.notifyListeners('updates:status', data);
    });

    // Métricas de rendimiento
    this.socket.on('dashboard:performance', (data) => {
      console.log('📈 Métricas de rendimiento:', data);
      this.notifyListeners('performance', data);
    });

    // Eventos de cache
    this.socket.on('dashboard:cache:invalidated', (data) => {
      console.log('💾 Cache invalidado:', data);
      this.notifyListeners('cache:invalidated', data);
    });
  }

  // Desconectar del servidor WebSocket
  disconnect() {
    if (this.socket) {
      console.log('📡 Desconectando WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Emitir evento
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket no conectado, no se puede emitir evento:', event);
    }
  }

  // Escuchar eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Si es un evento del dashboard y no estamos conectados, intentar conectar
    if (!this.isConnected && ['stats:update', 'realtime:update', 'alerts:update', 'notification'].includes(event)) {
      this.connect();
    }
  }

  // Dejar de escuchar eventos
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Notificar a todos los listeners de un evento
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en listener de evento:', event, error);
        }
      });
    }
  }

  // Obtener estado de la conexión
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Forzar reconexión
  reconnect() {
    console.log('🔄 Forzando reconexión WebSocket...');
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connect();
  }

  // Obtener estadísticas de la conexión
  getStats() {
    return {
      connectionStatus: this.getConnectionStatus(),
      listenersCount: this.listeners.size,
      activeListeners: Array.from(this.listeners.entries()).map(([event, callbacks]) => ({
        event,
        listeners: callbacks.size
      }))
    };
  }
}

// Crear instancia singleton
const socketService = new SocketService();

// Hook para usar el servicio WebSocket
export const useSocket = (authData = null) => {
  return {
    socket: socketService.socket,
    isConnected: socketService.isConnected,
    connect: (customAuthData = null) => socketService.connect(customAuthData || authData),
    disconnect: () => socketService.disconnect(),
    emit: (event, data) => socketService.emit(event, data),
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback),
    getConnectionStatus: () => socketService.getConnectionStatus(),
    reconnect: () => socketService.reconnect(),
    getStats: () => socketService.getStats()
  };
};

export default socketService;