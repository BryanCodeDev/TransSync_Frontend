import baseAPI from './baseAPI';

/**
 * API para manejar ubicación de conductores en tiempo real
 */
class LocationAPI extends baseAPI {
  constructor() {
    super();
    this.baseURL = process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app';
  }

  /**
   * Enviar ubicación actual del conductor
   * @param {Object} locationData - Datos de ubicación {lat, lng, accuracy, timestamp}
   * @param {string} conductorId - ID del conductor
   */
  async sendLocation(locationData, conductorId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/conductores/${conductorId}/ubicacion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitud: locationData.lat,
          longitud: locationData.lng,
          precision: locationData.accuracy,
          timestamp: locationData.timestamp || new Date().toISOString(),
          velocidad: locationData.speed || null,
          rumbo: locationData.heading || null
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enviando ubicación:', error);
      throw error;
    }
  }

  /**
   * Obtener ubicación actual de un conductor específico
   * @param {string} conductorId - ID del conductor
   */
  async getConductorLocation(conductorId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/conductores/${conductorId}/ubicacion`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo ubicación del conductor:', error);
      throw error;
    }
  }

  /**
   * Obtener ubicaciones de todos los conductores activos
   * @param {Object} filters - Filtros opcionales {empresaId, activos, rutaId}
   */
  async getAllConductoresLocations(filters = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();

      if (filters.empresaId) queryParams.append('empresaId', filters.empresaId);
      if (filters.activos !== undefined) queryParams.append('activos', filters.activos);
      if (filters.rutaId) queryParams.append('rutaId', filters.rutaId);

      const url = `${this.baseURL}/api/conductores/ubicaciones${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo ubicaciones de conductores:', error);
      throw error;
    }
  }

  /**
   * Iniciar seguimiento de ubicación para un conductor
   * @param {string} conductorId - ID del conductor
   * @param {number} intervalSeconds - Intervalo de envío en segundos (default: 30)
   */
  async startLocationTracking(conductorId, intervalSeconds = 30) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/conductores/${conductorId}/seguimiento/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intervaloSegundos: intervalSeconds
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error iniciando seguimiento de ubicación:', error);
      throw error;
    }
  }

  /**
   * Detener seguimiento de ubicación para un conductor
   * @param {string} conductorId - ID del conductor
   */
  async stopLocationTracking(conductorId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/conductores/${conductorId}/seguimiento/detener`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deteniendo seguimiento de ubicación:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de ubicaciones de un conductor
   * @param {string} conductorId - ID del conductor
   * @param {Object} options - Opciones {fechaInicio, fechaFin, limite}
   */
  async getLocationHistory(conductorId, options = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();

      if (options.fechaInicio) queryParams.append('fechaInicio', options.fechaInicio);
      if (options.fechaFin) queryParams.append('fechaFin', options.fechaFin);
      if (options.limite) queryParams.append('limite', options.limite);

      const url = `${this.baseURL}/api/conductores/${conductorId}/ubicaciones/historial${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo historial de ubicaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ubicación de conductores
   * @param {Object} filters - Filtros {empresaId, fechaInicio, fechaFin}
   */
  async getLocationStats(filters = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();

      if (filters.empresaId) queryParams.append('empresaId', filters.empresaId);
      if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);

      const url = `${this.baseURL}/api/conductores/ubicaciones/estadisticas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas de ubicación:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
const locationAPI = new LocationAPI();
export default locationAPI;