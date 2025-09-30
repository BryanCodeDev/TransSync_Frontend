// ✅ CORRECCIÓN CRÍTICA: Script para corregir problemas de despliegue
// Ejecutar este script en el navegador para limpiar cache y recargar archivos

(function() {
  console.log('🔧 Iniciando corrección de problemas de despliegue...');

  // 1. Limpiar cache del navegador
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('🗑️ Cache eliminado:', name);
      });
    });
  }

  // 2. Limpiar localStorage problemático
  const keysToRemove = [
    'authToken', 'userToken', 'userData', 'isAuthenticated',
    'userName', 'userRole', 'userEmail', 'userId', 'empresaId'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // 3. Forzar recarga de archivos estáticos
  const timestamp = new Date().getTime();
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    if (args[0].includes('.js') || args[0].includes('.css')) {
      const url = new URL(args[0], location.origin);
      url.searchParams.set('v', timestamp);
      args[0] = url.toString();
      console.log('🔄 Recargando archivo con cache busting:', args[0]);
    }
    return originalFetch.apply(this, args);
  };

  // 4. Recargar página después de limpieza
  setTimeout(() => {
    console.log('✅ Limpieza completada, recargando página...');
    window.location.reload(true);
  }, 2000);

  console.log('🔧 Corrección de despliegue iniciada...');
})();