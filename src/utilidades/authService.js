import axios from "axios";

// URL base actualizada para coincidir con tu backend
const API_URL = "http://localhost:5000/api/auth";

// Crear instancia de axios con configuración personalizada
const authClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejar errores de manera consistente
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging del error para depuración
    console.error('Auth Service Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Formatear el error para el frontend
    const formattedError = {
      message: error.response?.data?.message || error.message || "Error desconocido",
      status: error.response?.status,
      code: error.code
    };

    return Promise.reject(formattedError);
  }
);

export const register = async (email, password) => {
  try {
    // Validaciones básicas antes de enviar
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Por favor ingrese un correo electrónico válido");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const response = await authClient.post('/register', { 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    return response.data;
  } catch (error) {
    // Manejo específico de errores comunes
    if (error.message.includes("ya existe") || error.message.includes("Ya Está Registrado")) {
      throw new Error("Este correo electrónico ya está registrado. Intente iniciar sesión.");
    } else if (error.message.includes("foreign key constraint") || error.message.includes("Error En El Servidor")) {
      throw new Error("Error en la configuración del sistema. Por favor contacte al administrador o intente más tarde.");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("La solicitud tardó demasiado. Verifique su conexión e intente nuevamente.");
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error("No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.");
    }
    
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    // Validaciones básicas antes de enviar
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }

    const response = await authClient.post('/login', { 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    // Guardar datos en localStorage si el login es exitoso
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userToken', response.data.token); // Por compatibilidad
      localStorage.setItem('isAuthenticated', 'true');
      
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('userName', response.data.user.name || '');
        localStorage.setItem('userRole', response.data.user.role || '');
        localStorage.setItem('userEmail', response.data.user.email || '');
        localStorage.setItem('userId', response.data.user.id || '');
      }
    }
    
    return response.data;
  } catch (error) {
    // Manejo específico de errores de login
    if (error.status === 401) {
      throw new Error("Credenciales incorrectas. Verifique su email y contraseña.");
    } else if (error.status === 403) {
      throw new Error("Su cuenta no está activada. Por favor verifique su correo electrónico.");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("La solicitud tardó demasiado. Verifique su conexión e intente nuevamente.");
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error("No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.");
    }
    
    throw error;
  }
};

export const verifyAccount = async (token) => {
  try {
    if (!token) {
      throw new Error("Token de verificación requerido");
    }

    const response = await authClient.get(`/verify?token=${token}`);
    return response.data;
  } catch (error) {
    if (error.status === 400) {
      throw new Error("Token de verificación inválido o expirado.");
    } else if (error.status === 404) {
      throw new Error("Usuario no encontrado o ya verificado.");
    }
    
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    if (!email) {
      throw new Error("Email es requerido");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Por favor ingrese un correo electrónico válido");
    }

    const response = await authClient.post('/forgot-password', { 
      email: email.trim().toLowerCase() 
    });
    return response.data;
  } catch (error) {
    if (error.status === 404) {
      throw new Error("El correo electrónico no está registrado.");
    }
    
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    if (!token || !newPassword) {
      throw new Error("Token y nueva contraseña son requeridos");
    }

    if (newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    const response = await authClient.post(`/reset-password?token=${token}`, { 
      newPassword 
    });
    return response.data;
  } catch (error) {
    if (error.status === 400) {
      throw new Error("Token de restablecimiento inválido o expirado.");
    } else if (error.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    
    throw error;
  }
};

export const logout = () => {
  try {
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberedEmail');
    localStorage.setItem('rememberMe', 'false');
    
    return true;
  } catch (error) {
    console.error('Error en logout:', error);
    // Limpiar de todas formas
    localStorage.clear();
    return false;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
    const isAuth = localStorage.getItem('isAuthenticated');
    return !!(token && isAuth === 'true');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Fallback con datos separados
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    
    if (userName || userRole || userEmail || userId) {
      return {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parseando userData:', error);
    return null;
  }
};

export const getUserRole = () => {
  try {
    return localStorage.getItem('userRole') || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

export const isSuperAdmin = () => {
  return hasRole('SUPERADMIN');
};

export const isAdmin = () => {
  return hasRole('ADMINISTRADOR');
};

// Función para verificar la salud de la conexión con el servidor
export const checkServerHealth = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/health", {
      method: "GET",
      timeout: 5000
    });
    
    if (response.ok) {
      return { status: 'OK', message: 'Servidor conectado' };
    } else {
      return { status: 'ERROR', message: 'Servidor no responde correctamente' };
    }
  } catch (error) {
    return { 
      status: 'ERROR', 
      message: 'No se puede conectar con el servidor',
      error: error.message 
    };
  }
};

// Create a named object for the default export
const authService = {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  isSuperAdmin,
  isAdmin,
  checkServerHealth
};

// Export the named object as default
export default authService;