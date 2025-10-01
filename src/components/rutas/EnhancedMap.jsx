import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bus,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers
} from 'lucide-react';

// Iconos personalizados para diferentes tipos de marcadores
const createCustomIcon = (color, iconHtml, size = 30) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${iconHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const stopIcon = createCustomIcon('#EF4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>');

// Componente para controlar el mapa
const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);

  return null;
};

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onMapClick, onMarkerClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng);
    }
  });
  return null;
};

const EnhancedMap = ({
  buses = [],
  routes = [],
  stops = [],
  userLocation = null,
  selectedRoute = null,
  selectedBus = null,
  onBusClick,
  onRouteClick,
  onMapClick,
  showBuses = true,
  showRoutes = true,
  showStops = true,
  showUserLocation = true,
  center = [4.6482, -74.0648],
  zoom = 11,
  className = "",
  style = { height: '100%', width: '100%' }
}) => {
  const [mapInstance, setMapInstance] = useState(null);

  // Límites de Colombia
  const colombiaBounds = [
    [-4.2276, -81.8317],
    [15.5138, -66.8694]
  ];

  // Función para obtener color del estado del bus
  const getBusStatusColor = (status) => {
    switch (status) {
      case 'EN_RUTA': return '#10b981';
      case 'DISPONIBLE': return '#3b82f6';
      case 'EN_MANTENIMIENTO': return '#f59e0b';
      case 'FUERA_DE_SERVICIO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Función para verificar si las coordenadas son válidas
  const isValidCoordinate = (lat, lng) => {
    return lat && lng && !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
           lat !== 0 && lng !== 0;
  };

  // Crear icono de bus con animación si está siendo seguido
  const createBusIcon = (bus, isSelected = false) => {
    const color = getBusStatusColor(bus.estVehiculo);
    const size = isSelected ? 40 : 35;

    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '18px' : '16px'};
        ${isSelected ? 'animation: pulse 1s infinite;' : ''}
      ">
        <svg width="${isSelected ? '22' : '20'}" height="${isSelected ? '22' : '20'}" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2">
          <path d="M8 6v6h8V6l2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l2-2Z"/>
          <path d="M16 16v2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Crear icono de usuario con pulso
  const createUserIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #3B82F6;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        animation: locationPulse 2s infinite;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/>
        </svg>
      </div>
      <style>
        @keyframes locationPulse {
          0% { transform: scale(1); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 2px 12px rgba(59, 130, 246, 0.6); }
          100% { transform: scale(1); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4); }
        }
      </style>`,
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className={`relative ${className}`} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        maxBounds={colombiaBounds}
        maxBoundsViscosity={0.8}
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Ubicación del usuario */}
        {showUserLocation && userLocation && isValidCoordinate(userLocation.lat, userLocation.lng) && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold">Mi ubicación</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Lat: {userLocation.lat.toFixed(6)}<br />
                  Lng: {userLocation.lng.toFixed(6)}
                </p>
                {userLocation.accuracy && (
                  <p className="text-xs text-gray-500 mt-1">
                    Precisión: {Math.round(userLocation.accuracy)}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Rutas */}
        {showRoutes && routes.map(route => {
          try {
            let routePositions = [[4.5981, -74.0758], [4.6280, -74.0631], [4.6601, -74.0547], [4.7110, -74.0721]];

            if (route.coordenadasRuta) {
              try {
                // Verificar si ya es un array
                if (Array.isArray(route.coordenadasRuta)) {
                  routePositions = route.coordenadasRuta;
                } else {
                  // Intentar parsear como JSON
                  const parsed = JSON.parse(route.coordenadasRuta);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    routePositions = parsed;
                  }
                }
              } catch (error) {
                console.warn(`Error parseando coordenadas de ruta ${route.idRuta}:`, error);
                // Mantener coordenadas por defecto
              }
            }

            return (
              <Polyline
                key={route.idRuta}
                positions={routePositions}
                color={selectedRoute?.idRuta === route.idRuta ? '#8B5CF6' : (route.estRuta === 'ACTIVA' ? '#6366f1' : '#ef4444')}
                weight={selectedRoute?.idRuta === route.idRuta ? 6 : 4}
                opacity={route.estRuta === 'ACTIVA' ? 0.8 : 0.4}
                dashArray={route.estRuta === 'ACTIVA' ? null : "10, 10"}
                eventHandlers={{
                  click: () => onRouteClick?.(route)
                }}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                      {route.nomRuta}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center justify-center gap-2">
                        <span>📍</span>
                        {route.oriRuta} → {route.desRuta}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📏</span>
                        {route.distanciaKm ? `${route.distanciaKm} km` : 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>⏱️</span>
                        {route.tiempoEstimadoMin ?
                          `${Math.floor(route.tiempoEstimadoMin / 60)}h ${route.tiempoEstimadoMin % 60}min` :
                          'Tiempo N/A'
                        }
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className={`w-2 h-2 rounded-full ${route.estRuta === 'ACTIVA' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs">
                          {route.estRuta === 'ACTIVA' ? 'Ruta activa' : 'Ruta inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          } catch (error) {
            console.error('Error procesando ruta:', route.idRuta, error);
            return null;
          }
        })}

        {/* Paradas de bus */}
        {showStops && stops.map(stop => (
          <Marker
            key={stop.idParada}
            position={[stop.latitud || 4.6482, stop.longitud || -74.0648]}
            icon={stopIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-300">
                    {stop.nombreParada}
                  </h3>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Orden: {stop.orden}</p>
                  {stop.tiempoEstimado && (
                    <p>Tiempo estimado: {stop.tiempoEstimado} min</p>
                  )}
                  <p className="text-xs">
                    Lat: {stop.latitud?.toFixed(6) || 'N/A'}<br />
                    Lng: {stop.longitud?.toFixed(6) || 'N/A'}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Buses */}
        {showBuses && buses.map(bus => {
          const isSelected = selectedBus?.idVehiculo === bus.idVehiculo;
          const busLat = isValidCoordinate(bus.lat, bus.lng) ? bus.lat : 4.6482;
          const busLng = isValidCoordinate(bus.lat, bus.lng) ? bus.lng : -74.0648;

          return (
            <Marker
              key={bus.idVehiculo}
              position={[busLat, busLng]}
              icon={createBusIcon(bus, isSelected)}
              eventHandlers={{
                click: () => onBusClick?.(bus)
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-blue-900 dark:text-blue-300">
                      {bus.plaVehiculo || `Vehículo ${bus.numVehiculo}`}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        bus.estVehiculo === 'EN_RUTA'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {bus.estVehiculo === 'EN_RUTA' ? 'En ruta' : 'Disponible'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Modelo:</span>
                      <span>{bus.marVehiculo} {bus.modVehiculo}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Año:</span>
                      <span>{bus.anioVehiculo}</span>
                    </div>

                    {bus.speed && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Velocidad:</span>
                        <span className="font-medium">{bus.speed} km/h</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pasajeros:</span>
                      <span>{bus.passengers || 0}/{bus.capacity || 'N/A'}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última actualización: {bus.lastUpdate ?
                          new Date(bus.lastUpdate).toLocaleTimeString() :
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Controles del mapa */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={() => mapInstance?.setZoom(mapInstance.getZoom() + 1)}
          className="bg-background-light dark:bg-background-dark shadow-lg border border-border-light dark:border-border-dark rounded-lg w-10 h-10 flex items-center justify-center hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-text-primary-light dark:text-text-primary-dark" />
        </button>

        <button
          onClick={() => mapInstance?.setZoom(mapInstance.getZoom() - 1)}
          className="bg-background-light dark:bg-background-dark shadow-lg border border-border-light dark:border-border-dark rounded-lg w-10 h-10 flex items-center justify-center hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-text-primary-light dark:text-text-primary-dark" />
        </button>

        <button
          onClick={() => {
            if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
              mapInstance?.setView([userLocation.lat, userLocation.lng], 15);
            } else {
              navigator.geolocation?.getCurrentPosition(
                (position) => {
                  mapInstance?.setView([position.coords.latitude, position.coords.longitude], 15);
                },
                () => {
                  mapInstance?.setView([4.6482, -74.0648], 12);
                }
              );
            }
          }}
          className="bg-primary-600 dark:bg-primary-700 text-white shadow-lg rounded-lg w-10 h-10 flex items-center justify-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <Locate className="w-4 h-4" />
        </button>

        <button className="bg-background-light dark:bg-background-dark shadow-lg border border-border-light dark:border-border-dark rounded-lg w-10 h-10 flex items-center justify-center hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
          <Layers className="w-4 h-4 text-text-primary-light dark:text-text-primary-dark" />
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-20 left-4 bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-3 z-[1000]">
        <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark mb-2">Leyenda</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-success-500 flex items-center justify-center">
              <Bus className="w-2 h-2 text-white" />
            </div>
            <span className="text-text-primary-light dark:text-text-primary-dark">En ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
              <Bus className="w-2 h-2 text-white" />
            </div>
            <span className="text-text-primary-light dark:text-text-primary-dark">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-error-500 flex items-center justify-center">
              <MapPin className="w-2 h-2 text-white" />
            </div>
            <span className="text-text-primary-light dark:text-text-primary-dark">Parada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-primary-500 rounded"></div>
            <span className="text-text-primary-light dark:text-text-primary-dark">Ruta activa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 border-b-2 border-dashed border-secondary-500"></div>
            <span className="text-text-primary-light dark:text-text-primary-dark">Ruta inactiva</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMap;