import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Iconos personalizados para diferentes tipos de marcadores
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const stopIcon = createCustomIcon('#EF4444', '🚏');

// Simulación de datos de buses en tiempo real
const generateMockBuses = () => {
  return [
    {
      id: 'bus-001',
      route: 'Ruta 1: Centro - Norte',
      driver: 'Juan Pérez',
      lat: 4.7110, // Bogotá
      lng: -74.0721,
      speed: 25,
      passengers: 23,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 45
    },
    {
      id: 'bus-002', 
      route: 'Ruta 2: Sur - Occidente',
      driver: 'María González',
      lat: 4.6097,
      lng: -74.0817,
      speed: 18,
      passengers: 31,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 120
    },
    {
      id: 'bus-003',
      route: 'Ruta 3: Oriente - Centro',
      driver: 'Carlos Rodríguez',
      lat: 4.6486,
      lng: -74.0639,
      speed: 0,
      passengers: 8,
      capacity: 35,
      status: 'parada',
      lastUpdate: new Date(),
      direction: 0
    }
  ];
};

// Simulación de paradas de bus
const mockBusStops = [
  { id: 'stop-001', name: 'Terminal Norte', lat: 4.7850, lng: -74.0450, routes: ['Ruta 1', 'Ruta 3'] },
  { id: 'stop-002', name: 'Plaza Bolívar', lat: 4.5981, lng: -74.0758, routes: ['Ruta 1', 'Ruta 2'] },
  { id: 'stop-003', name: 'Centro Comercial', lat: 4.6601, lng: -74.0547, routes: ['Ruta 2', 'Ruta 3'] },
  { id: 'stop-004', name: 'Universidad Nacional', lat: 4.6365, lng: -74.0847, routes: ['Ruta 1'] },
  { id: 'stop-005', name: 'Hospital San Juan', lat: 4.6280, lng: -74.0631, routes: ['Ruta 2'] }
];

// Simulación de rutas predefinidas
const mockRoutes = [
  {
    id: 'route-001',
    name: 'Ruta 1: Centro - Norte',
    color: '#10B981',
    coordinates: [
      [4.5981, -74.0758], // Plaza Bolívar
      [4.6280, -74.0631], // Punto intermedio
      [4.6601, -74.0547], // Centro Comercial
      [4.7110, -74.0721], // Punto actual bus
      [4.7850, -74.0450]  // Terminal Norte
    ],
    distance: '15.2 km',
    estimatedTime: '45 min',
    active: true
  },
  {
    id: 'route-002', 
    name: 'Ruta 2: Sur - Occidente',
    color: '#3B82F6',
    coordinates: [
      [4.5700, -74.0900], // Sur
      [4.5981, -74.0758], // Plaza Bolívar
      [4.6097, -74.0817], // Punto actual bus
      [4.6280, -74.0631], // Hospital
      [4.6500, -74.1200]  // Occidente
    ],
    distance: '18.7 km',
    estimatedTime: '55 min',
    active: true
  },
  {
    id: 'route-003',
    name: 'Ruta 3: Oriente - Centro',
    color: '#8B5CF6',
    coordinates: [
      [4.6800, -74.0300], // Oriente
      [4.6486, -74.0639], // Punto actual bus
      [4.6365, -74.0847], // Universidad
      [4.6001, -74.0700], // Centro
    ],
    distance: '12.5 km',
    estimatedTime: '35 min',
    active: false
  }
];

// Componente para actualizar posición de buses
const BusUpdater = ({ buses, setBuses }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          if (bus.status === 'en_ruta' && bus.speed > 0) {
            // Simular movimiento del bus
            const deltaLat = (Math.random() - 0.5) * 0.001;
            const deltaLng = (Math.random() - 0.5) * 0.001;
            
            return {
              ...bus,
              lat: bus.lat + deltaLat,
              lng: bus.lng + deltaLng,
              lastUpdate: new Date(),
              speed: Math.max(0, bus.speed + (Math.random() - 0.5) * 5),
              passengers: Math.max(0, Math.min(bus.capacity, bus.passengers + Math.floor((Math.random() - 0.5) * 3)))
            };
          }
          return bus;
        })
      );
    }, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(interval);
  }, [setBuses]);

  return null;
};

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

// Componente para controlar el mapa
const MapControl = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  
  return null;
};

const InteractiveMap = () => {
  const [buses, setBuses] = useState(generateMockBuses());
  const [selectedBus, setSelectedBus] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [mapCenter, setMapCenter] = useState([4.6482, -74.0648]); // Centro de Bogotá
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [newMarkers, setNewMarkers] = useState([]);
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Colombia bounds para restringir el mapa
  const colombiaBounds = [
    [-4.2276, -81.8317], // Southwest
    [15.5138, -66.8694]  // Northeast
  ];

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    setMapCenter([bus.lat, bus.lng]);
    setMapZoom(15);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (route && route.coordinates.length > 0) {
      // Calcular bounds de la ruta
      const lats = route.coordinates.map(coord => coord[0]);
      const lngs = route.coordinates.map(coord => coord[1]);
      const bounds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
      // Usar fitBounds en lugar de setView para mostrar toda la ruta
      setMapCenter([(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]);
      setMapZoom(12);
    }
  };

  const startTracking = (bus) => {
    setIsTracking(true);
    setSelectedBus(bus);
    
    const trackingInterval = setInterval(() => {
      setBuses(currentBuses => {
        const trackedBus = currentBuses.find(b => b.id === bus.id);
        if (trackedBus) {
          setMapCenter([trackedBus.lat, trackedBus.lng]);
        }
        return currentBuses;
      });
    }, 2000);

    // Detener tracking después de 30 segundos
    setTimeout(() => {
      setIsTracking(false);
      clearInterval(trackingInterval);
    }, 30000);
  };

  const handleMapClick = (latlng) => {
    if (isAddingStop) {
      const newStop = {
        id: `new-stop-${Date.now()}`,
        name: `Nueva Parada ${newMarkers.length + 1}`,
        lat: latlng.lat,
        lng: latlng.lng,
        routes: [],
        isNew: true
      };
      setNewMarkers([...newMarkers, newStop]);
      setIsAddingStop(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_ruta': return '#10B981';
      case 'parada': return '#EF4444';
      case 'mantenimiento': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_ruta': return 'En Ruta';
      case 'parada': return 'En Parada';
      case 'mantenimiento': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Header de Control */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">🚌 Sistema de Rutas TransSync</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>En tiempo real</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtros de visualización */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded"
                />
                🚌 Buses
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded"
                />
                🛣️ Rutas
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={(e) => setShowStops(e.target.checked)}
                  className="rounded"
                />
                🚏 Paradas
              </label>
            </div>

            {/* Botones de acción */}
            <button
              onClick={() => setIsAddingStop(!isAddingStop)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isAddingStop 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isAddingStop ? '❌ Cancelar' : '📍 Agregar Parada'}
            </button>

            <button
              onClick={() => {
                setMapCenter([4.6482, -74.0648]);
                setMapZoom(11);
                setSelectedRoute(null);
                setSelectedBus(null);
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              🏠 Vista General
            </button>
          </div>
        </div>

        {isAddingStop && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            💡 Haz clic en el mapa donde quieres agregar una nueva parada
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto flex-shrink-0">
          {/* Información del bus seleccionado */}
          {selectedBus && (
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="font-bold text-blue-900 mb-2">🚌 {selectedBus.route}</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Conductor:</strong> {selectedBus.driver}</p>
                <p><strong>Estado:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                    selectedBus.status === 'en_ruta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(selectedBus.status)}
                  </span>
                </p>
                <p><strong>Velocidad:</strong> {selectedBus.speed} km/h</p>
                <p><strong>Pasajeros:</strong> {selectedBus.passengers}/{selectedBus.capacity}</p>
                <p><strong>Última actualización:</strong> {selectedBus.lastUpdate.toLocaleTimeString()}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startTracking(selectedBus)}
                  disabled={isTracking}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {isTracking ? '📡 Siguiendo...' : '📡 Seguir Bus'}
                </button>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                >
                  ❌ Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Buses */}
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-900 mb-3">🚌 Buses Activos ({buses.length})</h3>
            <div className="space-y-2">
              {buses.map(bus => (
                <div
                  key={bus.id}
                  onClick={() => handleBusClick(bus)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBus?.id === bus.id 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{bus.route}</h4>
                      <p className="text-xs text-gray-500">{bus.driver}</p>
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${
                        bus.status === 'en_ruta' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">{bus.speed} km/h</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>👥 {bus.passengers}/{bus.capacity}</span>
                    <span>{getStatusText(bus.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Rutas */}
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-900 mb-3">🛣️ Rutas Disponibles</h3>
            <div className="space-y-2">
              {mockRoutes.map(route => (
                <div
                  key={route.id}
                  onClick={() => handleRouteSelect(route)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedRoute?.id === route.id 
                      ? 'bg-purple-100 border-purple-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.color }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{route.name}</h4>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>📏 {route.distance}</span>
                        <span>⏰ {route.estimatedTime}</span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      route.active ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">📊 Estadísticas en Tiempo Real</h3>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {buses.filter(b => b.status === 'en_ruta').length}
                </div>
                <div className="text-sm text-green-700">Buses en Ruta</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {buses.reduce((total, bus) => total + bus.passengers, 0)}
                </div>
                <div className="text-sm text-blue-700">Pasajeros Totales</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(buses.reduce((total, bus) => total + bus.speed, 0) / buses.length)}
                </div>
                <div className="text-sm text-purple-700">Velocidad Promedio (km/h)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Principal */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            maxBounds={colombiaBounds}
            maxBoundsViscosity={0.8}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapControl center={mapCenter} zoom={mapZoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            <BusUpdater buses={buses} setBuses={setBuses} />

            {/* Rutas */}
            {showRoutes && mockRoutes.map(route => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                color={route.color}
                weight={selectedRoute?.id === route.id ? 6 : 4}
                opacity={route.active ? 0.8 : 0.4}
                dashArray={route.active ? null : "10, 10"}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{route.name}</h3>
                    <p className="text-sm">📏 {route.distance} • ⏰ {route.estimatedTime}</p>
                    <p className="text-xs mt-1">
                      Estado: {route.active ? '🟢 Activa' : '🔴 Inactiva'}
                    </p>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Paradas de Bus */}
            {showStops && mockBusStops.map(stop => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={stopIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">🚏 {stop.name}</h3>
                    <p className="text-sm">Rutas que pasan:</p>
                    <ul className="text-xs list-disc list-inside">
                      {stop.routes.map((route, idx) => (
                        <li key={idx}>{route}</li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Nuevas paradas agregadas */}
            {newMarkers.map(marker => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={createCustomIcon('#F59E0B', '📍')}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">📍 {marker.name}</h3>
                    <p className="text-sm">Nueva parada agregada</p>
                    <button
                      onClick={() => setNewMarkers(prev => prev.filter(m => m.id !== marker.id))}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2 hover:bg-red-600"
                    >
                      ❌ Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Buses */}
            {showBuses && buses.map(bus => (
              <Marker
                key={bus.id}
                position={[bus.lat, bus.lng]}
                icon={L.divIcon({
                  html: `<div style="
                    background-color: ${getStatusColor(bus.status)};
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transform: rotate(${bus.direction}deg);
                    ${isTracking && selectedBus?.id === bus.id ? 'animation: pulse 1s infinite;' : ''}
                  ">🚌</div>
                  <style>
                    @keyframes pulse {
                      0% { transform: scale(1) rotate(${bus.direction}deg); }
                      50% { transform: scale(1.1) rotate(${bus.direction}deg); }
                      100% { transform: scale(1) rotate(${bus.direction}deg); }
                    }
                  </style>`,
                  iconSize: [35, 35],
                  iconAnchor: [17, 17]
                })}
                eventHandlers={{
                  click: () => handleBusClick(bus)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-blue-900">🚌 {bus.route}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>👨‍✈️ Conductor:</strong> {bus.driver}</p>
                      <p><strong>📍 Estado:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                          bus.status === 'en_ruta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusText(bus.status)}
                        </span>
                      </p>
                      <p><strong>🚀 Velocidad:</strong> {bus.speed} km/h</p>
                      <p><strong>👥 Ocupación:</strong> {bus.passengers}/{bus.capacity}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(bus.passengers / bus.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>🕒 Última actualización:</strong> {bus.lastUpdate.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startTracking(bus)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        📡 Seguir
                      </button>
                      <button
                        onClick={() => setSelectedBus(bus)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        ℹ️ Detalles
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Indicador de tracking */}
          {isTracking && selectedBus && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  📡 Siguiendo: {selectedBus.route}
                </span>
              </div>
            </div>
          )}

          {/* Controles de zoom y ubicación */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
            <button
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              ➕
            </button>
            <button
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 3))}
              className="bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              ➖
            </button>
            <button
              onClick={() => {
                // Simular ubicación actual del usuario
                navigator.geolocation?.getCurrentPosition(
                  (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(15);
                  },
                  () => {
                    // Fallback a Bogotá
                    setMapCenter([4.6482, -74.0648]);
                    setMapZoom(12);
                  }
                );
              }}
              className="bg-blue-500 text-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              📍
            </button>
          </div>

          {/* Leyenda del mapa */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
            <h4 className="font-bold text-sm mb-2">🗺️ Leyenda</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">🚌</div>
                <span>Bus en ruta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">🚌</div>
                <span>Bus en parada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">🚏</div>
                <span>Parada de bus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>Ruta activa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-b border-gray-400 border-dashed"></div>
                <span>Ruta inactiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="bg-white border-t px-4 py-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            🕒 Última actualización: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex gap-4">
            <span>🚌 {buses.length} buses activos</span>
            <span>🛣️ {mockRoutes.filter(r => r.active).length} rutas operativas</span>
            <span>🚏 {mockBusStops.length + newMarkers.length} paradas registradas</span>
          </div>
          <div>
            📡 Sistema en tiempo real
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;