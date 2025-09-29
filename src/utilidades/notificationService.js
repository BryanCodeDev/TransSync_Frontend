class NotificationService {
  constructor() {
    this.permission = null;
    this.listeners = new Map();
    this.notificationHistory = [];
    this.maxHistorySize = 100;
  }

  // Inicializar el servicio de notificaciones
  async initialize() {
    try {
      // Verificar soporte para notificaciones
      if (!('Notification' in window)) {
        
        return false;
      }

      // Obtener estado actual de permisos
      this.permission = Notification.permission;

      // Si los permisos no están definidos, solicitarlos
      if (this.permission === 'default') {
        await this.requestPermission();
      }

      // Configurar listeners para eventos de visibilidad
      this.setupVisibilityListeners();

      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando servicio de notificaciones:', error);
      return false;
    }
  }

  // Solicitar permisos para notificaciones
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        
        this.notifyListeners('permission:granted', { permission });
      } else {
        
        this.notifyListeners('permission:denied', { permission });
      }

      return permission;
    } catch (error) {
      console.error('❌ Error solicitando permisos de notificación:', error);
      return 'denied';
    }
  }

  // Configurar listeners para eventos de visibilidad de la página
  setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        
      } else {
        
        // Marcar notificaciones pendientes como leídas cuando el usuario regresa
        this.markPendingAsRead();
      }
    });
  }

  // Mostrar notificación push
  async showNotification(notification) {
    try {
      // Validar datos de notificación
      if (!notification || !notification.title) {
        console.warn('⚠️ Notificación inválida:', notification);
        return null;
      }

      // Verificar permisos
      if (this.permission !== 'granted') {
        console.warn('⚠️ Permisos de notificación no concedidos');
        return null;
      }

      // Verificar si la página está visible
      const isPageVisible = !document.hidden;

      // Configurar opciones de notificación
      const options = {
        body: notification.message || notification.body || '',
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon.ico',
        tag: notification.tag || notification.type || 'dashboard',
        requireInteraction: notification.requireInteraction || notification.priority === 'high',
        silent: notification.silent || !isPageVisible,
        timestamp: notification.timestamp || Date.now(),
        data: {
          ...notification.data,
          id: notification.id || Date.now(),
          type: notification.type || 'info',
          priority: notification.priority || 'normal'
        }
      };

      // Crear notificación del navegador
      const browserNotification = new Notification(notification.title, options);

      // Agregar a historial
      this.addToHistory({
        id: options.data.id,
        title: notification.title,
        message: options.body,
        type: options.data.type,
        priority: options.data.priority,
        timestamp: options.timestamp,
        read: false,
        acknowledged: false
      });

      // Configurar eventos de la notificación
      browserNotification.onclick = () => {
        

        // Enfocar la ventana
        window.focus();

        // Emitir evento personalizado
        this.notifyListeners('notification:click', {
          notification: {
            id: options.data.id,
            title: notification.title,
            type: options.data.type
          }
        });

        // Cerrar notificación
        browserNotification.close();

        // Marcar como leída
        this.markAsRead(options.data.id);
      };

      browserNotification.onclose = () => {
        
        this.notifyListeners('notification:close', {
          notification: {
            id: options.data.id,
            title: notification.title
          }
        });
      };

      browserNotification.onerror = (error) => {
        
        this.notifyListeners('notification:error', {
          error,
          notification: {
            id: options.data.id,
            title: notification.title
          }
        });
      };

      // Auto-cerrar notificación después de un tiempo si no requiere interacción
      if (!options.requireInteraction) {
        setTimeout(() => {
          if (browserNotification) {
            browserNotification.close();
          }
        }, notification.duration || 5000);
      }

      
      return browserNotification;

    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
      return null;
    }
  }

  // Mostrar notificación desde evento WebSocket
  async showFromSocket(data) {
    try {
      const notification = {
        id: data.id || Date.now(),
        title: data.title || 'Nueva actualización',
        message: data.message || data.body,
        type: data.type || 'info',
        priority: data.priority || 'normal',
        icon: data.icon,
        badge: data.badge,
        tag: data.tag || 'dashboard',
        requireInteraction: data.requireInteraction || data.priority === 'high',
        silent: data.silent,
        timestamp: data.timestamp || Date.now(),
        data: data.data || {}
      };

      return await this.showNotification(notification);
    } catch (error) {
      console.error('❌ Error mostrando notificación desde socket:', error);
      return null;
    }
  }

  // Agregar notificación al historial
  addToHistory(notification) {
    try {
      this.notificationHistory.unshift(notification);

      // Limitar tamaño del historial
      if (this.notificationHistory.length > this.maxHistorySize) {
        this.notificationHistory = this.notificationHistory.slice(0, this.maxHistorySize);
      }

      // Emitir evento de nueva notificación en historial
      this.notifyListeners('history:updated', {
        notification,
        history: this.notificationHistory
      });

      
    } catch (error) {
      console.error('❌ Error agregando notificación al historial:', error);
    }
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    try {
      const notification = this.notificationHistory.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = Date.now();

        this.notifyListeners('notification:read', {
          notificationId,
          notification
        });

        
      }
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
    }
  }

  // Marcar todas las notificaciones pendientes como leídas
  markPendingAsRead() {
    try {
      const pending = this.notificationHistory.filter(n => !n.read);
      pending.forEach(notification => {
        this.markAsRead(notification.id);
      });

      if (pending.length > 0) {
        
      }
    } catch (error) {
      console.error('❌ Error marcando notificaciones pendientes como leídas:', error);
    }
  }

  // Reconocer notificación (marcar como atendida)
  acknowledge(notificationId) {
    try {
      const notification = this.notificationHistory.find(n => n.id === notificationId);
      if (notification) {
        notification.acknowledged = true;
        notification.acknowledgedAt = Date.now();

        this.notifyListeners('notification:acknowledged', {
          notificationId,
          notification
        });

        
      }
    } catch (error) {
      console.error('❌ Error reconociendo notificación:', error);
    }
  }

  // Obtener historial de notificaciones
  getHistory(limit = 20, filter = {}) {
    try {
      let history = [...this.notificationHistory];

      // Aplicar filtros
      if (filter.type) {
        history = history.filter(n => n.type === filter.type);
      }

      if (filter.priority) {
        history = history.filter(n => n.priority === filter.priority);
      }

      if (filter.read !== undefined) {
        history = history.filter(n => n.read === filter.read);
      }

      if (filter.acknowledged !== undefined) {
        history = history.filter(n => n.acknowledged === filter.acknowledged);
      }

      // Limitar resultados
      return history.slice(0, limit);
    } catch (error) {
      console.error('❌ Error obteniendo historial de notificaciones:', error);
      return [];
    }
  }

  // Obtener estadísticas de notificaciones
  getStats() {
    try {
      const total = this.notificationHistory.length;
      const read = this.notificationHistory.filter(n => n.read).length;
      const acknowledged = this.notificationHistory.filter(n => n.acknowledged).length;
      const unread = total - read;

      const byType = this.notificationHistory.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {});

      const byPriority = this.notificationHistory.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        read,
        acknowledged,
        unread,
        byType,
        byPriority,
        permission: this.permission,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de notificaciones:', error);
      return {
        total: 0,
        read: 0,
        acknowledged: 0,
        unread: 0,
        byType: {},
        byPriority: {},
        permission: this.permission,
        lastUpdated: Date.now()
      };
    }
  }

  // Limpiar historial
  clearHistory() {
    try {
      this.notificationHistory = [];
      this.notifyListeners('history:cleared', { timestamp: Date.now() });
      
    } catch (error) {
      console.error('❌ Error limpiando historial de notificaciones:', error);
    }
  }

  // Escuchar eventos del servicio
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
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
          
        }
      });
    }
  }

  // Verificar si el servicio está inicializado
  isInitialized() {
    return this.permission !== null;
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      permission: this.permission,
      historySize: this.notificationHistory.length,
      maxHistorySize: this.maxHistorySize,
      listenersCount: this.listeners.size,
      isSupported: 'Notification' in window,
      isInitialized: this.isInitialized()
    };
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

// Hook para usar el servicio de notificaciones
export const useNotification = () => {
  return {
    initialize: () => notificationService.initialize(),
    requestPermission: () => notificationService.requestPermission(),
    showNotification: (notification) => notificationService.showNotification(notification),
    showFromSocket: (data) => notificationService.showFromSocket(data),
    markAsRead: (id) => notificationService.markAsRead(id),
    acknowledge: (id) => notificationService.acknowledge(id),
    getHistory: (limit, filter) => notificationService.getHistory(limit, filter),
    getStats: () => notificationService.getStats(),
    clearHistory: () => notificationService.clearHistory(),
    on: (event, callback) => notificationService.on(event, callback),
    off: (event, callback) => notificationService.off(event, callback),
    getStatus: () => notificationService.getStatus(),
    isInitialized: () => notificationService.isInitialized()
  };
};

export default notificationService;