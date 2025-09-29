/**
 * Utilidades para manejar problemas de navegación post-Netlify
 */

// Limpiar cache y datos problemáticos
export const clearNavigationCache = () => {
  try {
    // Limpiar service workers si existen
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }

    // Limpiar cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Limpiar localStorage items problemáticos
    const keysToRemove = [
      'authToken', 'userToken', 'userData', 'isAuthenticated',
      'userName', 'userRole', 'userEmail', 'userId'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Navigation cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing navigation cache:', error);
    return false;
  }
};

// Verificar si hay problemas de navegación comunes
export const diagnoseNavigationIssues = () => {
  const issues = [];

  try {
    // Verificar si hay tokens sin datos de usuario
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    const isAuth = localStorage.getItem('isAuthenticated');

    if (token && isAuth === 'true' && !userData) {
      issues.push('Token sin datos de usuario');
    }

    // Verificar datos de usuario corruptos
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed.id || !parsed.email) {
          issues.push('Datos de usuario incompletos');
        }
      } catch (e) {
        issues.push('Datos de usuario corruptos (JSON inválido)');
      }
    }

    // Verificar problemas de rutas
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin') || currentPath.includes('/dashboard')) {
      if (!token) {
        issues.push('Acceso a ruta protegida sin token');
      }
    }

    // Verificar problemas de chunks
    const chunkErrors = sessionStorage.getItem('chunkLoadErrors');
    if (chunkErrors) {
      issues.push('Errores de carga de chunks detectados');
    }

  } catch (error) {
    issues.push('Error general en diagnóstico: ' + error.message);
  }

  return issues;
};

// Solucionar problemas de navegación automáticamente
export const fixNavigationIssues = async () => {
  console.log('🔧 Intentando solucionar problemas de navegación...');

  const issues = diagnoseNavigationIssues();

  if (issues.length === 0) {
    console.log('✅ No se detectaron problemas de navegación');
    return true;
  }

  console.log('⚠️ Problemas detectados:', issues);

  // Limpiar cache si hay problemas
  const cacheCleared = clearNavigationCache();

  // Si hay problemas de autenticación, redirigir al home
  if (issues.some(issue => issue.includes('token') || issue.includes('usuario'))) {
    console.log('🔄 Redirigiendo al home por problemas de autenticación');
    window.location.href = '/home';
    return true;
  }

  // Si hay errores de chunks, forzar recarga
  if (issues.some(issue => issue.includes('chunk'))) {
    console.log('🔄 Recargando página por errores de chunks');
    window.location.reload(true);
    return true;
  }

  // Recargar página después de limpiar cache
  if (cacheCleared) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  return cacheCleared;
};

// Hook para usar en componentes
export const useNavigationHealth = () => {
  const checkHealth = () => {
    const issues = diagnoseNavigationIssues();
    return {
      hasIssues: issues.length > 0,
      issues,
      fixIssues: fixNavigationIssues
    };
  };

  return { checkHealth };
};