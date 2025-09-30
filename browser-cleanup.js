
// Script para limpiar caché del navegador y datos problemáticos
// Ejecutar en consola del navegador (F12 -> Console)

console.log('🧹 Iniciando limpieza de datos del navegador...');

// Limpiar localStorage
const keysToRemove = [
  'authToken', 'userToken', 'token', 'userData', 'isAuthenticated',
  'userName', 'userRole', 'userEmail', 'userId', 'empresaId',
  'rememberedEmail', 'rememberMe'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies relacionadas
document.cookie.split(";").forEach(cookie => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

  // Solo eliminar cookies relacionadas con la aplicación
  if (name.includes('transsync') || name.includes('auth') || name.includes('user')) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    console.log('✅ Cookie eliminada:', name);
  }
});

// Forzar recarga de la página
console.log('🔄 Recargando página...');
window.location.reload(true);

console.log('🎉 ¡Limpieza completada!');
