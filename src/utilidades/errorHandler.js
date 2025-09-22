// utilidades/errorHandler.js - Sistema unificado de manejo de errores
import React from 'react';

// ================================
// CONSTANTES DE CÓDIGOS DE ERROR
// ================================
export const ERROR_CODES = {
  // Errores de red y conexión
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',

  // Errores de autenticación
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_ACCESS_DENIED: 'AUTH_ACCESS_DENIED',

  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Errores de recursos
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Errores de operación
  OPERATION_FAILED: 'OPERATION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Errores específicos de la aplicación
  VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_VEHICLE_STATUS: 'INVALID_VEHICLE_STATUS',
  INVALID_DRIVER_STATUS: 'INVALID_DRIVER_STATUS',

  // Errores del sistema
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

// ================================
// CLASES DE ERROR PERSONALIZADAS
// ================================

export class AppError extends Error {
  constructor(code, message, details = null, statusCode = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(field, message, value = null) {
    super(ERROR_CODES.VALIDATION_ERROR, message, { field, value });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message, originalError = null) {
    super(ERROR_CODES.NETWORK_ERROR, message, { originalError });
    this.name = 'NetworkError';
  }
}

// ================================
// MANEJADOR DE ERRORES PRINCIPAL
// ================================
export const errorHandler = {
  // Procesar errores y convertirlos a formato estándar
  processError: (error, context = null) => {
    const processedError = {
      code: null,
      message: 'Error desconocido',
      details: null,
      context: context,
      timestamp: new Date().toISOString(),
      originalError: error
    };

    // Si es un error de respuesta HTTP
    if (error.response) {
      processedError.statusCode = error.response.status;

      // Manejar errores específicos por código de estado
      switch (error.response.status) {
        case 400:
          processedError.code = ERROR_CODES.VALIDATION_ERROR;
          processedError.message = error.response.data?.message || 'Datos inválidos';
          processedError.details = error.response.data?.details;
          break;

        case 401:
          processedError.code = ERROR_CODES.AUTH_UNAUTHORIZED;
          processedError.message = 'No autorizado. Inicie sesión nuevamente.';
          break;

        case 403:
          processedError.code = ERROR_CODES.AUTH_ACCESS_DENIED;
          processedError.message = 'Acceso denegado. No tiene permisos suficientes.';
          break;

        case 404:
          processedError.code = ERROR_CODES.RESOURCE_NOT_FOUND;
          processedError.message = 'Recurso no encontrado';
          break;

        case 409:
          processedError.code = ERROR_CODES.RESOURCE_CONFLICT;
          processedError.message = 'Conflicto con datos existentes';
          break;

        case 429:
          processedError.code = ERROR_CODES.RATE_LIMIT_EXCEEDED;
          processedError.message = 'Demasiadas solicitudes. Intente más tarde.';
          break;

        case 500:
          processedError.code = ERROR_CODES.SYSTEM_ERROR;
          processedError.message = 'Error interno del servidor';
          break;

        case 503:
          processedError.code = ERROR_CODES.SERVER_UNAVAILABLE;
          processedError.message = 'Servicio no disponible';
          break;

        default:
          processedError.code = ERROR_CODES.OPERATION_FAILED;
          processedError.message = error.response.data?.message || 'Error del servidor';
      }
    }
    // Si es un error de red
    else if (error.code === 'ECONNABORTED') {
      processedError.code = ERROR_CODES.CONNECTION_TIMEOUT;
      processedError.message = 'La solicitud tardó demasiado. Verifique su conexión.';
    }
    else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      processedError.code = ERROR_CODES.SERVER_UNAVAILABLE;
      processedError.message = 'No se puede conectar con el servidor.';
    }
    else if (error.code === 'ERR_NETWORK') {
      processedError.code = ERROR_CODES.NETWORK_ERROR;
      processedError.message = 'Error de conexión. Verifique su conexión a internet.';
    }
    // Si es un error personalizado de la aplicación
    else if (error instanceof AppError) {
      processedError.code = error.code;
      processedError.message = error.message;
      processedError.details = error.details;
      processedError.statusCode = error.statusCode;
    }
    // Si es un error de validación estándar
    else if (error.message && error.message.includes('required')) {
      processedError.code = ERROR_CODES.REQUIRED_FIELD;
      processedError.message = error.message;
    }
    // Error genérico
    else {
      processedError.code = ERROR_CODES.OPERATION_FAILED;
      processedError.message = error.message || 'Error desconocido';
    }

    return processedError;
  },

  // Crear un error personalizado
  createError: (code, message, details = null, statusCode = null) => {
    return new AppError(code, message, details, statusCode);
  },

  // Crear error de validación
  createValidationError: (field, message, value = null) => {
    return new ValidationError(field, message, value);
  },

  // Crear error de red
  createNetworkError: (message, originalError = null) => {
    return new NetworkError(message, originalError);
  },

  // Verificar si es un error específico
  isErrorType: (error, errorCode) => {
    const processedError = errorHandler.processError(error);
    return processedError.code === errorCode;
  },

  // Obtener mensaje amigable para el usuario
  getUserFriendlyMessage: (error) => {
    const processedError = errorHandler.processError(error);

    // Mensajes personalizados para errores comunes
    const friendlyMessages = {
      [ERROR_CODES.NETWORK_ERROR]: 'Verifique su conexión a internet e intente nuevamente.',
      [ERROR_CODES.CONNECTION_TIMEOUT]: 'La solicitud tardó demasiado. Intente nuevamente.',
      [ERROR_CODES.SERVER_UNAVAILABLE]: 'El servidor no está disponible. Intente más tarde.',
      [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Su sesión ha expirado. Inicie sesión nuevamente.',
      [ERROR_CODES.AUTH_UNAUTHORIZED]: 'No tiene permisos para realizar esta acción.',
      [ERROR_CODES.RESOURCE_NOT_FOUND]: 'El elemento solicitado no fue encontrado.',
      [ERROR_CODES.VALIDATION_ERROR]: 'Verifique los datos ingresados.',
      [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Demasiadas solicitudes. Espere un momento e intente nuevamente.',
      [ERROR_CODES.SYSTEM_ERROR]: 'Error del sistema. Intente más tarde.',
    };

    return friendlyMessages[processedError.code] || processedError.message;
  },

  // Registrar error en consola con formato estructurado
  logError: (error, context = null, level = 'error') => {
    const processedError = errorHandler.processError(error, context);

    const logData = {
      timestamp: processedError.timestamp,
      code: processedError.code,
      message: processedError.message,
      context: processedError.context,
      statusCode: processedError.statusCode,
      details: processedError.details,
      stack: error.stack
    };

    switch (level) {
      case 'warn':
        console.warn('⚠️ Error Warning:', logData);
        break;
      case 'info':
        console.info('ℹ️ Error Info:', logData);
        break;
      default:
        console.error('❌ Error:', logData);
    }

    // En desarrollo, mostrar más detalles
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Error Details');
      console.log('Original Error:', error);
      console.log('Processed Error:', processedError);
      console.groupEnd();
    }
  },

  // Manejar errores en componentes React
  handleComponentError: (error, context = null) => {
    errorHandler.logError(error, context);

    // Retornar objeto estándar para componentes
    return {
      success: false,
      error: errorHandler.processError(error, context),
      userMessage: errorHandler.getUserFriendlyMessage(error)
    };
  },

  // Manejar errores en APIs
  handleAPIError: (error, apiContext = null) => {
    errorHandler.logError(error, apiContext);

    const processedError = errorHandler.processError(error, apiContext);

    return {
      success: false,
      error: processedError,
      message: processedError.message,
      userMessage: errorHandler.getUserFriendlyMessage(error)
    };
  },

  // Retry automático para errores recuperables
  retryOperation: async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // No reintentar errores de validación o autenticación
        if (errorHandler.isErrorType(error, ERROR_CODES.VALIDATION_ERROR) ||
            errorHandler.isErrorType(error, ERROR_CODES.AUTH_UNAUTHORIZED) ||
            errorHandler.isErrorType(error, ERROR_CODES.AUTH_ACCESS_DENIED)) {
          throw error;
        }

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
          errorHandler.logError(error, `Reintentando operación (intento ${attempt}/${maxRetries})`, 'warn');
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }
};

// ================================
// HOOKS PARA COMPONENTES REACT
// ================================
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleError = (error, context = null) => {
    const processedError = errorHandler.handleComponentError(error, context);
    setError(processedError);
    return processedError;
  };

  const clearError = () => {
    setError(null);
  };

  const withErrorHandling = async (operation, context = null) => {
    setIsLoading(true);
    try {
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (error) {
      const processedError = handleError(error, context);
      setIsLoading(false);
      throw processedError;
    }
  };

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling
  };
};

// ================================
// MIDDLEWARE PARA SERVICIOS API
// ================================
export const withErrorHandling = (apiFunction) => {
  return async (...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      return errorHandler.handleAPIError(error, {
        function: apiFunction.name,
        args: args
      });
    }
  };
};

// Exportar utilidades adicionales
export default errorHandler;