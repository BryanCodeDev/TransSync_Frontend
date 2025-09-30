import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import authAPI from '../utilidades/authAPI';

const ErrorRecovery = ({ error, onRetry }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryLog, setRecoveryLog] = useState([]);

  // Función para agregar entrada al log de recuperación
  const addToLog = (message, type = 'info') => {
    setRecoveryLog(prev => [...prev.slice(-4), {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Función de recuperación automática mejorada
  const attemptAutoRecovery = useCallback(async () => {
    setIsRecovering(true);
    addToLog(`Iniciando recuperación automática (intento ${recoveryAttempts + 1}/3)`, 'info');

    // Detectar tipo de error
    const getErrorType = () => {
      if (error?.includes('No user after sign in') || error?.includes('empresaId')) {
        return 'auth';
      }
      if (error?.includes('Unexpected token') || error?.includes('SyntaxError')) {
        return 'chunk';
      }
      if (error?.includes('Network Error') || error?.includes('fetch')) {
        return 'network';
      }
      if (error?.includes('403') || error?.includes('Forbidden')) {
        return 'permission';
      }
      return 'unknown';
    };

    try {
      const errorType = getErrorType();

      switch (errorType) {
        case 'auth':
          addToLog('Recuperando datos de autenticación...', 'info');
          // Intentar recuperar datos de usuario
          const userData = authAPI.getCurrentUser();
          if (!userData || !userData.empresaId) {
            addToLog('Datos de usuario incompletos, intentando recargar perfil...', 'warning');
            // Intentar recargar datos de autenticación
            try {
              await authAPI.getProfile();
              addToLog('Perfil recargado exitosamente', 'success');
            } catch (profileError) {
              addToLog('Error recargando perfil: ' + profileError.message, 'error');
            }
          } else {
            addToLog('Datos de usuario válidos encontrados', 'success');
          }
          break;

        case 'chunk':
          addToLog('Limpiando cache de chunks problemáticos...', 'info');
          // Limpiar cache de chunks problemáticos
          if ('caches' in window) {
            try {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
              addToLog('Cache limpiado exitosamente', 'success');
            } catch (cacheError) {
              addToLog('Error limpiando cache: ' + cacheError.message, 'error');
            }
          }
          // Recargar página después de limpiar cache
          setTimeout(() => {
            addToLog('Recargando página...', 'info');
            window.location.reload();
          }, 1000);
          return;

        case 'network':
          addToLog('Verificando conexión de red...', 'info');
          // Verificar conexión
          try {
            const response = await fetch('/favicon.ico', { method: 'HEAD', timeout: 5000 });
            if (response.ok) {
              addToLog('Conexión verificada correctamente', 'success');
            } else {
              addToLog('Problema de conexión detectado', 'error');
            }
          } catch (networkError) {
            addToLog('Sin conexión a internet', 'error');
          }
          break;

        case 'permission':
          addToLog('Verificando permisos de usuario...', 'info');
          // Verificar permisos de usuario
          const currentUser = authAPI.getCurrentUser();
          if (currentUser && currentUser.empresaId) {
            addToLog(`Usuario tiene empresaId: ${currentUser.empresaId}`, 'success');
          } else {
            addToLog('Usuario no tiene empresaId válido', 'error');
          }
          break;

        default:
          addToLog('Tipo de error desconocido, intentando recuperación general...', 'warning');
          break;
      }

      setRecoveryAttempts(prev => prev + 1);

      // Si tenemos datos válidos después de la recuperación, intentar reintentar
      if (errorType === 'auth') {
        const recoveredUser = authAPI.getCurrentUser();
        if (recoveredUser && recoveredUser.empresaId) {
          addToLog('Datos de usuario válidos, reintentando operación...', 'success');
          setTimeout(() => onRetry(), 1000);
          return;
        }
      }

    } catch (recoveryError) {
      addToLog('Error durante recuperación automática: ' + recoveryError.message, 'error');
    } finally {
      setIsRecovering(false);
    }
  }, [recoveryAttempts, onRetry, error]);

  // Función de recuperación manual
  const handleRecovery = async () => {
    await attemptAutoRecovery();
  };

  const getErrorInfo = () => {
    if (error?.includes('No user after sign in')) {
      return {
        title: 'Error de Autenticación',
        message: 'Los datos del usuario se han perdido. Intentaremos recuperarlos automáticamente.',
        icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
        color: 'red'
      };
    } else if (error?.includes('Unexpected token')) {
      return {
        title: 'Error de Archivos Estáticos',
        message: 'Los archivos JavaScript/CSS no se están cargando correctamente. Limpiando cache...',
        icon: <WifiOff className="w-8 h-8 text-orange-500" />,
        color: 'orange'
      };
    } else if (error?.includes('empresaId')) {
      return {
        title: 'Error de Empresa',
        message: 'No se pudo obtener el ID de empresa. Verificando permisos...',
        icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
        color: 'yellow'
      };
    } else {
      return {
        title: 'Error General',
        message: 'Ha ocurrido un error inesperado. Intentando recuperar...',
        icon: <RefreshCw className="w-8 h-8 text-blue-500" />,
        color: 'blue'
      };
    }
  };

  const errorInfo = getErrorInfo();

  // Intentar recuperación automática al montar el componente
  useEffect(() => {
    if (recoveryAttempts < 3) {
      const timer = setTimeout(attemptAutoRecovery, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, recoveryAttempts, attemptAutoRecovery]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      default:
        return <div className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-background-light dark:bg-background-dark">
      <div className="text-center max-w-md">
        {errorInfo.icon}

        <h2 className={`text-xl font-semibold mt-4 mb-2 text-${errorInfo.color}-700 dark:text-${errorInfo.color}-400`}>
          {errorInfo.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {errorInfo.message}
        </p>

        {isRecovering && (
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Recuperando... Intento {recoveryAttempts + 1}/3
            </span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRecovery}
            disabled={isRecovering}
            className={`w-full px-6 py-3 bg-${errorInfo.color}-600 text-white rounded-lg hover:bg-${errorInfo.color}-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {isRecovering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recuperando...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                Intentar Recuperación Automática
              </>
            )}
          </button>

          {recoveryAttempts >= 3 && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Recargar Página
            </button>
          )}
        </div>

        {/* Log de recuperación */}
        {recoveryLog.length > 0 && (
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Log de Recuperación:
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recoveryLog.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {getLogIcon(entry.type)}
                  <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                    {entry.timestamp}:
                  </span>
                  <span className={`flex-1 truncate ${
                    entry.type === 'error' ? 'text-red-600 dark:text-red-400' :
                    entry.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    entry.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Detalles del Error
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
            {error}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default ErrorRecovery;