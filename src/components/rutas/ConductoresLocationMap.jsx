import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Filter,
  RefreshCw
} from 'lucide-react';
import EnhancedMap from './EnhancedMap';
import locationAPI from '../../utilidades/locationAPI';
import realTimeService from '../../utilidades/realTimeService';
import { useAuthContext } from '../../context/AuthContext';

const ConductoresLocationMap = ({
  className = "",
  height = "400px",
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 segundos
}) => {
  const { user } = useAuthContext();

  // Estados
  const [conductoresLocations, setConductoresLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [totalConductores, setTotalConductores] = useState(0);

  // Usar totalConductores en las estadísticas
  const activeStats = {
    total: totalConductores,
    activos: conductoresLocations.filter(c => c.isActive).length,
    actualizados: conductoresLocations.filter(c => {
      if (!c.lastUpdate) return false;
      const minutos = (new Date() - new Date(c.lastUpdate)) / (1000 * 60);
      return minutos <= 5;
    }).length
  };
  const [filters, setFilters] = useState({
    activos: true,
    rutaId: '',
    tiempo: 60 // minutos
  });


  // Cargar ubicaciones de conductores
  const loadConductoresLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await locationAPI.getAllConductoresLocations({
        empresaId: user?.idEmpresa,
        activos: filters.activos ? true : undefined,
        rutaId: filters.rutaId || undefined
      });

      setConductoresLocations(response || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando ubicaciones de conductores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.idEmpresa, filters]);

  // Configurar listeners de tiempo real
  useEffect(() => {
    const handleLocationUpdate = (data) => {
      console.log('📍 Actualización de ubicación recibida:', data);

      setConductoresLocations(prev => {
        const existingIndex = prev.findIndex(c => c.conductorId === data.conductorId);

        if (existingIndex >= 0) {
          // Actualizar ubicación existente
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...data.location,
            lastUpdate: new Date(),
            isActive: true
          };
          return updated;
        } else {
          // Agregar nueva ubicación
          return [...prev, {
            conductorId: data.conductorId,
            ...data.location,
            lastUpdate: new Date(),
            isActive: true
          }];
        }
      });

      setLastUpdate(new Date());
    };

    const handleTrackingStarted = (data) => {
      console.log('🎯 Conductor inició seguimiento:', data);
      setConductoresLocations(prev =>
        prev.map(c =>
          c.conductorId === data.conductorId
            ? { ...c, isActive: true, lastUpdate: new Date() }
            : c
        )
      );
    };

    const handleTrackingStopped = (data) => {
      console.log('⏹️ Conductor detuvo seguimiento:', data);
      setConductoresLocations(prev =>
        prev.map(c =>
          c.conductorId === data.conductorId
            ? { ...c, isActive: false }
            : c
        )
      );
    };

    const handleConductorEntered = (data) => {
      console.log('🚪 Conductor entró al sistema:', data);

      // Agregar conductor a la lista si no existe
      setConductoresLocations(prev => {
        const exists = prev.find(c => c.conductorId === data.conductorId);
        if (!exists) {
          return [...prev, {
            conductorId: data.conductorId,
            nomConductor: data.userInfo?.name || `Conductor ${data.conductorId}`,
            isActive: false,
            lastUpdate: new Date(),
            estConductor: 'ACTIVO'
          }];
        }
        return prev;
      });

      setTotalConductores(prev => prev + 1);
    };

    const handleConductorLeft = (data) => {
      console.log('🚪 Conductor salió del sistema:', data);

      // Marcar conductor como inactivo
      setConductoresLocations(prev =>
        prev.map(c =>
          c.conductorId === data.conductorId
            ? { ...c, isActive: false, estConductor: 'INACTIVO' }
            : c
        )
      );

      setTotalConductores(prev => Math.max(0, prev - 1));
    };

    const handleMapLocationUpdate = (data) => {
      // Manejar actualizaciones específicas del mapa
      if (data.type === 'conductor_location') {
        handleLocationUpdate(data);
      }
    };

    const handleBulkUpdate = (data) => {
      console.log('📍 Actualización masiva recibida:', data);
      if (data.locations && Array.isArray(data.locations)) {
        setConductoresLocations(data.locations.map(location => ({
          ...location,
          lastUpdate: new Date(),
          isActive: true
        })));
        setLastUpdate(new Date());
      }
    };

    // Suscribirse a eventos
    realTimeService.on('conductor:location:update', handleLocationUpdate);
    realTimeService.on('conductor:tracking:started', handleTrackingStarted);
    realTimeService.on('conductor:tracking:stopped', handleTrackingStopped);
    realTimeService.on('conductor:entered', handleConductorEntered);
    realTimeService.on('conductor:left', handleConductorLeft);
    realTimeService.on('map:location:update', handleMapLocationUpdate);
    realTimeService.on('conductores:locations:update', handleBulkUpdate);

    // Suscribirse a ubicaciones de la empresa
    realTimeService.subscribeToAllConductoresLocations();

    return () => {
      // Desuscribirse de eventos
      realTimeService.off('conductor:location:update', handleLocationUpdate);
      realTimeService.off('conductor:tracking:started', handleTrackingStarted);
      realTimeService.off('conductor:tracking:stopped', handleTrackingStopped);
      realTimeService.off('conductor:entered', handleConductorEntered);
      realTimeService.off('conductor:left', handleConductorLeft);
      realTimeService.off('map:location:update', handleMapLocationUpdate);
      realTimeService.off('conductores:locations:update', handleBulkUpdate);
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadConductoresLocations();
  }, [loadConductoresLocations]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadConductoresLocations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadConductoresLocations]);

  // Preparar datos para el mapa
  const mapConductores = conductoresLocations.map(conductor => ({
    idVehiculo: conductor.conductorId,
    lat: conductor.lat,
    lng: conductor.lng,
    estVehiculo: conductor.isActive ? 'EN_RUTA' : 'DISPONIBLE',
    nomConductor: conductor.nomConductor || `Conductor ${conductor.conductorId}`,
    speed: conductor.speed,
    lastUpdate: conductor.lastUpdate,
    accuracy: conductor.accuracy
  }));

  // Función para formatear tiempo relativo
  const formatRelativeTime = (date) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diff = now - new Date(date);
    const minutos = Math.floor(diff / (1000 * 60));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m atrás`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;

    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              Ubicación de Conductores
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Última actualización: {formatRelativeTime(lastUpdate)}
              </span>
            )}

            <button
              onClick={loadConductoresLocations}
              disabled={loading}
              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar ubicaciones"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {activeStats.total}
            </div>
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Total
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-success-600 dark:text-success-400">
              {activeStats.activos}
            </div>
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Activos
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-info-600 dark:text-info-400">
              {activeStats.actualizados}
            </div>
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              En línea
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
            <Filter className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.activos}
                onChange={(e) => setFilters(prev => ({ ...prev, activos: e.target.checked }))}
                className="rounded border-border-light dark:border-border-dark"
              />
              <span className="text-text-primary-light dark:text-text-primary-dark">
                Solo activos
              </span>
            </label>

            <select
              value={filters.tiempo}
              onChange={(e) => setFilters(prev => ({ ...prev, tiempo: parseInt(e.target.value) }))}
              className="text-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded px-2 py-1 text-text-primary-light dark:text-text-primary-dark"
            >
              <option value={15}>Últimos 15 min</option>
              <option value={30}>Últimos 30 min</option>
              <option value={60}>Última hora</option>
              <option value={240}>Últimas 4 horas</option>
            </select>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{ height }} className="relative">
        {error ? (
          <div className="flex items-center justify-center h-full text-error-600 dark:text-error-400">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Error al cargar ubicaciones</p>
              <p className="text-sm text-error-500 dark:text-error-400 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <EnhancedMap
            buses={mapConductores}
            showUserLocation={false}
            showRoutes={false}
            showStops={false}
            showBuses={true}
            onBusClick={(conductor) => setSelectedConductor(conductor)}
            height="100%"
          />
        )}
      </div>

      {/* Información del conductor seleccionado */}
      {selectedConductor && (
        <div className="p-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              {selectedConductor.nomConductor}
            </h4>
            <button
              onClick={() => setSelectedConductor(null)}
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Estado:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                selectedConductor.estVehiculo === 'EN_RUTA'
                  ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                  : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
              }`}>
                {selectedConductor.estVehiculo === 'EN_RUTA' ? 'En ruta' : 'Disponible'}
              </span>
            </div>

            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Velocidad:</span>
              <span className="ml-2 text-text-primary-light dark:text-text-primary-dark">
                {selectedConductor.speed ? `${selectedConductor.speed} km/h` : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Precisión:</span>
              <span className="ml-2 text-text-primary-light dark:text-text-primary-dark">
                {selectedConductor.accuracy ? `${Math.round(selectedConductor.accuracy)}m` : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Última actualización:</span>
              <span className="ml-2 text-text-primary-light dark:text-text-primary-dark">
                {selectedConductor.lastUpdate ? formatRelativeTime(selectedConductor.lastUpdate) : 'Nunca'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConductoresLocationMap;