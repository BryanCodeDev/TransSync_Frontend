/**
 * ✅ CORRECCIÓN CRÍTICA: Herramientas de diagnóstico para problemas de despliegue
 * Ejecutar en consola del navegador para diagnosticar problemas
 */

const deploymentDiagnostics = {
  // Información del entorno
  environment: {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    apiUrl: process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app',
    wsUrl: process.env.REACT_APP_WS_URL || 'wss://transyncbackend-production.up.railway.app'
  },

  // Verificar archivos críticos
  checkCriticalFiles: async function() {
    console.log('🔍 Verificando archivos críticos...');

    const filesToCheck = [
      '/static/js/main.ab6abfa2.js',
      '/static/css/main.54cd4780.css',
      '/manifest.json',
      '/favicon.ico'
    ];

    const results = {};

    for (const file of filesToCheck) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        results[file] = {
          status: response.status,
          contentType: response.headers.get('content-type'),
          size: response.headers.get('content-length'),
          ok: response.ok
        };

        if (response.ok) {
          console.log(`✅ ${file}:`, results[file]);
        } else {
          console.error(`❌ ${file}:`, results[file]);
        }
      } catch (error) {
        results[file] = { error: error.message };
        console.error(`❌ ${file}:`, error.message);
      }
    }

    return results;
  },

  // Verificar autenticación
  checkAuthentication: function() {
    console.log('🔐 Verificando autenticación...');

    const authData = {
      authToken: !!localStorage.getItem('authToken'),
      userData: !!localStorage.getItem('userData'),
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      empresaId: !!localStorage.getItem('empresaId'),
      userRole: localStorage.getItem('userRole'),
      userEmail: localStorage.getItem('userEmail'),
      userId: localStorage.getItem('userId')
    };

    console.table(authData);

    // Verificar datos del usuario
    if (authData.userData) {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('👤 Datos del usuario:', userData);

        const userValidation = {
          hasId: !!userData.id,
          hasEmail: !!userData.email,
          hasEmpresaId: !!userData.empresaId,
          hasRole: !!userData.role
        };

        console.log('🔍 Validación de datos:', userValidation);

        if (!userValidation.hasEmpresaId) {
          console.error('❌ empresaId faltante en datos del usuario');
        }

      } catch (e) {
        console.error('❌ Error parseando userData:', e);
      }
    }

    return authData;
  },

  // Verificar conectividad API
  checkAPIConnectivity: async function() {
    console.log('🌐 Verificando conectividad API...');

    const apiUrl = this.environment.apiUrl;
    const results = {};

    // Health check
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      results.health = {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      };

      if (response.ok) {
        const data = await response.json();
        results.health.data = data;
        console.log('✅ API Health:', results.health);
      } else {
        console.error('❌ API Health:', results.health);
      }
    } catch (error) {
      results.health = { error: error.message };
      console.error('❌ API Health Error:', error.message);
    }

    // Login endpoint (CORS test)
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'OPTIONS',
        signal: AbortSignal.timeout(5000)
      });

      results.cors = {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };

      console.log('✅ CORS Check:', results.cors);
    } catch (error) {
      results.cors = { error: error.message };
      console.error('❌ CORS Error:', error.message);
    }

    return results;
  },

  // Verificar WebSocket
  checkWebSocket: function() {
    console.log('🔗 Verificando WebSocket...');

    const wsUrl = this.environment.wsUrl;
    console.log('WebSocket URL:', wsUrl);

    return new Promise((resolve) => {
      try {
        const socket = new WebSocket(wsUrl);

        const result = {
          url: wsUrl,
          readyState: socket.readyState
        };

        socket.onopen = () => {
          result.status = 'connected';
          result.readyState = socket.readyState;
          console.log('✅ WebSocket conectado exitosamente');
          socket.close();
          resolve(result);
        };

        socket.onerror = (error) => {
          result.status = 'error';
          result.error = error;
          console.error('❌ Error WebSocket:', error);
          resolve(result);
        };

        setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            result.status = 'timeout';
            console.error('❌ WebSocket timeout');
            socket.close();
            resolve(result);
          }
        }, 5000);

      } catch (error) {
        console.error('❌ Error creando WebSocket:', error);
        resolve({ status: 'error', error: error.message });
      }
    });
  },

  // Ejecutar diagnóstico completo
  runFullDiagnostics: async function() {
    console.log('🚀 Iniciando diagnóstico completo de despliegue...');
    console.log('📊 Información del entorno:', this.environment);

    try {
      const [files, auth, api, ws] = await Promise.all([
        this.checkCriticalFiles(),
        this.checkAuthentication(),
        this.checkAPIConnectivity(),
        this.checkWebSocket()
      ]);

      const results = {
        timestamp: new Date().toISOString(),
        environment: this.environment,
        files,
        authentication: auth,
        api,
        webSocket: ws,
        summary: this.generateSummary({ files, auth, api, ws })
      };

      console.log('📋 Resumen del diagnóstico:', results.summary);

      return results;

    } catch (error) {
      console.error('❌ Error ejecutando diagnóstico:', error);
      return { error: error.message };
    }
  },

  // Generar resumen ejecutivo
  generateSummary: function(results) {
    const issues = [];
    const successes = [];

    // Verificar archivos críticos
    Object.entries(results.files).forEach(([file, result]) => {
      if (result.ok) {
        successes.push(`Archivo ${file} cargado correctamente`);
      } else {
        issues.push(`Archivo ${file} falló: ${result.error || result.status}`);
      }
    });

    // Verificar autenticación
    if (results.authentication.authToken && results.authentication.userData && results.authentication.empresaId) {
      successes.push('Autenticación válida con empresaId');
    } else {
      issues.push('Problemas de autenticación detectados');
    }

    // Verificar API
    if (results.api.health?.ok) {
      successes.push('API backend responde correctamente');
    } else {
      issues.push('API backend no responde');
    }

    // Verificar WebSocket
    if (results.webSocket.status === 'connected') {
      successes.push('WebSocket conectado correctamente');
    } else {
      issues.push('WebSocket no se puede conectar');
    }

    return {
      totalIssues: issues.length,
      totalSuccesses: successes.length,
      issues,
      successes,
      status: issues.length === 0 ? 'healthy' : 'issues-detected'
    };
  },

  // Función de utilidad para limpiar cache
  clearAllCaches: async function() {
    console.log('🧹 Limpiando todos los caches...');

    // Limpiar service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service Worker eliminado');
      }
    }

    // Limpiar caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log(`✅ ${cacheNames.length} caches eliminados`);
    }

    // Limpiar localStorage problemático
    const keysToRemove = ['authToken', 'userToken', 'userData', 'isAuthenticated'];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('✅ Limpieza completada');
  }
};

// Hacer disponible globalmente
window.deploymentDiagnostics = deploymentDiagnostics;

// Ejecutar automáticamente si se llama directamente
if (typeof window !== 'undefined') {
  console.log('🔧 Herramientas de diagnóstico de despliegue cargadas');
  console.log('💡 Usa deploymentDiagnostics.runFullDiagnostics() para ejecutar diagnóstico completo');
  console.log('💡 Usa deploymentDiagnostics.clearAllCaches() para limpiar cache');
}

export default deploymentDiagnostics;