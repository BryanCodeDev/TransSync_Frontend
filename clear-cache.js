// Script para limpiar cache del navegador y service workers
const clearCache = async () => {
  console.log('🧹 Limpiando cache del navegador...');

  // Limpiar cache storage
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('✅ Cache storage limpiado');
  }

  // Limpiar localStorage
  localStorage.clear();
  console.log('✅ localStorage limpiado');

  // Limpiar sessionStorage
  sessionStorage.clear();
  console.log('✅ sessionStorage limpiado');

  // Limpiar cookies relacionadas con la aplicación
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    if (name.trim().includes('transsync') || name.trim().includes('react')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  });
  console.log('✅ Cookies limpiadas');

  // Forzar recarga de la página
  console.log('🔄 Recargando página...');
  window.location.reload(true);
};

// Ejecutar limpieza
if (typeof window !== 'undefined') {
  clearCache();
}