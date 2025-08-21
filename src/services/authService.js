import axios from "axios";

// URL base actualizada para coincidir con tu backend
const API_URL = "http://localhost:5000/api/auth";

export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { 
      email: email.trim().toLowerCase(), 
      password 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { 
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
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const verifyAccount = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/verify?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { 
      email: email.trim().toLowerCase() 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password?token=${token}`, { 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en el servidor" };
  }
};

export const logout = () => {
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
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
  const isAuth = localStorage.getItem('isAuthenticated');
  return !!(token && isAuth === 'true');
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
  return localStorage.getItem('userRole') || null;
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