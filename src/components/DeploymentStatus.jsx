import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import deploymentDiagnostics from '../utilidades/deploymentDiagnostics';

const DeploymentStatus = ({ className = '' }) => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkDeploymentStatus();
  }, []);

  const checkDeploymentStatus = async () => {
    try {
      setStatus('checking');

      // Verificación rápida de archivos críticos
      const criticalFiles = [
        '/static/js/main.ab6abfa2.js',
        '/manifest.json'
      ];

      let allFilesOk = true;

      for (const file of criticalFiles) {
        try {
          const response = await fetch(file, { method: 'HEAD' });
          if (!response.ok) {
            allFilesOk = false;
            break;
          }
        } catch (error) {
          allFilesOk = false;
          break;
        }
      }

      // Verificar autenticación básica
      const hasAuth = !!(
        localStorage.getItem('authToken') &&
        localStorage.getItem('userData') &&
        localStorage.getItem('empresaId')
      );

      if (allFilesOk && hasAuth) {
        setStatus('healthy');
        setDetails({ message: 'Sistema funcionando correctamente' });
      } else if (allFilesOk) {
        setStatus('warning');
        setDetails({ message: 'Archivos OK, verificar autenticación' });
      } else {
        setStatus('error');
        setDetails({ message: 'Problemas con archivos estáticos' });
      }

    } catch (error) {
      setStatus('error');
      setDetails({ message: 'Error verificando estado', error: error.message });
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: 'Sistema OK',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
          text: 'Verificar',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          text: 'Problemas',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-blue-500 animate-spin" />,
          text: 'Verificando...',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!isVisible && status === 'healthy') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg ${statusInfo.color}`}>
        {statusInfo.icon}
        <span className="text-sm font-medium">{statusInfo.text}</span>

        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-2 text-xs underline hover:no-underline"
        >
          {isVisible ? 'Ocultar' : 'Detalles'}
        </button>

        {status !== 'healthy' && (
          <button
            onClick={checkDeploymentStatus}
            className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded"
            title="Reintentar verificación"
          >
            <Activity className="w-3 h-3" />
          </button>
        )}
      </div>

      {isVisible && (
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-lg min-w-64">
          <h4 className="font-semibold mb-2">Estado del Despliegue</h4>

          {details && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {details.message}
            </p>
          )}

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Archivos estáticos:</span>
              <span className={status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                {status === 'healthy' ? '✅ OK' : '❌ Error'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Autenticación:</span>
              <span className={localStorage.getItem('empresaId') ? 'text-green-600' : 'text-red-600'}>
                {localStorage.getItem('empresaId') ? '✅ OK' : '❌ Error'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>WebSocket:</span>
              <span className="text-gray-500">Pendiente</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => deploymentDiagnostics.runFullDiagnostics()}
              className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Ejecutar Diagnóstico Completo
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => deploymentDiagnostics.clearAllCaches()}
                className="w-full text-xs bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
              >
                Limpiar Cache (Dev Only)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus;