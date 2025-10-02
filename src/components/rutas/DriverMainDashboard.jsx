import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Settings
} from 'lucide-react';
import DriverLocationActivator from './DriverLocationActivator';
import DriverStatusIndicator from './DriverStatusIndicator';
import AutoDriverRegistration from './AutoDriverRegistration';
import driversAPI from '../../utilidades/driversAPI';
import { useAuthContext } from '../../context/AuthContext';

const DriverMainDashboard = ({ className = "" }) => {
  const { user } = useAuthContext();
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'location', 'settings'

  // Callback para cuando se complete el registro automático
  const handleRegistrationComplete = (newDriver) => {
    setDriverInfo(newDriver);
    setIsRegistered(true);
    setLoading(false);
  };

  // Cargar información del conductor si ya está registrado
  useEffect(() => {
    const loadDriverInfo = async () => {
      if (!user?.idUsuario) return;

      try {
        const drivers = await driversAPI.getAll();
        const currentDriver = drivers.find(d => d.idUsuario === user.idUsuario);

        if (currentDriver) {
          setDriverInfo(currentDriver);
          setIsRegistered(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error cargando información del conductor:', error);
      }
    };

    loadDriverInfo();
  }, [user]);

  if (loading) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-text-primary-light dark:text-text-primary-dark">
            Cargando panel de conductor...
          </span>
        </div>
      </div>
    );
  }

  if (!isRegistered && !loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <AutoDriverRegistration onRegistrationComplete={handleRegistrationComplete} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con navegación por pestañas */}
      <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark">
        <div className="border-b border-border-light dark:border-border-dark">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Información General
            </button>

            <button
              onClick={() => setActiveTab('location')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'location'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Ubicación
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configuración
            </button>
          </nav>
        </div>

        {/* Contenido de pestañas */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Información del conductor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Información del Conductor
                  </h3>

                  {driverInfo ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Nombre:</span>
                        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          {driverInfo?.nomUsuario} {driverInfo?.apeUsuario}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          driverInfo?.estConductor === 'ACTIVO'
                            ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                            : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                        }`}>
                          {driverInfo?.estConductor?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Licencia:</span>
                        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          {driverInfo?.tipLicConductor || 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">Vehículo:</span>
                        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          {driverInfo?.plaVehiculo || 'Sin asignar'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        Cargando información del conductor...
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Estado del Sistema
                  </h3>

                  <DriverStatusIndicator compact={false} showDetails={true} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Control de Ubicación
                </h3>

                <DriverLocationActivator
                  showDetails={true}
                  autoStart={false}
                  className="w-full"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estado de Otros Conductores
                </h3>

                <DriverStatusIndicator compact={true} showDetails={false} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
                  Configuración de Conductor
                </h3>

                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    Aquí puedes configurar las preferencias de tu perfil de conductor,
                    ajustes de ubicación y notificaciones.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        Auto-iniciar seguimiento al entrar
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-border-light dark:border-border-dark"
                        defaultChecked={false}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        Notificaciones de ubicación
                      </span>
                      <input
                        type="checkbox"
                        className="rounded border-border-light dark:border-border-dark"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMainDashboard;