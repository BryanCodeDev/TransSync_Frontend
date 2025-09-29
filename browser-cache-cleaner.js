// Script para limpiar cache del navegador
// Ejecutar en consola del navegador: copy and paste el contenido

const clearBrowserCache = () => {
  console.log('🧹 Limpiando cache del navegador...');

  // Limpiar service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('✅ Service Worker eliminado');
      });
    });
  }

  // Limpiar cache storage
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('✅ Cache eliminado:', name);
      });
    });
  }

  // Limpiar localStorage
  localStorage.clear();
  sessionStorage.clear();

  // Limpiar cookies
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });

  console.log('✅ Cache del navegador limpiado');
  console.log('🔄 Recargando página...');
  window.location.reload(true);
};

// Ejecutar automáticamente
clearBrowserCache();