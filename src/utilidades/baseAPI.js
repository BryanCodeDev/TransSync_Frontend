/**
 * Clase base para APIs del proyecto TransSync
 * Proporciona configuración común y manejo de errores
 */
class BaseAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://transyncbackend-production.up.railway.app';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtener headers con token de autorización
   */
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      ...this.defaultHeaders,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Manejar errores de respuesta HTTP
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje de estado
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Realizar petición GET
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);

    // Agregar parámetros de consulta
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar petición POST
   */
  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar petición PUT
   */
  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar petición DELETE
   */
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar petición PATCH
   */
  async patch(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  /**
   * Subir archivo
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    formData.append('file', file);

    // Agregar datos adicionales
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    return this.handleResponse(response);
  }
}

export default BaseAPI;