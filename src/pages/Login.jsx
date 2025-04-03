import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaBus, FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay credenciales guardadas al cargar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validación de email
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña (al menos 6 caracteres)
  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormTouched(true);
    setError(""); // Limpiar errores al cambiar input
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    
    // Validaciones
    if (!isEmailValid(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      return;
    }
    
    if (!isPasswordValid(password)) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar estado de "recordarme"
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.setItem("rememberMe", "false");
        }
        
        // Guardar información de autenticación
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", data.user?.name || "");
        localStorage.setItem("userRole", data.user?.role || "");
        
        // Guardar token solo si existe en la respuesta
        if (data.token) {
          localStorage.setItem("userToken", data.token);
        }
        
        // Redirigir a home en lugar de dashboard
        navigate("/home");
      } else {
        setError(data.message || "Error de autenticación. Verifique sus credenciales.");
      }
    } catch (err) {
      console.error("Error de login:", err);
      setError("Error al conectar con el servidor. Verifique su conexión e intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Funcionalidad de recuperación de contraseña en desarrollo.");
  };

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="background-overlay"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaBus className="logo-icon" />
          </div>
          <h1>TransSync</h1>
          <p className="login-subtitle">Sistema de Gestión de Transporte Público</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={handleInputChange(setEmail)}
                className={formTouched && !isEmailValid(email) && email ? "input-error" : ""}
                required
                autoComplete="email"
              />
            </div>
            {formTouched && !isEmailValid(email) && email && (
              <p className="field-error">Por favor ingrese un correo válido</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={handleInputChange(setPassword)}
                className={formTouched && !isPasswordValid(password) && password ? "input-error" : ""}
                required
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formTouched && !isPasswordValid(password) && password && (
              <p className="field-error">La contraseña debe tener al menos 6 caracteres</p>
            )}
          </div>

          <div className="remember-forgot">
            <label className="remember-container">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="checkmark"></span>
              Recordarme
            </label>
            <button 
              type="button" 
              className="forgot-link" 
              onClick={handleForgotPassword}
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Verificando...</span>
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta?</p>
          <div className="register-link">
            <button 
              type="button" 
              className="login-button secondary-button"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;