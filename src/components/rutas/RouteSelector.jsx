import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Clock,
  Route,
  Navigation,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import rutasAPI from '../../utilidades/rutasAPI';

const RouteSelector = ({
  routes = [],
  onRouteSelect,
  selectedRoute,
  userLocation,
  className = ""
}) => {
  useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState(routes);
  const [sortBy, setSortBy] = useState('distance'); // distance, time, popularity
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Filtrar rutas basado en búsqueda y filtros
  useEffect(() => {
    let filtered = routes;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(route =>
        route.nomRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.oriRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.desRuta.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado activo
    if (showOnlyActive) {
      filtered = filtered.filter(route => route.estRuta === 'ACTIVA');
    }

    // Ordenar rutas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distanciaKm || 999) - (b.distanciaKm || 999);
        case 'time':
          return (a.tiempoEstimadoMin || 999) - (b.tiempoEstimadoMin || 999);
        case 'popularity':
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });

    setFilteredRoutes(filtered);
  }, [routes, searchTerm, sortBy, showOnlyActive]);

  // Calcular distancia desde ubicación del usuario
  const calculateDistanceToRoute = (route) => {
    if (!userLocation || !route.coordenadasRuta) return null;

    try {
      let routeCoords = [];

      // Verificar si ya es un array
      if (Array.isArray(route.coordenadasRuta)) {
        routeCoords = route.coordenadasRuta;
      } else {
        // Intentar parsear como JSON
        const parsed = JSON.parse(route.coordenadasRuta);
        if (Array.isArray(parsed) && parsed.length > 0) {
          routeCoords = parsed;
        }
      }

      if (!routeCoords || routeCoords.length === 0) return null;

      // Calcular distancia al punto más cercano de la ruta
      let minDistance = Infinity;
      routeCoords.forEach(coord => {
        if (coord.length >= 2) {
          const distance = rutasAPI.calculateDistance(
            userLocation.lat, userLocation.lng,
            coord[0], coord[1]
          );
          minDistance = Math.min(minDistance, distance);
        }
      });

      return minDistance;
    } catch (error) {
      return null;
    }
  };

  // Obtener tiempo estimado de llegada
  const getEstimatedArrival = (route) => {
    const distance = calculateDistanceToRoute(route);
    if (!distance) return null;

    // Asumir velocidad promedio de bus (30 km/h)
    const avgSpeed = 30;
    const timeInHours = distance / avgSpeed;

    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (timeInHours * 60 * 60 * 1000));

    return arrivalTime;
  };

  const getRouteStatus = (route) => {
    const distance = calculateDistanceToRoute(route);
    if (!distance) return { status: 'unknown', color: 'gray' };

    if (distance < 0.5) return { status: 'nearby', color: 'green' };
    if (distance < 2) return { status: 'close', color: 'blue' };
    return { status: 'far', color: 'orange' };
  };

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark ${className}`}>
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3 mb-4">
          <Navigation className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Seleccionar Ruta
          </h3>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
          <input
            type="text"
            placeholder="Buscar origen, destino o nombre de ruta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filtros y ordenamiento */}
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded text-sm text-text-primary-light dark:text-text-primary-dark"
          >
            <option value="distance">Por distancia</option>
            <option value="time">Por tiempo</option>
            <option value="popularity">Más populares</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-text-primary-light dark:text-text-primary-dark">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
              className="rounded"
            />
            Solo rutas activas
          </label>
        </div>
      </div>

      {/* Lista de rutas */}
      <div className="max-h-96 overflow-y-auto">
        {filteredRoutes.length === 0 ? (
          <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
            <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron rutas</p>
            <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          filteredRoutes.map(route => {
            const distance = calculateDistanceToRoute(route);
            const arrivalTime = getEstimatedArrival(route);
            const routeStatus = getRouteStatus(route);
            const isSelected = selectedRoute?.idRuta === route.idRuta;

            return (
              <div
                key={route.idRuta}
                onClick={() => onRouteSelect(route)}
                className={`p-4 border-b border-border-light dark:border-border-dark cursor-pointer transition-all duration-200 hover:bg-surface-light dark:hover:bg-surface-dark ${
                  isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                        {route.nomRuta}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${
                        routeStatus.status === 'nearby' ? 'bg-success-500' :
                        routeStatus.status === 'close' ? 'bg-primary-500' : 'bg-warning-500'
                      }`} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.oriRuta} → {route.desRuta}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {distance && (
                      <span className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
                        <TrendingUp className="w-3 h-3" />
                        {distance.toFixed(1)} km
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
                      <Clock className="w-3 h-3" />
                      {route.tiempoEstimadoMin ?
                        `${Math.floor(route.tiempoEstimadoMin / 60)}h ${route.tiempoEstimadoMin % 60}min` :
                        'Tiempo N/A'
                      }
                    </span>
                    {route.usageCount && (
                      <span className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
                        <Users className="w-3 h-3" />
                        {route.usageCount}
                      </span>
                    )}
                  </div>

                  {arrivalTime && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        Llegada estimada
                      </div>
                      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Indicadores adicionales */}
                <div className="mt-2 flex items-center gap-2">
                  {route.estRuta === 'ACTIVA' ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded text-xs">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      Ruta activa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-xs">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full" />
                      Ruta inactiva
                    </span>
                  )}

                  {routeStatus.status === 'nearby' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                      <Zap className="w-3 h-3" />
                      Cerca de ti
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <span>{filteredRoutes.length} rutas disponibles</span>
          {userLocation && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ubicación detectada
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;