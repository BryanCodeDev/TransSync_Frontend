import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigation,
  Crosshair,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import locationAPI from '../../utilidades/locationAPI';
import { useAuthContext } from '../../context/AuthContext';

const UserLocation = ({
  onLocationUpdate,
  className = "",
  enableAutoSend = false,
  conductorId = null
}) => {
  useTranslation();
  const { user } = useAuthContext();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('unknown'); // unknown, requesting, success, error
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Opciones de geolocalización
  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutos
  };

  // Función para enviar ubicación al servidor
  const sendLocationToServer = async (location) => {
    if (!enableAutoSend || !conductorId || isSending) return;

    try {
      setIsSending(true);
      await locationAPI.sendLocation(location, conductorId);
      console.log('✅ Ubicación enviada al servidor:', location);
    } catch (error) {
      console.error('❌ Error enviando ubicación al servidor:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada en este navegador');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          heading: position.coords.heading
        };

        setUserLocation(location);
        setLocationStatus('success');
        onLocationUpdate?.(location);

        // Enviar ubicación al servidor si está habilitado
        if (enableAutoSend && conductorId) {
          sendLocationToServer(location);
        }
      },
      (error) => {
        let errorMessage = 'Error desconocido de geolocalización';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado. Habilite la ubicación en su navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Verifique su conexión GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo agotado al obtener ubicación. Intente nuevamente.';
            break;
          default:
            errorMessage = `Error de geolocalización: ${error.message}`;
        }

        setLocationError(errorMessage);
        setLocationStatus('error');
      },
      locationOptions
    );
  };

  // Función para iniciar seguimiento continuo
  const startLocationTracking = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada en este navegador');
      setLocationStatus('error');
      return;
    }

    if (watchId) {
      stopLocationTracking();
    }

    // Iniciar seguimiento en el servidor si es conductor
    if (enableAutoSend && conductorId) {
      try {
        await locationAPI.startLocationTracking(conductorId, 30); // 30 segundos de intervalo
        setIsTracking(true);
      } catch (error) {
        console.error('Error iniciando seguimiento en servidor:', error);
      }
    }

    setLocationStatus('requesting');

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

        setUserLocation(location);
        setLocationStatus('success');
        onLocationUpdate?.(location);

        // Enviar ubicación al servidor si está habilitado
        if (enableAutoSend && conductorId) {
          sendLocationToServer(location);
        }
      },
      (error) => {
        console.error('Error en seguimiento de ubicación:', error);
        setLocationStatus('error');
      },
      {
        ...locationOptions,
        enableHighAccuracy: true,
        maximumAge: 10000 // Actualizar más frecuentemente para seguimiento
      }
    );

    setWatchId(id);
  };

  // Función para detener seguimiento
  const stopLocationTracking = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    // Detener seguimiento en el servidor si es conductor
    if (enableAutoSend && conductorId && isTracking) {
      try {
        await locationAPI.stopLocationTracking(conductorId);
        setIsTracking(false);
      } catch (error) {
        console.error('Error deteniendo seguimiento en servidor:', error);
      }
    }
  };

  // Obtener ubicación inicial al montar el componente
  useEffect(() => {
    getCurrentLocation();

    // Cleanup al desmontar
    return () => {
      stopLocationTracking();
    };
  }, [getCurrentLocation, stopLocationTracking]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [watchId, stopLocationTracking]);

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'requesting':
        return <Loader2 className="w-4 h-4 animate-spin text-primary-600 dark:text-primary-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />;
      default:
        return <Crosshair className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />;
    }
  };

  const getStatusColor = () => {
    switch (locationStatus) {
      case 'requesting':
        return 'text-primary-600 dark:text-primary-400';
      case 'success':
        return 'text-success-600 dark:text-success-400';
      case 'error':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-text-secondary-light dark:text-text-secondary-dark';
    }
  };

  const formatAccuracy = (accuracy) => {
    if (!accuracy) return '';
    if (accuracy < 1000) {
      return `${Math.round(accuracy)}m`;
    }
    return `${(accuracy / 1000).toFixed(1)}km`;
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              Mi Ubicación
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {locationStatus === 'success' && 'Ubicación detectada correctamente'}
              {locationStatus === 'requesting' && 'Obteniendo ubicación...'}
              {locationStatus === 'error' && 'Error al obtener ubicación'}
              {locationStatus === 'unknown' && 'Ubicación desconocida'}
            </p>
          </div>
        </div>
      </div>

      {/* Información de ubicación */}
      {locationStatus === 'success' && userLocation && (
        <div className="p-4 bg-surface-light dark:bg-surface-dark">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Coordenadas:
              </span>
              <span className="text-sm font-mono text-text-primary-light dark:text-text-primary-dark">
                {formatCoordinates(userLocation.lat, userLocation.lng)}
              </span>
            </div>

            {userLocation.accuracy && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Precisión:
                </span>
                <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {formatAccuracy(userLocation.accuracy)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Última actualización:
              </span>
              <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {new Date(userLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {locationStatus === 'error' && locationError && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border-l-4 border-error-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error-800 dark:text-error-300">
                Error de ubicación
              </p>
              <p className="text-sm text-error-700 dark:text-error-400 mt-1">
                {locationError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            disabled={locationStatus === 'requesting'}
            className="flex-1 bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {locationStatus === 'requesting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Obteniendo...
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4" />
                Actualizar ubicación
              </>
            )}
          </button>

          <button
            onClick={watchId ? stopLocationTracking : startLocationTracking}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
              watchId
                ? 'bg-secondary-600 dark:bg-secondary-700 text-white hover:bg-secondary-700 dark:hover:bg-secondary-600'
                : 'bg-success-600 dark:bg-success-700 text-white hover:bg-success-700 dark:hover:bg-success-600'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {watchId ? 'Detener seguimiento' : 'Seguimiento continuo'}
          </button>
        </div>

        {/* Información de seguimiento */}
        {watchId && (
          <div className="mt-3 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-success-700 dark:text-success-300">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span>Seguimiento de ubicación activo</span>
              {enableAutoSend && conductorId && (
                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                  Enviando al servidor
                </span>
              )}
            </div>
            {isSending && (
              <div className="flex items-center gap-2 mt-2 text-xs text-primary-600 dark:text-primary-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enviando ubicación...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLocation;