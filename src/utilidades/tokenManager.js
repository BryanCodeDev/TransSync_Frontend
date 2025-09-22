// utilidades/tokenManager.js - Gestión avanzada de tokens JWT
import React from 'react';
import { errorHandler, ERROR_CODES } from './errorHandler';

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.tokenCheckInterval = null;
    this.warningTime = 5 * 60 * 1000; // 5 minutos antes de expirar
    this.autoLogoutTime = 30 * 60 * 1000; // 30 minutos de inactividad
    this.lastActivity = Date.now();
    this.isRefreshing = false;

    // Configuración
    this.config = {
      refreshThreshold: 10 * 60 * 1000, // 10 minutos antes de expirar
      maxRefreshAttempts: 3,
      refreshAttempts: 0,
      autoLogoutEnabled: true,
      warningEnabled: true
    };

    this.initActivityTracking();
  }

  /**
   * Inicializar seguimiento de actividad del usuario
   */
  initActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Verificar inactividad cada minuto
    this.tokenCheckInterval = setInterval(() => {
      this.checkTokenStatus();
      this.checkInactivity();
    }, 60 * 1000);
  }

  /**
   * Verificar estado del token y renovarlo si es necesario
   */
  async checkTokenStatus() {
    const token = this.getToken();
    if (!token) return;

    try {
      const tokenData = this.parseToken(token);
      if (!tokenData) return;

      const now = Date.now();
      const expirationTime = tokenData.exp * 1000;
      const timeUntilExpiration = expirationTime - now;

      // Si el token expira pronto, intentar renovarlo
      if (timeUntilExpiration <= this.config.refreshThreshold && !this.isRefreshing) {
        console.log('🔄 Token próximo a expirar, iniciando refresh...');
        await this.refreshToken();
      }

      // Mostrar advertencia si está cerca de expirar
      if (this.config.warningEnabled &&
          timeUntilExpiration <= this.warningTime &&
          timeUntilExpiration > 0) {
        this.showExpirationWarning(Math.ceil(timeUntilExpiration / 1000 / 60));
      }

    } catch (error) {
      errorHandler.logError(error, 'TokenManager.checkTokenStatus');
    }
  }

  /**
   * Verificar inactividad y hacer logout automático
   */
  checkInactivity() {
    if (!this.config.autoLogoutEnabled) return;

    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    if (timeSinceActivity >= this.autoLogoutTime) {
      console.log('⏰ Usuario inactivo por mucho tiempo, cerrando sesión...');
      this.handleAutoLogout();
    }
  }

  /**
   * Manejar logout automático por inactividad
   */
  handleAutoLogout() {
    // Mostrar notificación de cierre de sesión
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sesión expirada', {
        body: 'Has sido desconectado por inactividad',
        icon: '/favicon.ico',
        tag: 'auto-logout'
      });
    }

    // Limpiar datos y redirigir
    this.clearTokens();
    this.stopTokenManagement();

    // Redirigir a login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?reason=auto-logout';
    }
  }

  /**
   * Obtener token actual
   */
  getToken() {
    return localStorage.getItem('authToken') ||
           localStorage.getItem('userToken') ||
           localStorage.getItem('token');
  }

  /**
   * Guardar token
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userToken', token); // Compatibilidad
    localStorage.setItem('token', token); // Compatibilidad adicional
    this.lastActivity = Date.now(); // Resetear actividad
  }

  /**
   * Limpiar todos los tokens
   */
  clearTokens() {
    const keysToRemove = [
      'authToken',
      'userToken',
      'token',
      'refreshToken',
      'tokenExpiration',
      'userData',
      'isAuthenticated',
      'userName',
      'userRole',
      'userEmail',
      'userId'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Parsear token JWT
   */
  parseToken(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error parseando token:', error);
      return null;
    }
  }

  /**
   * Verificar si el token es válido
   */
  isTokenValid(token = null) {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return false;

    try {
      const tokenData = this.parseToken(tokenToCheck);
      if (!tokenData || !tokenData.exp) return false;

      const now = Date.now();
      const expirationTime = tokenData.exp * 1000;

      return expirationTime > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener tiempo hasta expiración
   */
  getTimeUntilExpiration(token = null) {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return 0;

    try {
      const tokenData = this.parseToken(tokenToCheck);
      if (!tokenData || !tokenData.exp) return 0;

      const now = Date.now();
      const expirationTime = tokenData.exp * 1000;

      return Math.max(0, expirationTime - now);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Renovar token automáticamente
   */
  async refreshToken() {
    if (this.isRefreshing) {
      // Si ya se está renovando, esperar a que termine
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.config.refreshAttempts++;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          this.setToken(data.token);
          this.config.refreshAttempts = 0;

          console.log('✅ Token renovado exitosamente');

          // Emitir evento de token renovado
          window.dispatchEvent(new CustomEvent('token:refreshed', {
            detail: { token: data.token, user: data.user }
          }));

          return data;
        } else {
          throw new Error('No se recibió token en la respuesta');
        }
      } else if (response.status === 401) {
        throw errorHandler.createError(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Token expirado, requiere reautenticación');
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }

    } catch (error) {
      errorHandler.logError(error, 'TokenManager.refreshToken');

      if (this.config.refreshAttempts >= this.config.maxRefreshAttempts) {
        console.error('❌ Máximo número de intentos de refresh alcanzado');
        this.handleAutoLogout();
        return null;
      }

      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Mostrar advertencia de expiración
   */
  showExpirationWarning(minutesLeft) {
    // Evitar múltiples advertencias
    if (this.warningShown) return;
    this.warningShown = true;

    // Mostrar notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sesión próxima a expirar', {
        body: `Tu sesión expirará en ${minutesLeft} minutos`,
        icon: '/favicon.ico',
        tag: 'token-warning',
        requireInteraction: true
      });
    }

    // Emitir evento para mostrar advertencia en la UI
    window.dispatchEvent(new CustomEvent('token:warning', {
      detail: { minutesLeft }
    }));

    // Resetear flag después de 1 minuto
    setTimeout(() => {
      this.warningShown = false;
    }, 60 * 1000);
  }

  /**
   * Configurar interceptor para renovar token automáticamente en requests
   */
  setupRequestInterceptor() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Si recibimos 401, intentar renovar token
      if (response.status === 401) {
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            // Reintentar la request original con el nuevo token
            const newArgs = [...args];
            if (newArgs[1] && newArgs[1].headers) {
              newArgs[1].headers.Authorization = `Bearer ${newToken.token}`;
            }

            return originalFetch(...newArgs);
          }
        } catch (error) {
          console.error('Error renovando token en interceptor:', error);
        }
      }

      return response;
    };
  }

  /**
   * Iniciar gestión automática de tokens
   */
  startTokenManagement() {
    this.setupRequestInterceptor();
    console.log('🔐 Gestión automática de tokens iniciada');
  }

  /**
   * Detener gestión automática de tokens
   */
  stopTokenManagement() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }

    this.isRefreshing = false;
    this.refreshPromise = null;
    console.log('🔐 Gestión automática de tokens detenida');
  }

  /**
   * Obtener información del token actual
   */
  getTokenInfo() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const tokenData = this.parseToken(token);
      const timeUntilExpiration = this.getTimeUntilExpiration(token);

      return {
        isValid: this.isTokenValid(token),
        timeUntilExpiration,
        minutesUntilExpiration: Math.ceil(timeUntilExpiration / 1000 / 60),
        tokenData,
        lastActivity: this.lastActivity,
        minutesSinceActivity: Math.floor((Date.now() - this.lastActivity) / 1000 / 60)
      };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Forzar logout manual
   */
  forceLogout() {
    this.clearTokens();
    this.stopTokenManagement();

    // Emitir evento de logout forzado
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { reason: 'manual' }
    }));

    // Redirigir a login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?reason=logout';
    }
  }

  /**
   * Configurar configuración personalizada
   */
  configure(options) {
    this.config = { ...this.config, ...options };
    console.log('⚙️ Configuración de TokenManager actualizada:', this.config);
  }
}

// Crear instancia singleton
const tokenManager = new TokenManager();

// Hook para usar el TokenManager en componentes React
export const useTokenManager = () => {
  const [tokenInfo, setTokenInfo] = React.useState(() => tokenManager.getTokenInfo());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    const updateTokenInfo = () => {
      setTokenInfo(tokenManager.getTokenInfo());
    };

    const handleTokenRefreshed = () => {
      updateTokenInfo();
      setIsRefreshing(false);
    };

    const handleTokenWarning = (event) => {
      console.warn(`⚠️ Token expirará en ${event.detail.minutesLeft} minutos`);
    };

    const handleLogout = () => {
      setTokenInfo(null);
    };

    // Actualizar info cada minuto
    const interval = setInterval(updateTokenInfo, 60 * 1000);

    // Escuchar eventos
    window.addEventListener('token:refreshed', handleTokenRefreshed);
    window.addEventListener('token:warning', handleTokenWarning);
    window.addEventListener('auth:logout', handleLogout);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('token:refreshed', handleTokenRefreshed);
      window.removeEventListener('token:warning', handleTokenWarning);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  return {
    tokenInfo,
    isRefreshing,
    refreshToken: () => tokenManager.refreshToken(),
    forceLogout: () => tokenManager.forceLogout(),
    getTokenInfo: () => tokenManager.getTokenInfo()
  };
};

export default tokenManager;