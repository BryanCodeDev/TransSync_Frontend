import authAPI from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';
import driversAPI from '../utilidades/driversAPI';
import vehiculosAPI from '../utilidades/vehiculosAPI';
import rutasAPI from '../utilidades/rutasAPI';
import viajesAPI from '../utilidades/viajesAPI';
import informesAPI from '../utilidades/informesAPI';
import emergencyAPI from '../utilidades/emergencyAPI';
import dashboardAPI from '../utilidades/dashboardAPI';
import chatbotAPI from '../utilidades/chatbotAPI';
import { healthCheck, apiUtils } from './baseAPI';

const API = {
  auth: authAPI,
  admin: adminAPI,
  drivers: driversAPI,
  vehiculos: vehiculosAPI,
  rutas: rutasAPI,
  viajes: viajesAPI,
  informes: informesAPI,
  dashboard: dashboardAPI,
  emergency: emergencyAPI,
  utils: apiUtils,
  healthCheck,
  
  // Método para verificar conectividad general
  checkAllServices: async () => {
    const results = {};
    const services = ['auth', 'drivers', 'vehiculos', 'rutas'];
    
    for (const service of services) {
      try {
        results[service] = { status: 'OK', timestamp: new Date().toISOString() };
      } catch (error) {
        results[service] = { 
          status: 'ERROR', 
          error: error.message,
          timestamp: new Date().toISOString() 
        };
      }
    }
    
    return {
      overall: Object.values(results).every(r => r.status === 'OK') ? 'HEALTHY' : 'DEGRADED',
      services: results,
      timestamp: new Date().toISOString()
    };
  }
};

export default API;

export {
  authAPI,
  adminAPI,
  driversAPI,
  vehiculosAPI,
  rutasAPI,
  viajesAPI,
  informesAPI,
  emergencyAPI,
  dashboardAPI,
  apiUtils,
  healthCheck
};