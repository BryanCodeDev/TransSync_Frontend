import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaBus } from "react-icons/fa";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (email === "admin@transsync.com" && password === "admin123") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", "Admin");
        navigate("/dashboard");
      } else {
        setError("Credenciales incorrectas. Por favor, intente nuevamente.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Funcionalidad de recuperación de contraseña en desarrollo.");
  };

  return (
    <div className="login-container">
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="remember-forgot">
            <label className="remember-container">
              <input type="checkbox" />
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
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta?</p>
          <div className="register-link">
            <button 
              type="button" 
              className="login-button"
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
