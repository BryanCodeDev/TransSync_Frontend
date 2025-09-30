// ✅ CORRECCIÓN CRÍTICA: Script para verificar despliegue correcto
// Ejecutar en consola del navegador para diagnosticar problemas

window.deploymentDiagnostics = {
  timestamp: new Date().toISOString(),

  // Verificar archivos críticos
  checkCriticalFiles: function() {
    const filesToCheck = [
      '/static/js/main.ab6abfa2.js',
      '/static/css/main.54cd4780.css',
      '/manifest.json',
      '/favicon.ico'
    ];

    console.log('🔍 Verificando archivos críticos...');

    filesToCheck.forEach(file => {
      fetch(file, { method: 'HEAD' })
        .then(response => {
          console.log(`✅ ${file}:`, {
            status: response.status,
            contentType: response.headers.get('content-type'),
            size: response.headers.get('content-length')
          });
        })
        .catch(error => {
          console.error(`❌ ${file}:`, error.message);
        });
    });
  },

  // Verificar autenticación
  checkAuthentication: function() {
    console.log('🔐 Verificando autenticación...');

    const checks = {
      authToken: !!localStorage.getItem('authToken'),
      userData: !!localStorage.getItem('userData'),
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      empresaId: !!localStorage.getItem('empresaId')
    };

    console.table(checks);

    if (checks.userData) {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('👤 Datos del usuario:', userData);
        console.log('🔍 empresaId presente:', !!userData.empresaId);
      } catch (e) {
        console.error('❌ Error parseando userData:', e);
      }
    }

    return checks;
  },

  // Verificar conectividad WebSocket
  checkWebSocket: function() {
    console.log('🔗 Verificando WebSocket...');

    const wsUrl = process.env.REACT_APP_WS_URL || 'wss://transyncbackend-production.up.railway.app';
    console.log('WebSocket URL:', wsUrl);

    // Intentar conectar para verificar
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('✅ WebSocket conectado exitosamente');
      socket.close();
    };

    socket.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
    };

    setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket no pudo conectar');
        socket.close();
      }
    }, 5000);
  },

  // Verificar API backend
  checkBackendAPI: function() {
    console.log('🌐 Verificando API backend...');

    const apiUrl = process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app';

    fetch(`${apiUrl}/api/health`)
      .then(response => {
        console.log('✅ API Health:', {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });
        return response.json();
      })
      .then(data => {
        console.log('📊 Health Data:', data);
      })
      .catch(error => {
        console.error('❌ API Health Error:', error);
      });
  },

  // Ejecutar todas las verificaciones
  runAllChecks: function() {
    console.log('🚀 Iniciando diagnóstico completo...');
    this.checkCriticalFiles();
    this.checkAuthentication();
    this.checkWebSocket();
    this.checkBackendAPI();

    setTimeout(() => {
      console.log('✅ Diagnóstico completado. Revisa los resultados arriba.');
    }, 3000);
  }
};

// Ejecutar automáticamente
window.deploymentDiagnostics.runAllChecks();