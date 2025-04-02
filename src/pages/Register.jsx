import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaBus, FaExclamationTriangle } from "react-icons/fa";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  // Validaciones
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        }
        break;
      
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Ingrese un correo electrónico válido";
        }
        break;
      
      case "password":
        if (value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        } else if (!/\d/.test(value)) {
          error = "La contraseña debe incluir al menos un número";
        }
        break;
      
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Las contraseñas no coinciden";
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    setFormTouched(true);
    
    // Validar campo y actualizar errores
    const fieldError = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: fieldError
    });
    
    // Limpiar error general
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Validar todos los campos
    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        errors[field] = fieldError;
        isValid = false;
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    
    // Validar formulario completo
    if (!validateForm()) {
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // Enviar solo los campos que el backend espera (name, email, password)
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito con alert y redirigir al login
        // Esto es compatible con tu backend original
        alert("Registro exitoso, ahora inicia sesión.");
        navigate("/login");
      } else {
        throw new Error(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error de registro:", err);
      
      // Manejo de errores específicos
      if (err.message.includes("ya existe")) {
        setError("Este correo electrónico ya está registrado. Intente iniciar sesión.");
      } else {
        setError(err.message || "Error al registrar usuario. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="background-overlay"></div>
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <FaBus className="logo-icon" />
          </div>
          <h1>Registro en TransSync</h1>
          <p className="register-subtitle">Cree su cuenta para comenzar</p>
        </div>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ingrese su nombre"
                value={name}
                onChange={handleChange}
                className={formTouched && formErrors.name ? "input-error" : ""}
                required
                autoComplete="name"
              />
            </div>
            {formTouched && formErrors.name && (
              <p className="field-error">{formErrors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={handleChange}
                className={formTouched && formErrors.email ? "input-error" : ""}
                required
                autoComplete="email"
              />
            </div>
            {formTouched && formErrors.email && (
              <p className="field-error">{formErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Cree una contraseña"
                value={password}
                onChange={handleChange}
                className={formTouched && formErrors.password ? "input-error" : ""}
                required
                autoComplete="new-password"
              />
            </div>
            {formTouched && formErrors.password && (
              <p className="field-error">{formErrors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={handleChange}
                className={formTouched && formErrors.confirmPassword ? "input-error" : ""}
                required
                autoComplete="new-password"
              />
            </div>
            {formTouched && formErrors.confirmPassword && (
              <p className="field-error">{formErrors.confirmPassword}</p>
            )}
          </div>

          <div className="password-requirements">
            <p>La contraseña debe:</p>
            <ul>
              <li className={password.length >= 6 ? "requirement-met" : ""}>
                Tener al menos 6 caracteres
              </li>
              <li className={/\d/.test(password) ? "requirement-met" : ""}>
                Incluir al menos un número
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className={`register-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Registrando...</span>
              </>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>¿Ya tienes cuenta?</p>
          <div className="login-link">
            <button 
              type="button" 
              className="register-button secondary-button"
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