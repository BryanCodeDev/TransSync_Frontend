import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authAPI from '../utilidades/authAPI';

const ErrorRecovery = ({ error, onRetry }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { recoverUserData } = useAuth();

  const handleRecovery = async () => {
    setIsRecovering(true);

    try {
      // 1. Intentar recuperar datos del usuario
      const userRecovered = await recoverUserData();

      if (userRecovered) {
        console.log('✅ Datos de usuario recuperados exitosamente');

        // 2. Limpiar cache del navegador
        if ('caches' in window) {
          await caches.keys().then(names => {
            return Promise.all(names.map(name => caches.delete(name)));
          });
          console.log('✅ Cache del navegador limpiado');
        }

        // 3. Recargar página
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return;
      }

      // Si no se pudieron recuperar los datos, intentar diagnóstico
      console.log('🔍 Ejecutando diagnóstico de conexión...');
      const diagnostics = await authAPI.diagnoseConnection();
      console.log('📊 Diagnóstico:', diagnostics);

      if (onRetry) {
        onRetry();
      }
    } catch (error) {
      console.error('❌ Error en recuperación:', error);
      if (onRetry) {
        onRetry();
      }
    } finally {
      setIsRecovering(false);
    }
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

          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Recargar Página
          </button>
        </div>

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