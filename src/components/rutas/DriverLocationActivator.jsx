import React, { useState, useEffect } from 'react';
import {
  Navigation,
  NavigationOff,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import locationAPI from '../../utilidades/locationAPI';
import realTimeService from '../../utilidades/realTimeService';
import { useAuthContext } from '../../context/AuthContext';

const DriverLocationActivator = ({
  className = "",
  showDetails = true,
  autoStart = false
}) => {
  const { user } = useAuthContext();
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Verificar conexión WebSocket
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(realTimeService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);

    realTimeService.on('connection:established', handleConnection);
    realTimeService.on('connection:lost', handleDisconnection);

    return () => {
      clearInterval(interval);
      realTimeService.off('connection:established', handleConnection);
      realTimeService.off('connection:lost', handleDisconnection);
    };
  }, []);

  // Auto-iniciar seguimiento si está habilitado
  useEffect(() => {
    if (autoStart && user && isConnected) {
      handleStartTracking();
    }
  }, [autoStart, user, isConnected]);

  // Función para enviar ubicación al servidor
  const sendLocationToServer = async (location) => {
    if (!user?.idUsuario) return;

    try {
      await locationAPI.sendLocation(location, user.idUsuario);
      console.log('✅ Ubicación enviada desde DriverLocationActivator:', location);
    } catch (error) {
      console.error('❌ Error enviando ubicación:', error);
    }
  };

  // Iniciar seguimiento de ubicación
  const handleStartTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador');
      return;
    }

    if (watchId) {
      handleStopTracking();
    }

    setLoading(true);
    setError(null);

    try {
      // Iniciar seguimiento en el servidor
      if (user?.idUsuario) {
        await locationAPI.startLocationTracking(user.idUsuario, 30);
        realTimeService.notifyTrackingStarted(user.idUsuario);
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed,
            heading: position.coords.heading
          };

          setCurrentLocation(location);
          setIsTracking(true);
          setLoading(false);

          // Enviar ubicación al servidor
          sendLocationToServer(location);

          // Emitir evento WebSocket para actualización en tiempo real
          realTimeService.sendLocationUpdate(location, user.idUsuario);
        },
        (error) => {
          console.error('Error en seguimiento de ubicación:', error);
          setError(getErrorMessage(error));
          setLoading(false);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000
        }
      );

      setWatchId(id);
    } catch (error) {
      console.error('Error iniciando seguimiento:', error);
      setError('Error al iniciar seguimiento de ubicación');
      setLoading(false);
    }
  };

  // Detener seguimiento de ubicación
  const handleStopTracking = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setIsTracking(false);
    setCurrentLocation(null);

    try {
      // Detener seguimiento en el servidor
      if (user?.idUsuario) {
        await locationAPI.stopLocationTracking(user.idUsuario);
        realTimeService.notifyTrackingStopped(user.idUsuario);
      }
    } catch (error) {
      console.error('Error deteniendo seguimiento:', error);
    }
  };

  // Función para obtener mensaje de error
  const getErrorMessage = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de geolocalización denegado. Habilite la ubicación en su navegador.';
      case error.POSITION_UNAVAILABLE:
        return 'Ubicación no disponible. Verifique su conexión GPS.';
      case error.TIMEOUT:
        return 'Tiempo agotado al obtener ubicación. Intente nuevamente.';
      default:
        return `Error de geolocalización: ${error.message}`;
    }
  };

  // Función para formatear coordenadas
  const formatCoordinates = (lat, lng) => {
    if (!lat || !lng) return 'N/A';
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Función para formatear precisión
  const formatAccuracy = (accuracy) => {
    if (!accuracy) return 'N/A';
    if (accuracy < 1000) {
      return `${Math.round(accuracy)}m`;
    }
    return `${(accuracy / 1000).toFixed(1)}km`;
  };

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isTracking ? 'bg-success-100 dark:bg-success-900/30' : 'bg-surface-light dark:bg-surface-dark'}`}>
              {isTracking ? (
                <Navigation className="w-5 h-5 text-success-600 dark:text-success-400" />
              ) : (
                <MapPin className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
                {isTracking ? 'Ubicación Activa' : 'Activar Ubicación'}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 ${isConnected ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {isTracking && (
                  <span className="text-primary-600 dark:text-primary-400">
                    • Enviando ubicación
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={isTracking ? handleStopTracking : handleStartTracking}
            disabled={loading || !isConnected}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center ${
              isTracking
                ? 'bg-secondary-600 hover:bg-secondary-700 text-white'
                : 'bg-success-600 hover:bg-success-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isTracking ? 'Deteniendo...' : 'Iniciando...'}
              </>
            ) : isTracking ? (
              <>
                <NavigationOff className="w-4 h-4" />
                Detener
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Activar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border-l-4 border-error-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800 dark:text-error-300">
                Error de ubicación
              </p>
              <p className="text-sm text-error-700 dark:text-error-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información detallada */}
      {showDetails && currentLocation && (
        <div className="p-4 bg-surface-light dark:bg-surface-dark">
          <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            Información de Ubicación
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Coordenadas:
              </span>
              <span className="font-mono text-text-primary-light dark:text-text-primary-dark">
                {formatCoordinates(currentLocation.lat, currentLocation.lng)}
              </span>
            </div>

            {currentLocation.accuracy && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  Precisión:
                </span>
                <span className="text-text-primary-light dark:text-text-primary-dark">
                  {formatAccuracy(currentLocation.accuracy)}
                </span>
              </div>
            )}

            {currentLocation.speed && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  Velocidad:
                </span>
                <span className="text-text-primary-light dark:text-text-primary-dark">
                  {Math.round(currentLocation.speed)} km/h
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Última actualización:
              </span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {new Date(currentLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Indicador de actividad */}
          <div className="mt-3 flex items-center gap-2 text-sm text-success-700 dark:text-success-300">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span>Ubicación activa - Visible para gestores</span>
          </div>
        </div>
      )}

      {/* Información cuando no está activo */}
      {showDetails && !isTracking && !error && (
        <div className="p-4 bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <MapPin className="w-4 h-4" />
            <span>Active el seguimiento para compartir su ubicación con los gestores</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverLocationActivator;