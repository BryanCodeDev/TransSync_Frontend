import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import rutasAPI from '../../utilidades/rutasAPI';
import {
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Phone,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

const NavigationPanel = ({
  selectedRoute,
  userLocation,
  currentStep = 0,
  onStepChange,
  onClose,
  className = ""
}) => {
  useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);

  // Generar pasos de navegación cuando cambia la ruta seleccionada
  useEffect(() => {
    if (selectedRoute && userLocation) {
      generateNavigationSteps();
      calculateETA();
    }
  }, [selectedRoute, userLocation, currentStep, generateNavigationSteps, calculateETA]);

  // Generar pasos de navegación
  const generateNavigationSteps = () => {
    if (!selectedRoute || !userLocation) return;

    try {
      let routeCoords = [];

      if (selectedRoute.coordenadasRuta) {
        try {
          // Verificar si ya es un array
          if (Array.isArray(selectedRoute.coordenadasRuta)) {
            routeCoords = selectedRoute.coordenadasRuta;
          } else {
            // Intentar parsear como JSON
            const parsed = JSON.parse(selectedRoute.coordenadasRuta);
            if (Array.isArray(parsed) && parsed.length > 0) {
              routeCoords = parsed;
            }
          }
        } catch (error) {
          console.warn(`Error parseando coordenadas de ruta ${selectedRoute.idRuta}:`, error);
          routeCoords = [];
        }
      }

      if (routeCoords.length === 0) {
        setNavigationSteps([{
          id: 1,
          instruction: 'Diríjase al inicio de la ruta',
          distance: 0,
          coordinates: [userLocation.lat, userLocation.lng],
          type: 'start'
        }]);
        return;
      }

      const steps = [];
      let totalDistance = 0;

      // Paso inicial: ir hacia la primera parada
      const firstStop = routeCoords[0];
      const distanceToFirst = rutasAPI.calculateDistance(
        userLocation.lat, userLocation.lng,
        firstStop[0], firstStop[1]
      );

      steps.push({
        id: 1,
        instruction: `Diríjase a la primera parada: ${selectedRoute.oriRuta}`,
        distance: distanceToFirst,
        coordinates: firstStop,
        type: 'start',
        estimatedTime: Math.ceil(distanceToFirst / 30 * 60) // minutos asumiendo 30 km/h
      });

      totalDistance += distanceToFirst;

      // Pasos intermedios entre paradas
      for (let i = 1; i < routeCoords.length; i++) {
        const prevStop = routeCoords[i - 1];
        const currentStop = routeCoords[i];
        const distance = rutasAPI.calculateDistance(
          prevStop[0], prevStop[1],
          currentStop[0], currentStop[1]
        );

        steps.push({
          id: i + 1,
          instruction: `Continúe hacia la siguiente parada`,
          distance: distance,
          coordinates: currentStop,
          type: 'intermediate',
          estimatedTime: Math.ceil(distance / 30 * 60)
        });

        totalDistance += distance;
      }

      // Paso final: llegar al destino
      const lastStop = routeCoords[routeCoords.length - 1];
      steps.push({
        id: routeCoords.length + 1,
        instruction: `Ha llegado a su destino: ${selectedRoute.desRuta}`,
        distance: 0,
        coordinates: lastStop,
        type: 'destination',
        estimatedTime: 0
      });

      setNavigationSteps(steps);
      setDistanceToDestination(totalDistance);

    } catch (error) {
      console.error('Error generando pasos de navegación:', error);
      setNavigationSteps([]);
    }
  };

  // Calcular tiempo estimado de llegada
  const calculateETA = () => {
    if (!selectedRoute || !userLocation) return;

    const totalDistance = distanceToDestination || 0;
    const avgSpeed = 30; // km/h promedio del bus
    const timeInMinutes = Math.ceil((totalDistance / avgSpeed) * 60);

    const now = new Date();
    const arrival = new Date(now.getTime() + (timeInMinutes * 60 * 1000));

    setEstimatedArrival(arrival);
  };

  // Obtener instrucción actual
  const getCurrentInstruction = () => {
    if (navigationSteps.length === 0) return 'Calculando ruta...';
    if (currentStep >= navigationSteps.length) return 'Ha llegado a su destino';

    return navigationSteps[currentStep]?.instruction || 'Siga las indicaciones';
  };

  // Obtener distancia al siguiente paso
  const getNextStepDistance = () => {
    if (currentStep >= navigationSteps.length - 1) return 0;
    return navigationSteps[currentStep + 1]?.distance || 0;
  };

  // Obtener tiempo estimado al siguiente paso
  const getNextStepTime = () => {
    const distance = getNextStepDistance();
    return Math.ceil((distance / 30) * 60); // minutos
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'start': return <Navigation className="w-4 h-4" />;
      case 'destination': return <CheckCircle className="w-4 h-4" />;
      case 'intermediate': return <ArrowRight className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStepColor = (type) => {
    switch (type) {
      case 'start': return 'text-primary-600 dark:text-primary-400';
      case 'destination': return 'text-success-600 dark:text-success-400';
      case 'intermediate': return 'text-text-secondary-light dark:text-text-secondary-dark';
      default: return 'text-text-secondary-light dark:text-text-secondary-dark';
    }
  };

  if (!selectedRoute) {
    return null;
  }

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-xl border border-border-light dark:border-border-dark overflow-hidden ${className}`}>
      {/* Header de navegación */}
      <div className="bg-primary-600 dark:bg-primary-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5" />
            <h3 className="font-bold text-lg">Navegación activa</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceGuidance(!voiceGuidance)}
              className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
            >
              {voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Información de la ruta */}
        <div className="text-sm opacity-90">
          <p className="font-medium">{selectedRoute.nomRuta}</p>
          <p>{selectedRoute.oriRuta} → {selectedRoute.desRuta}</p>
        </div>
      </div>

      {/* Instrucción actual (modo compacto) */}
      {!isExpanded && (
        <div className="p-4 bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 ${getStepColor(navigationSteps[currentStep]?.type)}`}>
              {getStepIcon(navigationSteps[currentStep]?.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                {getCurrentInstruction()}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {getNextStepDistance().toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getNextStepTime()} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel expandido con todos los pasos */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {/* Información de llegada */}
          <div className="p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Distancia total</p>
                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {distanceToDestination?.toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Llegada estimada</p>
                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {estimatedArrival ?
                    estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    '--:--'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Lista de pasos */}
          <div className="p-4">
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Pasos de navegación
            </h4>
            <div className="space-y-3">
              {navigationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
                      : 'bg-surface-light dark:bg-surface-dark'
                  }`}
                >
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    index === currentStep
                      ? 'bg-primary-600 dark:bg-primary-700 text-white'
                      : `bg-surface-light dark:bg-surface-dark ${getStepColor(step.type)}`
                  }`}>
                    {index === currentStep ? getStepIcon(step.type) : (index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      index === currentStep
                        ? 'text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-text-primary-light dark:text-text-primary-dark'
                    }`}>
                      {step.instruction}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {step.distance > 0 && (
                        <span>{step.distance.toFixed(1)} km</span>
                      )}
                      {step.estimatedTime > 0 && (
                        <span>{step.estimatedTime} min</span>
                      )}
                    </div>
                  </div>
                  {index === currentStep && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controles de navegación */}
      <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-2 bg-secondary-600 dark:bg-secondary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-text-primary-light dark:text-text-primary-dark px-3">
              Paso {currentStep + 1} de {navigationSteps.length}
            </span>
            <button
              onClick={() => onStepChange(Math.min(navigationSteps.length - 1, currentStep + 1))}
              disabled={currentStep >= navigationSteps.length - 1}
              className="p-2 bg-secondary-600 dark:bg-secondary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 bg-success-600 dark:bg-success-700 text-white rounded-lg hover:bg-success-700 dark:hover:bg-success-600 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 bg-warning-600 dark:bg-warning-700 text-white rounded-lg hover:bg-warning-700 dark:hover:bg-warning-600 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;