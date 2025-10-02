import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Activity
} from 'lucide-react';
import DriverLocationActivator from './DriverLocationActivator';
import driversAPI from '../../utilidades/driversAPI';
import { useAuthContext } from '../../context/AuthContext';

const DriverDashboard = ({ className = "" }) => {
  const { user } = useAuthContext();
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Cargar información del conductor
  useEffect(() => {
    const loadDriverInfo = async () => {
      if (!user?.idUsuario) return;

      try {
        setLoading(true);
        const drivers = await driversAPI.getAll();
        const currentDriver = drivers.find(d => d.idUsuario === user.idUsuario);

        if (currentDriver) {
          setDriverInfo(currentDriver);
          setIsRegistered(true);
        } else {
          // Si no está registrado como conductor, intentar registrarlo automáticamente
          await registerDriver();
        }
      } catch (error) {
        console.error('Error cargando información del conductor:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDriverInfo();
  }, [user]);

  // Registrar conductor automáticamente
  const registerDriver = async () => {
    if (!user) return;

    try {
      const driverData = {
        nomUsuario: user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Conductor',
        apeUsuario: user.name?.split(' ').slice(1).join(' ') || 'Usuario',
        email: user.email,
        numDocUsuario: user.idUsuario,
        telUsuario: '',
        tipLicConductor: 'B1',
        fecVenLicConductor: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año
        estConductor: 'ACTIVO'
      };

      const newDriver = await driversAPI.create(driverData);
      setDriverInfo(newDriver);
      setIsRegistered(true);
      console.log('✅ Conductor registrado automáticamente:', newDriver);
    } catch (error) {
      console.error('❌ Error registrando conductor automáticamente:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-text-primary-light dark:text-text-primary-dark">
            Cargando información del conductor...
          </span>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-warning-600 dark:text-warning-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Registro de Conductor
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Se está configurando automáticamente su perfil de conductor...
          </p>
          <button
            onClick={registerDriver}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Configurar Manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Información del conductor */}
      <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Panel de Conductor
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {driverInfo?.nomUsuario} {driverInfo?.apeUsuario}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {driverInfo?.estConductor === 'ACTIVO' ? '✓' : '○'}
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Estado: {driverInfo?.estConductor?.replace('_', ' ')}
            </div>
          </div>

          <div className="text-center p-4 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div className="text-2xl font-bold text-info-600 dark:text-info-400">
              {driverInfo?.tipLicConductor || 'N/A'}
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Licencia
            </div>
          </div>

          <div className="text-center p-4 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {driverInfo?.plaVehiculo ? '✓' : '○'}
            </div>
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Vehículo Asignado
            </div>
          </div>
        </div>
      </div>

      {/* Activador de ubicación */}
      <DriverLocationActivator
        showDetails={true}
        autoStart={false}
        className="w-full"
      />

      {/* Información adicional */}
      <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6">
        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Información del Sistema
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              ID de Conductor:
            </span>
            <span className="font-mono text-text-primary-light dark:text-text-primary-dark">
              {driverInfo?.idConductor}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              ID de Usuario:
            </span>
            <span className="font-mono text-text-primary-light dark:text-text-primary-dark">
              {user?.idUsuario}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              Empresa:
            </span>
            <span className="text-text-primary-light dark:text-text-primary-dark">
              {user?.idEmpresa || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              Última conexión:
            </span>
            <span className="text-text-primary-light dark:text-text-primary-dark">
              {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;