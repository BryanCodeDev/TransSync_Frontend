// src/pages/DriverDashboard.jsx - Página principal para conductores

import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import DriverMainDashboard from '../components/rutas/DriverMainDashboard';
import { Truck, MapPin, Users } from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Panel de Conductor
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Bienvenido, {user?.name || user?.email?.split('@')[0] || 'Conductor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="text-text-primary-light dark:text-text-primary-dark">
                    Ubicación en tiempo real
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <Users className="w-3 h-3" />
                  <span>Visible para gestores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        <DriverMainDashboard />
      </div>
    </div>
  );
};

export default DriverDashboard;