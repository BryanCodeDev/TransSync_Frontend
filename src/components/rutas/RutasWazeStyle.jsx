import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bus,
  MapPin,
  Navigation,
  Route,
  X,
  Home,
  Users,
  Zap,
  Clock,
  Activity,
  Target,
  AlertCircle,
  RefreshCw,
  Menu,
  ChevronLeft
} from 'lucide-react';
import rutasAPI from '../../utilidades/rutasAPI';
import vehiculosAPI from '../../utilidades/vehiculosAPI';
import dashboardAPI from '../../utilidades/dashboardAPI';
import RouteSelector from './RouteSelector';
import NavigationPanel from './NavigationPanel';
import UserLocation from './UserLocation';
import EnhancedMap from './EnhancedMap';

const RutasWazeStyle = () => {
  useTranslation();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentNavigationStep, setCurrentNavigationStep] = useState(0);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [mapCenter, setMapCenter] = useState([4.6482, -74.0648]);
  const [mapZoom, setMapZoom] = useState(11);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyRoutes, setNearbyRoutes] = useState([]);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar rutas activas
      const routesData = await rutasAPI.getActive();
      setRoutes(routesData.rutas || []);

      // Cargar vehículos
      const vehiclesData = await vehiculosAPI.getAll();
      setBuses(vehiclesData.vehiculos || []);

      // Cargar paradas para cada ruta
      const stopsPromises = routesData.rutas?.map(route => rutasAPI.getStops(route.idRuta)) || [];
      const stopsResults = await Promise.allSettled(stopsPromises);

      const allStops = [];
      stopsResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allStops.push(...(result.value.paradas || []));
        }
      });
      setStops(allStops);

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos en tiempo real
  const refreshRealTimeData = async () => {
    try {
      setRefreshing(true);

      // Actualizar datos de buses en tiempo real
      const realTimeData = await dashboardAPI.getRealTimeData();
      if (realTimeData && realTimeData.buses) {
        setBuses(prevBuses => {
          return prevBuses.map(bus => {
            const realTimeBus = realTimeData.buses.find(rtb => rtb.idVehiculo === bus.idVehiculo);
            return realTimeBus ? { ...bus, ...realTimeBus } : bus;
          });
        });
      }

    } catch (err) {
      console.error('Error refreshing real-time data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Cargar rutas cercanas cuando tenemos ubicación del usuario
  const loadNearbyRoutes = async (location) => {
    try {
      const nearbyData = await rutasAPI.getNearbyRoutes(location.lat, location.lng, 10);
      setNearbyRoutes(nearbyData.rutas || []);
    } catch (err) {
      console.error('Error loading nearby routes:', err);
    }
  };

  // Manejar actualización de ubicación del usuario
  const handleLocationUpdate = (location) => {
    setUserLocation(location);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(14);

    // Cargar rutas cercanas
    loadNearbyRoutes(location);
  };

  // Manejar selección de ruta
  const handleRouteSelect = async (route) => {
    setSelectedRoute(route);

    // Registrar uso de la ruta
    await rutasAPI.registerRouteUsage(route.idRuta, userLocation);

    // Si tenemos ubicación del usuario, calcular distancia y ETA
    if (userLocation) {
      try {
        const etaData = await rutasAPI.getEstimatedArrival(route.idRuta, userLocation.lat, userLocation.lng);
        console.log('ETA calculada:', etaData);
      } catch (err) {
        console.error('Error calculando ETA:', err);
      }
    }
  };

  // Iniciar navegación
  const startNavigation = (route) => {
    setSelectedRoute(route);
    setIsNavigationActive(true);
    setCurrentNavigationStep(0);
    setSidebarOpen(false); // Cerrar sidebar para mostrar navegación
  };

  // Detener navegación
  const stopNavigation = () => {
    setIsNavigationActive(false);
    setCurrentNavigationStep(0);
  };

  // Cambiar paso de navegación
  const handleStepChange = (newStep) => {
    setCurrentNavigationStep(newStep);
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Estado de seguimiento de bus
  const [isTracking, setIsTracking] = useState(false);

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    if (bus.lat && bus.lng && !isNaN(bus.lat) && !isNaN(bus.lng)) {
      setMapCenter([bus.lat, bus.lng]);
      setMapZoom(15);
    }
  };

  const startTracking = (bus) => {
    setIsTracking(true);
    setSelectedBus(bus);

    const trackingInterval = setInterval(() => {
      setBuses(currentBuses => {
        const trackedBus = currentBuses.find(b => b.id === bus.id);
        if (trackedBus) {
          if (trackedBus.lat && trackedBus.lng && !isNaN(trackedBus.lat) && !isNaN(trackedBus.lng)) {
            setMapCenter([trackedBus.lat, trackedBus.lng]);
          }
        }
        return currentBuses;
      });
    }, 2000);

    setTimeout(() => {
      setIsTracking(false);
      clearInterval(trackingInterval);
    }, 30000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_RUTA': return '#10b981';
      case 'DISPONIBLE': return '#3b82f6';
      case 'EN_MANTENIMIENTO': return '#f59e0b';
      case 'FUERA_DE_SERVICIO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EN_RUTA': return 'En Ruta';
      case 'DISPONIBLE': return 'Disponible';
      case 'EN_MANTENIMIENTO': return 'Mantenimiento';
      case 'FUERA_DE_SERVICIO': return 'Fuera de Servicio';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600 dark:text-primary-400" />
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-error-600 dark:text-error-400" />
          <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header de Control */}
      <div className="bg-background-light dark:bg-background-dark shadow-sm border-b border-border-light dark:border-border-dark p-3 sm:p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                Rutas - Estilo Waze
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-warning-500 animate-pulse' : 'bg-success-500'}`}></div>
              <span className="truncate">{refreshing ? 'Actualizando...' : 'En tiempo real'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-secondary-600 dark:bg-secondary-700 text-white p-2 rounded-lg hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Filtros de visualización */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <label className="flex items-center gap-2 text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-surface-dark px-3 py-2 rounded-lg border border-border-light dark:border-border-dark">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded w-4 h-4 text-primary-600 dark:text-primary-400"
                />
                <Bus className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span className="truncate">Buses</span>
              </label>
              <label className="flex items-center gap-2 text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-surface-dark px-3 py-2 rounded-lg border border-border-light dark:border-border-dark">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded w-4 h-4 text-primary-600 dark:text-primary-400"
                />
                <Route className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span className="truncate">Rutas</span>
              </label>
              <label className="flex items-center gap-2 text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-surface-dark px-3 py-2 rounded-lg border border-border-light dark:border-border-dark">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={(e) => setShowStops(e.target.checked)}
                  className="rounded w-4 h-4 text-primary-600 dark:text-primary-400"
                />
                <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span className="truncate">Paradas</span>
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <button
                onClick={refreshRealTimeData}
                disabled={refreshing}
                className="bg-success-600 dark:bg-success-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-success-700 dark:hover:bg-success-600 disabled:opacity-50 transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline truncate">Actualizar</span>
              </button>

              <button
                onClick={() => {
                  setMapCenter([4.6482, -74.0648]);
                  setMapZoom(11);
                  setSelectedRoute(null);
                  setSelectedBus(null);
                }}
                className="bg-secondary-600 dark:bg-secondary-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Vista General</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral - Responsive */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-auto w-80 md:w-96 lg:w-[28rem] bg-background-light dark:bg-background-dark shadow-xl dark:shadow-2xl overflow-y-auto flex-shrink-0 h-full transition-transform duration-300 ease-in-out border-r border-border-light dark:border-border-dark`}>

          {/* Botón para cerrar sidebar en móvil */}
          <div className="md:hidden p-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark min-h-[44px] w-full justify-center"
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Cerrar panel</span>
            </button>
          </div>

          {/* Panel de ubicación del usuario */}
          <div className="p-4 border-b border-border-light dark:border-border-dark">
            <UserLocation onLocationUpdate={handleLocationUpdate} />
          </div>

          {/* Selector de rutas estilo Waze */}
          <div className="p-4 border-b border-border-light dark:border-border-dark">
            <RouteSelector
              routes={nearbyRoutes.length > 0 ? nearbyRoutes : routes}
              onRouteSelect={handleRouteSelect}
              selectedRoute={selectedRoute}
              userLocation={userLocation}
            />
          </div>

          {/* Información del bus seleccionado */}
          {selectedBus && !isNavigationActive && (
            <div className="p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark truncate text-lg">
                  {selectedBus.route}
                </h3>
              </div>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark flex-shrink-0" />
                  <span className="truncate"><strong>Conductor:</strong> {selectedBus.driver}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedBus.status)}`}></div>
                  <span className="truncate"><strong>Estado:</strong> {getStatusText(selectedBus.status)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-warning-600 dark:text-warning-400 flex-shrink-0" />
                  <span className="truncate"><strong>Velocidad:</strong> {selectedBus.speed} km/h</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-info-600 dark:text-info-400 flex-shrink-0" />
                  <span className="truncate"><strong>Pasajeros:</strong> {selectedBus.passengers}/{selectedBus.capacity}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => startTracking(selectedBus)}
                  disabled={isTracking}
                  className="bg-success-600 dark:bg-success-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-success-700 dark:hover:bg-success-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-h-[44px] flex-1"
                >
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{isTracking ? 'Siguiendo...' : 'Seguir Bus'}</span>
                </button>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="bg-secondary-600 dark:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center justify-center gap-2 min-h-[44px] flex-1"
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Cerrar</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de Buses Activos (solo si no hay navegación activa) */}
          {!isNavigationActive && (
            <div className="p-4 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark truncate text-lg">
                  Buses Activos ({buses.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {buses.slice(0, 10).map(bus => (
                  <div
                    key={bus.idVehiculo}
                    onClick={() => handleBusClick(bus)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedBus?.idVehiculo === bus.idVehiculo
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 shadow-md'
                        : 'bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark border border-border-light dark:border-border-dark hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark truncate">
                          {bus.plaVehiculo || `Vehículo ${bus.numVehiculo}`}
                        </h4>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate mt-1">
                          {bus.marVehiculo} {bus.modVehiculo}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end ml-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            bus.estVehiculo === 'EN_RUTA' ? 'bg-success-500' : 'bg-primary-500'
                          }`}
                        ></div>
                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                          {bus.anioVehiculo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark truncate text-lg">
                Estadísticas en Tiempo Real
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
                <div className="text-xl sm:text-2xl font-bold text-success-600 dark:text-success-400">
                  {buses.filter(b => b.estVehiculo === 'EN_RUTA').length}
                </div>
                <div className="text-sm sm:text-base text-success-700 dark:text-success-300 truncate mt-1">
                  Buses en Ruta
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
                <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {routes.filter(r => r.estRuta === 'ACTIVA').length}
                </div>
                <div className="text-sm sm:text-base text-primary-700 dark:text-primary-300 truncate mt-1">
                  Rutas Activas
                </div>
              </div>
              <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark">
                <div className="text-xl sm:text-2xl font-bold text-info-600 dark:text-info-400">
                  {nearbyRoutes.length}
                </div>
                <div className="text-sm sm:text-base text-info-700 dark:text-info-300 truncate mt-1">
                  Rutas Cercanas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Principal */}
        <div className="flex-1 relative">
          {/* Overlay para cerrar sidebar en móvil */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <EnhancedMap
            buses={buses}
            routes={routes}
            stops={stops}
            userLocation={userLocation}
            selectedRoute={selectedRoute}
            selectedBus={selectedBus}
            onBusClick={handleBusClick}
            onRouteClick={(route) => {
              handleRouteSelect(route);
              if (userLocation) {
                startNavigation(route);
              }
            }}
            showBuses={showBuses}
            showRoutes={showRoutes}
            showStops={showStops}
            showUserLocation={true}
            center={mapCenter}
            zoom={mapZoom}
          />

          {/* Panel de navegación activa */}
          {isNavigationActive && selectedRoute && (
            <div className="absolute top-4 left-4 z-[1000]">
              <NavigationPanel
                selectedRoute={selectedRoute}
                userLocation={userLocation}
                currentStep={currentNavigationStep}
                onStepChange={handleStepChange}
                onClose={stopNavigation}
              />
            </div>
          )}

          {/* Indicador de seguimiento de bus */}
          {isTracking && selectedBus && (
            <div className="absolute top-4 left-4 bg-success-600 dark:bg-success-700 text-white px-4 py-3 rounded-lg shadow-xl z-[1000] border border-success-500 dark:border-success-600">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Siguiendo: {selectedBus.route}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Última actualización: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
            <span className="flex items-center gap-2">
              <Bus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{buses.length} vehículos</span>
            </span>
            <span className="flex items-center gap-2">
              <Route className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{routes.filter(r => r.estRuta === 'ACTIVA').length} rutas activas</span>
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{stops.length} paradas</span>
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center lg:justify-end">
            <Activity className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Sistema en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RutasWazeStyle;