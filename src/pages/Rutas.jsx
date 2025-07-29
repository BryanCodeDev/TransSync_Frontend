// pages/Rutas.jsx - Versión corregida y mejorada
import React, { useState, useEffect } from 'react';
import { mapService, healthCheck } from '../services/apiService';

const Rutas = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Estados para ruta
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDestination, setRouteDestination] = useState('');
  const [routeProfile, setRouteProfile] = useState('driving');
  const [routeResult, setRouteResult] = useState(null);

  // Estados para lugares cercanos
  const [nearbyType, setNearbyType] = useState('restaurant');
  const [nearbyRadius, setNearbyRadius] = useState(1000);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [placeTypes, setPlaceTypes] = useState([]);

  // Tipos de lugares por defecto (fallback)
  const defaultPlaceTypes = [
    { value: 'restaurant', label: 'Restaurantes', icon: '🍽️' },
    { value: 'bank', label: 'Bancos', icon: '🏦' },
    { value: 'hospital', label: 'Hospitales', icon: '🏥' },
    { value: 'school', label: 'Escuelas', icon: '🏫' },
    { value: 'pharmacy', label: 'Farmacias', icon: '💊' },
    { value: 'fuel', label: 'Gasolineras', icon: '⛽' },
    { value: 'police', label: 'Policía', icon: '👮' },
    { value: 'fire_station', label: 'Bomberos', icon: '🚒' },
    { value: 'post_office', label: 'Correos', icon: '📮' },
    { value: 'library', label: 'Bibliotecas', icon: '📚' },
    { value: 'atm', label: 'Cajeros', icon: '🏧' },
    { value: 'cafe', label: 'Cafeterías', icon: '☕' },
    { value: 'supermarket', label: 'Supermercados', icon: '🛒' }
  ];

  // Verificar estado del API al cargar
  useEffect(() => {
    checkApiHealth();
    loadPlaceTypes();
    getCurrentLocation();
  }, []);

  // Verificar salud del API
  const checkApiHealth = async () => {
    try {
      const health = await healthCheck();
      setApiStatus(health);
      console.log('✅ API Status:', health);
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      setApiStatus({ 
        status: 'ERROR', 
        connectivity: false, 
        message: 'API no disponible' 
      });
    }
  };

  // Cargar tipos de lugares desde el API
  const loadPlaceTypes = async () => {
    try {
      const response = await mapService.getPlaceTypes();
      if (response.success && response.data) {
        setPlaceTypes(response.data);
      } else {
        setPlaceTypes(defaultPlaceTypes);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar tipos de lugares del API, usando valores por defecto');
      setPlaceTypes(defaultPlaceTypes);
    }
  };

  // Obtener ubicación actual
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗺️ Obteniendo ubicación actual...');
      const location = await mapService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutos
      });
      
      console.log('📍 Ubicación obtenida:', location);
      setCurrentLocation(location);
      
      // Intentar obtener dirección de la ubicación actual
      try {
        console.log('🔍 Obteniendo dirección para:', location.lat, location.lon);
        const address = await mapService.reverseGeocode(location.lat, location.lon);
        
        console.log('🏠 Dirección obtenida:', address);
        if (address.success && address.data) {
          setCurrentLocation(prev => ({
            ...prev,
            address: address.data.address || 'Dirección no disponible'
          }));
        }
      } catch (addressError) {
        console.warn('⚠️ No se pudo obtener la dirección:', addressError.message);
        setCurrentLocation(prev => ({
          ...prev,
          address: `Coordenadas: ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`
        }));
      }
    } catch (err) {
      console.error('❌ Error obteniendo ubicación:', err);
      setError(`Error obteniendo ubicación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocationAsOrigin = () => {
    if (currentLocation) {
      const locationText = currentLocation.address || 
        `${currentLocation.lat.toFixed(6)}, ${currentLocation.lon.toFixed(6)}`;
      setRouteOrigin(locationText);
    }
  };

  // Función para búsqueda de lugares
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Debes escribir algo para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      
      console.log('🔍 Buscando:', searchQuery);
      
      const results = await mapService.searchPlaces(searchQuery.trim(), {
        limit: 10,
        countrycodes: 'co'
      });
      
      console.log('📊 Resultados de búsqueda:', results);
      
      if (results.success && results.data) {
        setSearchResults(results.data);
        if (results.data.length === 0) {
          setError('No se encontraron resultados para tu búsqueda');
        }
      } else {
        setError('No se pudieron obtener resultados de búsqueda');
      }
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      setError(`Error en la búsqueda: ${err.message}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular ruta
  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    
    if (!routeOrigin.trim() || !routeDestination.trim()) {
      setError('Debes especificar tanto el origen como el destino');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRouteResult(null);

      console.log('🗺️ Calculando ruta desde:', routeOrigin, 'hasta:', routeDestination);

      // Geocodificar origen y destino
      console.log('📍 Geocodificando origen...');
      const originResults = await mapService.searchPlaces(routeOrigin.trim(), { limit: 1 });
      
      console.log('📍 Geocodificando destino...');
      const destResults = await mapService.searchPlaces(routeDestination.trim(), { limit: 1 });

      if (!originResults.success || !originResults.data?.length) {
        throw new Error(`No se encontró el origen: "${routeOrigin}"`);
      }
      if (!destResults.success || !destResults.data?.length) {
        throw new Error(`No se encontró el destino: "${routeDestination}"`);
      }

      const origin = originResults.data[0];
      const destination = destResults.data[0];

      console.log('🚗 Calculando ruta entre puntos:', origin, destination);

      // Calcular ruta
      const route = await mapService.calculateRoute(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        routeProfile
      );

      console.log('✅ Ruta calculada:', route);

      if (route.success && route.data) {
        setRouteResult({
          ...route.data,
          origin: { name: origin.name, lat: origin.lat, lon: origin.lon },
          destination: { name: destination.name, lat: destination.lat, lon: destination.lon }
        });
      } else {
        throw new Error('No se pudo calcular la ruta');
      }

    } catch (err) {
      console.error('❌ Error calculando ruta:', err);
      setError(`Error calculando ruta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar lugares cercanos
  const handleNearbySearch = async () => {
    if (!currentLocation) {
      setError('Primero necesitas permitir el acceso a tu ubicación');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNearbyPlaces([]);
      
      console.log('📍 Buscando lugares cercanos:', nearbyType, 'radio:', nearbyRadius);
      
      const results = await mapService.findNearbyPlaces(
        currentLocation.lat,
        currentLocation.lon,
        nearbyType,
        nearbyRadius
      );
      
      console.log('🏪 Lugares cercanos encontrados:', results);
      
      if (results.success && results.data) {
        setNearbyPlaces(results.data);
        if (results.data.length === 0) {
          setError(`No se encontraron ${placeTypes.find(t => t.value === nearbyType)?.label?.toLowerCase()} en un radio de ${mapService.formatDistance(nearbyRadius)}`);
        }
      } else {
        setError('No se pudieron obtener lugares cercanos');
      }
    } catch (err) {
      console.error('❌ Error buscando lugares cercanos:', err);
      setError(`Error buscando lugares cercanos: ${err.message}`);
      setNearbyPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const createRouteToPlace = async (place) => {
    if (!currentLocation) {
      setError('Necesitas permitir el acceso a tu ubicación para calcular rutas');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🗺️ Calculando ruta hacia:', place.name);
      
      const route = await mapService.calculateRoute(
        currentLocation.lat,
        currentLocation.lon,
        place.lat,
        place.lon,
        'driving'
      );

      if (route.success && route.data) {
        const distance = mapService.formatDistance(route.data.distance);
        const duration = mapService.formatDuration(route.data.duration);
        
        // Mostrar resultado en una ventana modal o alerta mejorada
        const message = `🗺️ Ruta calculada a ${place.name}:\n\n📏 Distancia: ${distance}\n⏰ Tiempo estimado: ${duration}\n🚗 Modo: Conduciendo`;
        
        alert(message);
        
        // Opcionalmente, cambiar a la pestaña de rutas con los datos precargados
        setRouteDestination(place.name);
        setActiveTab('route');
      } else {
        throw new Error('No se pudo calcular la ruta');
      }
    } catch (err) {
      console.error('❌ Error calculando ruta:', err);
      setError(`Error calculando ruta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar errores automáticamente después de 10 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rutas y Navegación</h1>
              <p className="text-gray-600">Encuentra lugares, calcula rutas y explora tu área</p>
            </div>
            
            {/* Estado del API */}
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus?.connectivity 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus?.connectivity ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                {apiStatus?.connectivity ? 'API Conectado' : 'API Desconectado'}
              </div>
              <button
                onClick={checkApiHealth}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
              >
                Verificar conexión
              </button>
            </div>
          </div>
          
          {/* Ubicación actual */}
          {currentLocation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">📍 Tu ubicación actual</h3>
                  <p className="text-sm text-blue-700">
                    {currentLocation.address || 'Obteniendo dirección...'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Precisión: {currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)}m` : 'Desconocida'}
                  </p>
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-300 rounded"
                  disabled={loading}
                >
                  {loading ? '⟳' : '🔄'} Actualizar
                </button>
              </div>
            </div>
          )}

          {!currentLocation && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-900">⚠️ Ubicación no disponible</h3>
                  <p className="text-sm text-yellow-700">
                    Permite el acceso a la ubicación para usar todas las funciones
                  </p>
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="text-yellow-600 hover:text-yellow-800 text-sm px-3 py-1 border border-yellow-300 rounded"
                  disabled={loading}
                >
                  📍 Obtener ubicación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { key: 'search', label: 'Buscar Lugares', icon: '🔍' },
                { key: 'route', label: 'Calcular Ruta', icon: '🗺️' },
                { key: 'nearby', label: 'Lugares Cercanos', icon: '📍' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Buscar Lugares */}
            {activeTab === 'search' && (
              <div>
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar lugares, direcciones, puntos de interés..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !searchQuery.trim()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? '🔄 Buscando...' : '🔍 Buscar'}
                    </button>
                  </div>
                </form>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      📊 Resultados ({searchResults.length})
                    </h3>
                    {searchResults.map((place, index) => (
                      <div key={place.id || index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{place.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {place.type} • {place.class}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              🗺️ {place.lat.toFixed(6)}, {place.lon.toFixed(6)}
                            </p>
                            {place.importance && (
                              <p className="text-xs text-blue-600 mt-1">
                                ⭐ Relevancia: {(place.importance * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                          <div className="ml-4 space-x-2 flex flex-col space-y-2">
                            <button
                              onClick={() => {
                                setRouteDestination(place.name);
                                setActiveTab('route');
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              🎯 Usar como destino
                            </button>
                            {currentLocation && (
                              <button
                                onClick={() => createRouteToPlace(place)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                disabled={loading}
                              >
                                🗺️ Ir aquí
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Calcular Ruta */}
            {activeTab === 'route' && (
              <div>
                <form onSubmit={handleCalculateRoute} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📍 Origen
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={routeOrigin}
                        onChange={(e) => setRouteOrigin(e.target.value)}
                        placeholder="Dirección de origen"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                      {currentLocation && (
                        <button
                          type="button"
                          onClick={useCurrentLocationAsOrigin}
                          className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 whitespace-nowrap transition-colors"
                          disabled={loading}
                        >
                          📍 Mi ubicación
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Destino
                    </label>
                    <input
                      type="text"
                      value={routeDestination}
                      onChange={(e) => setRouteDestination(e.target.value)}
                      placeholder="Dirección de destino"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚗 Tipo de transporte
                    </label>
                    <select
                      value={routeProfile}
                      onChange={(e) => setRouteProfile(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="driving">🚗 Conduciendo</option>
                      <option value="walking">🚶 Caminando</option>
                      <option value="cycling">🚴 Bicicleta</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !routeOrigin.trim() || !routeDestination.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '🔄 Calculando ruta...' : '🗺️ Calcular Ruta'}
                  </button>
                </form>

                {/* Resultado de la ruta */}
                {routeResult && (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-4">✅ Ruta Calculada</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mapService.formatDistance(routeResult.distance)}
                        </div>
                        <div className="text-sm text-green-700">📏 Distancia</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mapService.formatDuration(routeResult.duration)}
                        </div>
                        <div className="text-sm text-green-700">⏰ Tiempo estimado</div>
                      </div>
                      <div className="text-center bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {routeResult.profile === 'driving' ? '🚗' : 
                           routeResult.profile === 'walking' ? '🚶' : '🚴'}
                        </div>
                        <div className="text-sm text-green-700">🚦 Transporte</div>
                      </div>
                    </div>
                    <div className="space-y-2 bg-white p-4 rounded-lg">
                      <p><strong>📍 Origen:</strong> {routeResult.origin.name}</p>
                      <p><strong>🎯 Destino:</strong> {routeResult.destination.name}</p>
                      {routeResult.steps && routeResult.steps.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-green-700 hover:text-green-900">
                            📋 Ver instrucciones paso a paso ({routeResult.steps.length} pasos)
                          </summary>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {routeResult.steps.slice(0, 10).map((step, index) => (
                              <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                {index + 1}. {step.maneuver?.instruction || step.instruction || 'Continuar'}
                              </div>
                            ))}
                            {routeResult.steps.length > 10 && (
                              <div className="text-xs text-gray-500 text-center py-2">
                                ... y {routeResult.steps.length - 10} pasos más
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Lugares Cercanos */}
            {activeTab === 'nearby' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏪 Tipo de lugar
                    </label>
                    <select
                      value={nearbyType}
                      onChange={(e) => setNearbyType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      {placeTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon ? `${type.icon} ${type.label}` : type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📏 Radio de búsqueda
                    </label>
                    <select
                      value={nearbyRadius}
                      onChange={(e) => setNearbyRadius(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value={500}>📍 500 metros</option>
                      <option value={1000}>📍 1 kilómetro</option>
                      <option value={2000}>📍 2 kilómetros</option>
                      <option value={5000}>📍 5 kilómetros</option>
                      <option value={10000}>📍 10 kilómetros</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleNearbySearch}
                      disabled={loading || !currentLocation}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? '🔄 Buscando...' : '🔍 Buscar Cerca'}
                    </button>
                  </div>
                </div>

                {!currentLocation && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-yellow-700">
                          ⚠️ Necesitas permitir el acceso a tu ubicación para buscar lugares cercanos.
                        </p>
                        <button
                          onClick={getCurrentLocation}
                          className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline font-medium"
                          disabled={loading}
                        >
                          📍 Obtener mi ubicación
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resultados de lugares cercanos */}
                {nearbyPlaces.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        🏪 {placeTypes.find(t => t.value === nearbyType)?.label} cercanos
                      </h3>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {nearbyPlaces.length} encontrados
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nearbyPlaces.map((place, index) => (
                        <div key={place.id || index} className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {place.name || 'Sin nombre'}
                              </h4>
                              <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-1">
                                {place.amenity}
                              </span>
                            </div>
                          </div>
                          
                          {/* Información adicional */}
                          <div className="space-y-1 mb-3 text-xs text-gray-600">
                            {currentLocation && (
                              <p className="flex items-center">
                                📍 {mapService.formatDistance(
                                  mapService.calculateDistance(
                                    currentLocation.lat,
                                    currentLocation.lon,
                                    place.lat,
                                    place.lon
                                  )
                                )}
                              </p>
                            )}
                            
                            {place.tags?.address && (
                              <p className="flex items-center">
                                🏠 {place.tags.address}
                              </p>
                            )}
                            
                            {place.tags?.phone && (
                              <p className="flex items-center">
                                📞 {place.tags.phone}
                              </p>
                            )}
                            
                            {place.tags?.opening_hours && (
                              <p className="flex items-center">
                                🕐 {place.tags.opening_hours}
                              </p>
                            )}
                            
                            {place.tags?.website && (
                              <p className="flex items-center">
                                🌐 <a href={place.tags.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate">
                                  {place.tags.website}
                                </a>
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => createRouteToPlace(place)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                              disabled={loading || !currentLocation}
                            >
                              🗺️ Calcular Ruta
                            </button>
                            <button
                              onClick={() => {
                                setSearchQuery(place.name || '');
                                setActiveTab('search');
                              }}
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-xs hover:bg-gray-700 transition-colors"
                            >
                              🔍 Ver detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {nearbyPlaces.length === 0 && !loading && currentLocation && nearbyType && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron lugares
                    </h3>
                    <p className="text-sm mb-4">
                      No se encontraron <strong>{placeTypes.find(t => t.value === nearbyType)?.label?.toLowerCase()}</strong> en un radio de <strong>{mapService.formatDistance(nearbyRadius)}</strong>
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setNearbyRadius(Math.min(nearbyRadius * 2, 10000))}
                        className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors mr-2"
                        disabled={nearbyRadius >= 10000}
                      >
                        📏 Ampliar búsqueda
                      </button>
                      <button
                        onClick={() => setNearbyType('restaurant')}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        🍽️ Buscar restaurantes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Debug Info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                🔧 Información de Debug
              </summary>
              <div className="text-xs text-gray-600 space-y-2 mt-2">
                <div><strong>API Status:</strong> {JSON.stringify(apiStatus, null, 2)}</div>
                <div><strong>Current Location:</strong> {JSON.stringify(currentLocation, null, 2)}</div>
                <div><strong>Active Tab:</strong> {activeTab}</div>
                <div><strong>Loading:</strong> {loading.toString()}</div>
                <div><strong>Error:</strong> {error || 'None'}</div>
                <div><strong>Search Results:</strong> {searchResults.length} items</div>
                <div><strong>Nearby Places:</strong> {nearbyPlaces.length} items</div>
                <div><strong>Place Types:</strong> {placeTypes.length} types loaded</div>
              </div>
            </details>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <span className="text-gray-700 font-medium">Procesando solicitud...</span>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeTab === 'search' && 'Buscando lugares...'}
                    {activeTab === 'route' && 'Calculando ruta...'}
                    {activeTab === 'nearby' && 'Encontrando lugares cercanos...'}
                    {!['search', 'route', 'nearby'].includes(activeTab) && 'Cargando...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rutas;