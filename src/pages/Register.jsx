import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaBus } from "react-icons/fa";
import "../styles/register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userName", name);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message || "Error al registrar usuario. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <FaBus className="logo-icon" />
          </div>
          <h1>Registro en TransSync</h1>
          <p className="register-subtitle">Cree su cuenta para comenzar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="Ingrese su nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
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
                placeholder="Cree una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={`register-button ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="register-footer">
          <p>¿Ya tienes cuenta?</p>
          <div className="login-link">
            <button 
              type="button" 
              className="register-button"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
