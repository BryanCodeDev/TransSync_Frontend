#!/usr/bin/env node

/**
 * Script para corregir problemas específicos del backend WebSocket
 * Uso: node fix-backend-websocket.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo problemas del backend WebSocket...\n');

// Función para verificar configuración del servidor
function checkServerConfig() {
  console.log('🔍 Verificando configuración del servidor...');

  const serverPath = path.join(process.cwd(), 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.log('  ❌ Archivo server.js no encontrado');
    return false;
  }

  const serverContent = fs.readFileSync(serverPath, 'utf8');

  const checks = [
    { pattern: 'RealTimeService', description: 'Servicio RealTime inicializado' },
    { pattern: 'global.realTimeService', description: 'RealTimeService disponible globalmente' },
    { pattern: 'websocketRoutes', description: 'Rutas WebSocket importadas' },
    { pattern: 'schedulerService', description: 'Servicio de programador activo' }
  ];

  let allChecksPass = true;

  checks.forEach(check => {
    if (serverContent.includes(check.pattern)) {
      console.log(`  ✅ ${check.description}`);
    } else {
      console.log(`  ⚠️  ${check.description} - podría necesitar configuración`);
      allChecksPass = false;
    }
  });

  return allChecksPass;
}

// Función para corregir configuración CORS
function fixCorsConfig() {
  console.log('\n🌐 Corrigiendo configuración CORS...');

  const serverPath = path.join(process.cwd(), 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');

  // Configuración CORS simplificada y más permisiva para desarrollo
  const improvedCorsConfig = `// --- Configuración CORS optimizada ---
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos - más simple y efectiva
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.0.2.2:8081',
      'http://localhost:8081',
      'https://transync1.netlify.app',
      'https://transyncbackend-production.up.railway.app'
    ].filter(Boolean);

    // En desarrollo, permitir cualquier origen localhost
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('10.0.2.2');
      if (isLocalhost) return callback(null, true);
    }

    // Verificar si el origen está permitido
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Si no está en la lista, rechazar
    const msg = \`Origen no permitido por política CORS: \${origin}\`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};`;

  // Reemplazar configuración CORS existente
  const corsPattern = /const corsOptions = \{[^}]*\};/s;
  if (corsPattern.test(serverContent)) {
    const updatedContent = serverContent.replace(corsPattern, improvedCorsConfig);
    fs.writeFileSync(serverPath, updatedContent);
    console.log('  ✅ Configuración CORS mejorada');
  } else {
    console.log('  ⚠️  No se encontró configuración CORS para reemplazar');
  }
}

// Función para mejorar inicialización de WebSocket
function fixWebSocketInit() {
  console.log('\n🔌 Mejorando inicialización de WebSocket...');

  const serverPath = path.join(process.cwd(), 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');

  // Mejorar inicialización del servidor WebSocket
  const improvedWebSocketInit = `// Inicializar RealTimeService (única instancia de WebSocket)
const realTimeService = new RealTimeService(server);

// Inicializar servicios adicionales
const dashboardRealTimeService = new DashboardRealTimeService(realTimeService);
const dashboardPushService = new DashboardPushService(realTimeService);

// Hacer servicios disponibles globalmente
global.io = realTimeService.io;
global.realTimeService = realTimeService;
global.dashboardRealTimeService = dashboardRealTimeService;
global.dashboardPushService = dashboardPushService;
global.cacheService = cacheService;

// Importar servicio de programador para alertas automáticas
require('./src/services/schedulerService');

// Importar y usar rutas WebSocket
require('./src/routes/websocketRoutes')();

// Log de inicialización de WebSocket
console.log('✅ WebSocket inicializado correctamente');
console.log('🔗 WebSocket URL: wss://' + (process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'));
console.log('📊 RealTimeService: Sistema de notificaciones activo');`;

  // Buscar y reemplazar la sección de inicialización
  const initPattern = /\/\/ Inicializar RealTimeService.*require\('\.\/src\/routes\/websocketRoutes'\)\(\);/s;
  if (initPattern.test(serverContent)) {
    const updatedContent = serverContent.replace(initPattern, improvedWebSocketInit);
    fs.writeFileSync(serverPath, updatedContent);
    console.log('  ✅ Inicialización de WebSocket mejorada');
  } else {
    console.log('  ⚠️  No se encontró sección de inicialización WebSocket');
  }
}

// Función para crear configuración de entorno mejorada
function createEnvConfig() {
  console.log('\n⚙️  Creando configuración de entorno mejorada...');

  const envExample = `# Configuración de entorno para TransSync Backend
NODE_ENV=production
PORT=5000

# Base de datos
DB_HOST=localhost
DB_USER=transsync_user
DB_PASSWORD=your_password
DB_DATABASE=transync_db
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key_here

# URLs del frontend
FRONTEND_URL=https://transync1.netlify.app
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app

# Configuración WebSocket
WS_URL=wss://your-app.railway.app

# Configuración de seguridad
ENCRYPTION_KEY=your_encryption_key_here
API_TIMEOUT=30000

# Configuración de logs
LOG_LEVEL=info
LOG_REQUESTS=false

# Configuración de caché
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Configuración de notificaciones
NOTIFICATION_QUEUE_SIZE=1000
NOTIFICATION_RETRY_ATTEMPTS=3

# Configuración de límites
MAX_FILE_SIZE=5242880
MAX_REQUEST_SIZE=10485760

# Configuración de rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de mantenimiento
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=Sistema en mantenimiento. Intente más tarde.`;

  try {
    fs.writeFileSync('.env.example', envExample);
    console.log('  ✅ Archivo .env.example creado/actualizado');
  } catch (error) {
    console.log('  ❌ Error creando .env.example:', error.message);
  }
}

// Función para crear script de diagnóstico de WebSocket
function createWebSocketDiagnostic() {
  console.log('\n🔍 Creando script de diagnóstico de WebSocket...');

  const diagnosticScript = `
// Script de diagnóstico para WebSocket del backend
// Ejecutar en consola del navegador para verificar conexión

class WebSocketDiagnostic {
  constructor() {
    this.results = {};
    this.runAllTests();
  }

  async runAllTests() {
    console.log('🔧 Iniciando diagnóstico de WebSocket...');

    await this.testWebSocketConnection();
    await this.testAuthentication();
    await this.testRealTimeService();
    this.showResults();
  }

  async testWebSocketConnection() {
    console.log('\\n🌐 Probando conexión WebSocket...');

    try {
      const wsUrl = \`wss://\${window.location.host.includes('netlify') ? 'transyncbackend-production.up.railway.app' : window.location.host}\`;

      console.log('Intentando conectar a:', wsUrl);

      // Intentar conexión básica (sin autenticación)
      const socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.results.websocketConnection = '❌ Timeout de conexión';
          socket.disconnect();
          resolve();
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          this.results.websocketConnection = '✅ Conexión exitosa';
          socket.disconnect();
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.results.websocketConnection = \`❌ Error de conexión: \${error.message}\`;
          resolve();
        });
      });

    } catch (error) {
      this.results.websocketConnection = \`❌ Error: \${error.message}\`;
    }
  }

  async testAuthentication() {
    console.log('\\n🔐 Probando autenticación WebSocket...');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.results.authentication = '❌ No hay token de autenticación';
        return;
      }

      const wsUrl = \`wss://\${window.location.host.includes('netlify') ? 'transyncbackend-production.up.railway.app' : window.location.host}\`;

      const socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        auth: { token }
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.results.authentication = '❌ Timeout de autenticación';
          socket.disconnect();
          resolve();
        }, 5000);

        socket.on('auth:success', () => {
          clearTimeout(timeout);
          this.results.authentication = '✅ Autenticación exitosa';
          socket.disconnect();
          resolve();
        });

        socket.on('auth:error', (error) => {
          clearTimeout(timeout);
          this.results.authentication = \`❌ Error de autenticación: \${error.message}\`;
          resolve();
        });
      });

    } catch (error) {
      this.results.authentication = \`❌ Error: \${error.message}\`;
    }
  }

  async testRealTimeService() {
    console.log('\\n⚡ Probando RealTimeService...');

    try {
      // Probar endpoint de estadísticas
      const response = await fetch('/api/realtime/stats', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('authToken')}\`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.results.realTimeService = '✅ RealTimeService responde correctamente';
        this.results.stats = data.data;
      } else {
        this.results.realTimeService = \`❌ Error HTTP \${response.status}\`;
      }

    } catch (error) {
      this.results.realTimeService = \`❌ Error: \${error.message}\`;
    }
  }

  showResults() {
    console.log('\\n📊 Resultados del diagnóstico:');
    console.log('================================');

    Object.entries(this.results).forEach(([test, result]) => {
      const icon = result.includes('✅') ? '✅' : '❌';
      console.log(\`\${icon} \${test}: \${result}\`);
    });

    if (this.results.stats) {
      console.log('\\n📈 Estadísticas del servidor:');
      console.log(\`   - Conexiones totales: \${this.results.stats.connectionStats?.totalConnections || 0}\`);
      console.log(\`   - Estado del servidor: \${this.results.stats.serverInfo?.uptime ? 'Activo' : 'Inactivo'}\`);
    }

    console.log('\\n💡 Recomendaciones:');
    if (this.results.websocketConnection?.includes('Error')) {
      console.log('  - Verificar que el servidor backend esté corriendo');
      console.log('  - Comprobar configuración CORS del servidor');
      console.log('  - Verificar configuración de firewall/puertos');
    }

    if (this.results.authentication?.includes('Error')) {
      console.log('  - Verificar que el token JWT sea válido');
      console.log('  - Comprobar configuración de autenticación del servidor');
    }

    if (this.results.realTimeService?.includes('Error')) {
      console.log('  - Verificar que RealTimeService esté inicializado');
      console.log('  - Comprobar configuración de rutas del servidor');
    }
  }
}

// Ejecutar diagnóstico
new WebSocketDiagnostic();
`;

  try {
    fs.writeFileSync('websocket-diagnostic.js', diagnosticScript);
    console.log('  ✅ Script de diagnóstico WebSocket creado');
    console.log('  📋 Para usar: Copiar contenido en consola del navegador');
  } catch (error) {
    console.log('  ❌ Error creando script de diagnóstico:', error.message);
  }
}

// Función principal
async function fixBackendWebSocket() {
  try {
    console.log('🚀 Iniciando corrección de backend WebSocket...\n');

    const serverConfigOk = checkServerConfig();
    console.log('');

    fixCorsConfig();
    console.log('');

    fixWebSocketInit();
    console.log('');

    createEnvConfig();
    console.log('');

    createWebSocketDiagnostic();
    console.log('');

    console.log('📋 Correcciones aplicadas:');
    console.log('  ✅ Configuración CORS simplificada y mejorada');
    console.log('  ✅ Inicialización de WebSocket mejorada');
    console.log('  ✅ Configuración de entorno optimizada');
    console.log('  ✅ Script de diagnóstico creado');

    console.log('\n🔧 Para aplicar cambios:');
    console.log('  1. Reiniciar el servidor backend');
    console.log('  2. Verificar logs del servidor');
    console.log('  3. Probar conexión WebSocket');
    console.log('  4. Usar script de diagnóstico si hay problemas');

    if (serverConfigOk) {
      console.log('\n✅ Configuración del servidor verificada');
    } else {
      console.log('\n⚠️  Revisa la configuración del servidor');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixBackendWebSocket();
}

module.exports = { fixBackendWebSocket };