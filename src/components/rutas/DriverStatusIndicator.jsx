import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Wifi,
  WifiOff,
  Activity,
  Clock,
  Users
} from 'lucide-react';
import realTimeService from '../../utilidades/realTimeService';
import { useAuthContext } from '../../context/AuthContext';

const DriverStatusIndicator = ({
  className = "",
  showDetails = true,
  compact = false
}) => {
  const { user } = useAuthContext();
  const [activeConductores, setActiveConductores] = useState(0);
  const [totalConductores, setTotalConductores] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Monitorear conexión WebSocket
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

  // Monitorear actividad de conductores
  useEffect(() => {
    const handleTrackingStarted = (data) => {
      setActiveConductores(prev => prev + 1);

      if (showDetails) {
        setRecentActivity(prev => [
          {
            type: 'tracking_started',
            conductorId: data.conductorId,
            timestamp: new Date(),
            message: 'Conductor inició seguimiento'
          },
          ...prev.slice(0, 4) // Mantener solo las últimas 5 actividades
        ]);
      }
    };

    const handleTrackingStopped = (data) => {
      setActiveConductores(prev => Math.max(0, prev - 1));

      if (showDetails) {
        setRecentActivity(prev => [
          {
            type: 'tracking_stopped',
            conductorId: data.conductorId,
            timestamp: new Date(),
            message: 'Conductor detuvo seguimiento'
          },
          ...prev.slice(0, 4)
        ]);
      }
    };

    const handleLocationUpdate = (data) => {
      if (showDetails) {
        setRecentActivity(prev => [
          {
            type: 'location_update',
            conductorId: data.conductorId,
            timestamp: new Date(),
            message: 'Nueva ubicación recibida'
          },
          ...prev.slice(0, 4)
        ]);
      }
    };

    const handleConductorEntered = (data) => {
      setTotalConductores(prev => prev + 1);

      if (showDetails) {
        setRecentActivity(prev => [
          {
            type: 'conductor_entered',
            conductorId: data.conductorId,
            timestamp: new Date(),
            message: 'Conductor entró al sistema'
          },
          ...prev.slice(0, 4)
        ]);
      }
    };

    const handleConductorLeft = (data) => {
      setTotalConductores(prev => Math.max(0, prev - 1));

      if (showDetails) {
        setRecentActivity(prev => [
          {
            type: 'conductor_left',
            conductorId: data.conductorId,
            timestamp: new Date(),
            message: 'Conductor salió del sistema'
          },
          ...prev.slice(0, 4)
        ]);
      }
    };

    // Suscribirse a eventos
    realTimeService.on('conductor:tracking:started', handleTrackingStarted);
    realTimeService.on('conductor:tracking:stopped', handleTrackingStopped);
    realTimeService.on('conductor:location:update', handleLocationUpdate);
    realTimeService.on('conductor:entered', handleConductorEntered);
    realTimeService.on('conductor:left', handleConductorLeft);

    return () => {
      realTimeService.off('conductor:tracking:started', handleTrackingStarted);
      realTimeService.off('conductor:tracking:stopped', handleTrackingStopped);
      realTimeService.off('conductor:location:update', handleLocationUpdate);
      realTimeService.off('conductor:entered', handleConductorEntered);
      realTimeService.off('conductor:left', handleConductorLeft);
    };
  }, [showDetails]);

  // Función para formatear tiempo relativo
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutos = Math.floor(diff / (1000 * 60));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m atrás`;

    const horas = Math.floor(minutos / 60);
    return `${horas}h atrás`;
  };

  // Función para obtener ícono de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case 'tracking_started':
        return <Navigation className="w-3 h-3 text-success-600" />;
      case 'tracking_stopped':
        return <MapPin className="w-3 h-3 text-secondary-600" />;
      case 'location_update':
        return <Activity className="w-3 h-3 text-primary-600" />;
      case 'conductor_entered':
        return <Users className="w-3 h-3 text-info-600" />;
      case 'conductor_left':
        return <Users className="w-3 h-3 text-text-secondary-light" />;
      default:
        return <Activity className="w-3 h-3 text-text-secondary-light" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 ${isConnected ? 'text-success-600' : 'text-error-600'}`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-text-primary-light dark:text-text-primary-dark">
            {activeConductores} activos
          </span>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">
            / {totalConductores} total
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isConnected ? 'bg-success-100 dark:bg-success-900/30' : 'bg-error-100 dark:bg-error-900/30'}`}>
              {isConnected ? (
                <Wifi className="w-5 h-5 text-success-600 dark:text-success-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-error-600 dark:text-error-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
                Estado de Ubicación
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {isConnected ? 'Sistema conectado' : 'Sistema desconectado'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {activeConductores}
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Conductores activos
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div className="text-lg font-bold text-success-600 dark:text-success-400">
              {activeConductores}
            </div>
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Con ubicación activa
            </div>
          </div>

          <div className="text-center p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div className="text-lg font-bold text-info-600 dark:text-info-400">
              {totalConductores}
            </div>
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Total conectados
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        {showDetails && recentActivity.length > 0 && (
          <div>
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Actividad Reciente
            </h4>

            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-surface-light dark:bg-surface-dark rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary-light dark:text-text-primary-dark truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverStatusIndicator;