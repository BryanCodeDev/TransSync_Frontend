import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Truck
} from 'lucide-react';
import driversAPI from '../../utilidades/driversAPI';
import realTimeService from '../../utilidades/realTimeService';
import { useAuthContext } from '../../context/AuthContext';

const AutoDriverRegistration = ({
  className = "",
  onRegistrationComplete = null
}) => {
  const { user } = useAuthContext();
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);

  // Cargar información del conductor y verificar si ya está registrado
  useEffect(() => {
    const checkAndRegisterDriver = async () => {
      if (!user?.idUsuario) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar si el conductor ya está registrado
        const drivers = await driversAPI.getAll();
        const existingDriver = drivers.find(d => d.idUsuario === user.idUsuario);

        if (existingDriver) {
          setDriverInfo(existingDriver);
          setIsRegistered(true);
          console.log('✅ Conductor ya registrado:', existingDriver);

          // Notificar que el conductor entró al sistema
          realTimeService.emit('conductor:entered', {
            conductorId: existingDriver.idConductor,
            userInfo: {
              name: `${existingDriver.nomUsuario} ${existingDriver.apeUsuario}`,
              email: existingDriver.email,
              idUsuario: user.idUsuario
            },
            timestamp: new Date()
          });
        } else {
          // Registrar conductor automáticamente
          await registerDriver();
        }
      } catch (error) {
        console.error('❌ Error verificando registro de conductor:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAndRegisterDriver();
  }, [user]);

  // Registrar conductor automáticamente
  const registerDriver = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

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

      // Notificar que el conductor entró al sistema
      realTimeService.emit('conductor:entered', {
        conductorId: newDriver.idConductor,
        userInfo: {
          name: `${newDriver.nomUsuario} ${newDriver.apeUsuario}`,
          email: newDriver.email,
          idUsuario: user.idUsuario
        },
        timestamp: new Date()
      });

      // Callback para notificar registro completo
      if (onRegistrationComplete) {
        onRegistrationComplete(newDriver);
      }
    } catch (error) {
      console.error('❌ Error registrando conductor automáticamente:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar conductor manualmente
  const handleManualRegistration = () => {
    registerDriver();
  };

  if (loading) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400 mr-3" />
          <span className="text-text-primary-light dark:text-text-primary-dark">
            Verificando registro de conductor...
          </span>
        </div>
      </div>
    );
  }

  if (isRegistered && driverInfo) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-full">
            <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">
              Conductor Registrado
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {driverInfo.nomUsuario} {driverInfo.apeUsuario} • ID: {driverInfo.idConductor}
            </p>
            <p className="text-xs text-success-600 dark:text-success-400 mt-1">
              ✓ Apareces automáticamente en el mapa de gestores
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-error-600 dark:text-error-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Error de Registro
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            {error}
          </p>
          <button
            onClick={handleManualRegistration}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            Reintentar Registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background-light dark:bg-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark p-6 ${className}`}>
      <div className="text-center py-4">
        <Truck className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Registro Automático de Conductor
        </h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
          Se está configurando automáticamente su perfil de conductor para que aparezca en el mapa de gestores...
        </p>
        <button
          onClick={handleManualRegistration}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <UserPlus className="w-4 h-4" />
          Configurar Ahora
        </button>
      </div>
    </div>
  );
};

export default AutoDriverRegistration;