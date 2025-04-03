import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaBus, FaExclamationTriangle, FaIdCard, FaPhone, FaCar, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    document: "",
    email: "",
    phone: "",
    vehicle_plate: "",
    role: "usuario", // Valor por defecto
    password: "",
    confirmPassword: ""
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const { name, last_name, document, email, phone, vehicle_plate, role, password, confirmPassword } = formData;

  // Validaciones mejoradas
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
          error = "El nombre solo debe contener letras";
        }
        break;
      
      case "last_name":
        if (value.trim().length < 3) {
          error = "El apellido debe tener al menos 3 caracteres";
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
          error = "El apellido solo debe contener letras";
        }
        break;
      
      case "document":
        if (value.trim().length < 5) {
          error = "El documento debe tener al menos 5 caracteres";
        } else if (!/^\d+$/.test(value)) {
          error = "El documento solo debe contener números";
        }
        break;
      
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Ingrese un correo electrónico válido";
        }
        break;
      
      case "phone":
        if (!/^\d{7,15}$/.test(value)) {
          error = "El teléfono debe contener solo números, entre 7 y 15 dígitos";
        }
        break;
      
      case "vehicle_plate":
        // Solo validar si es conductor
        if (formData.role === "conductor") {
          if (value.trim().length < 5) {
            error = "La placa del vehículo debe tener al menos 5 caracteres";
          } else if (!/^[A-Za-z0-9\-\s]+$/.test(value)) {
            error = "Formato de placa inválido (letras, números, guiones y espacios)";
          }
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
      // No validar placa de vehículo si no es conductor
      if (field === "vehicle_plate" && formData.role !== "conductor") {
        return;
      }
      
      // No validar campos vacíos opcionales
      if (field === "vehicle_plate" && formData.role !== "conductor" && !formData[field]) {
        return;
      }
      
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
      // Enviar los campos que el backend espera
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          last_name, 
          document,
          email,
          phone,
          vehicle_plate: role === "conductor" ? vehicle_plate : "",
          role,
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito con alert y redirigir al login
        alert("Registro exitoso, ahora inicia sesión.");
        navigate("/login");
      } else {
        throw new Error(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error de registro:", err);
      
      // Manejo de errores específicos
      if (err.message.includes("ya existe") || err.message.includes("ya está registrado")) {
        setError("Este correo electrónico ya está registrado. Intente iniciar sesión.");
      } else {
        setError(err.message || "Error al registrar usuario. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Tipo de cuenta</label>
              <div className="select-wrapper">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="usuario">Usuario</option>
                  <option value="conductor">Conductor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
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
                  autoComplete="given-name"
                />
              </div>
              {formTouched && formErrors.name && (
                <p className="field-error">{formErrors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Ingrese su apellido"
                  value={last_name}
                  onChange={handleChange}
                  className={formTouched && formErrors.last_name ? "input-error" : ""}
                  required
                  autoComplete="family-name"
                />
              </div>
              {formTouched && formErrors.last_name && (
                <p className="field-error">{formErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="document">Documento de identidad</label>
              <div className="input-wrapper">
                <FaIdCard className="input-icon" />
                <input
                  id="document"
                  name="document"
                  type="text"
                  placeholder="Ingrese su documento"
                  value={document}
                  onChange={handleChange}
                  className={formTouched && formErrors.document ? "input-error" : ""}
                  required
                />
              </div>
              {formTouched && formErrors.document && (
                <p className="field-error">{formErrors.document}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ingrese su teléfono"
                  value={phone}
                  onChange={handleChange}
                  className={formTouched && formErrors.phone ? "input-error" : ""}
                  required
                />
              </div>
              {formTouched && formErrors.phone && (
                <p className="field-error">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
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
          </div>

          {role === "conductor" && (
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="vehicle_plate">Placa del vehículo</label>
                <div className="input-wrapper">
                  <FaCar className="input-icon" />
                  <input
                    id="vehicle_plate"
                    name="vehicle_plate"
                    type="text"
                    placeholder="Ingrese la placa del vehículo"
                    value={vehicle_plate}
                    onChange={handleChange}
                    className={formTouched && formErrors.vehicle_plate ? "input-error" : ""}
                    required={role === "conductor"}
                  />
                </div>
                {formTouched && formErrors.vehicle_plate && (
                  <p className="field-error">{formErrors.vehicle_plate}</p>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Cree una contraseña"
                  value={password}
                  onChange={handleChange}
                  className={formTouched && formErrors.password ? "input-error" : ""}
                  required
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => togglePasswordVisibility('password')}
                  tabIndex="-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
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
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme su contraseña"
                  value={confirmPassword}
                  onChange={handleChange}
                  className={formTouched && formErrors.confirmPassword ? "input-error" : ""}
                  required
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formTouched && formErrors.confirmPassword && (
                <p className="field-error">{formErrors.confirmPassword}</p>
              )}
            </div>
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