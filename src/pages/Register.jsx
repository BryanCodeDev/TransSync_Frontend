import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaExclamationTriangle, 
  FaIdCard, 
  FaPhone, 
  FaCar, 
  FaEye, 
  FaEyeSlash,
  FaUserTie,
  FaCheckCircle
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    document: "",
    email: "",
    phone: "",
    vehicle_plate: "",
    role: "usuario",
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
    
    const fieldError = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: fieldError
    });
    
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(field => {
      if (field === "vehicle_plate" && formData.role !== "conductor") {
        return;
      }
      
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
    
    if (!validateForm()) {
      return;
    }
    
    setError("");
    setLoading(true);

    try {
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
        alert("Registro exitoso, ahora inicia sesión.");
        navigate("/login");
      } else {
        throw new Error(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error de registro:", err);
      
      if (err.message.includes("ya existe") || err.message.includes("ya está registrado")) {
        setError("Este correo electrónico ya está registrado. Intente iniciar sesión.");
      } else {
        setError(err.message || "Error al registrar usuario. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const getRoleIcon = (roleValue) => {
    switch (roleValue) {
      case 'admin':
        return <FaUserTie className="text-purple-600" />;
      case 'conductor':
        return <FaCar className="text-blue-600" />;
      default:
        return <FaUser className="text-green-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Brand section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="relative z-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                TransSync
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Sistema de gestión empresarial para el transporte moderno
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-blue-100">
                  <FaCheckCircle className="mr-3 text-blue-300" />
                  <span>Gestión integral de rutas</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <FaCheckCircle className="mr-3 text-blue-300" />
                  <span>Control de conductores</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <FaCheckCircle className="mr-3 text-blue-300" />
                  <span>Administración centralizada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="lg:w-3/5 p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl xl:text-4xl font-bold text-slate-800 mb-3">Crear Cuenta</h2>
              <p className="text-slate-600 text-lg">Complete el formulario para registrarse</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-200">
                <FaExclamationTriangle className="mr-3 flex-shrink-0 text-red-500 text-lg" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-8">
              {/* Role selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-3">
                  Tipo de cuenta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {getRoleIcon(role)}
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="conductor">Conductor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Name and Last Name */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                    Nombre
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ingrese su nombre"
                      value={name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.name 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  {formTouched && formErrors.name && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 mb-3">
                    Apellido
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Ingrese su apellido"
                      value={last_name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.last_name 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                  {formTouched && formErrors.last_name && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Document and Phone */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="document" className="block text-sm font-semibold text-slate-700 mb-3">
                    Documento de identidad
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="document"
                      name="document"
                      type="text"
                      placeholder="Ingrese su documento"
                      value={document}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.document 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                    />
                  </div>
                  {formTouched && formErrors.document && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.document}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-3">
                    Teléfono
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Ingrese su teléfono"
                      value={phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.phone 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                    />
                  </div>
                  {formTouched && formErrors.phone && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                      formTouched && formErrors.email 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                {formTouched && formErrors.email && (
                  <p className="text-red-600 text-sm mt-2">{formErrors.email}</p>
                )}
              </div>

              {/* Vehicle plate (only for drivers) */}
              {role === "conductor" && (
                <div>
                  <label htmlFor="vehicle_plate" className="block text-sm font-semibold text-slate-700 mb-3">
                    Placa del vehículo
                  </label>
                  <div className="relative">
                    <FaCar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="vehicle_plate"
                      name="vehicle_plate"
                      type="text"
                      placeholder="Ingrese la placa del vehículo"
                      value={vehicle_plate}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.vehicle_plate 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required={role === "conductor"}
                    />
                  </div>
                  {formTouched && formErrors.vehicle_plate && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.vehicle_plate}</p>
                  )}
                </div>
              )}

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Cree una contraseña"
                      value={password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.password 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                      onClick={() => togglePasswordVisibility('password')}
                      tabIndex="-1"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formTouched && formErrors.password && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme su contraseña"
                      value={confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg ${
                        formTouched && formErrors.confirmPassword 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                          : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      tabIndex="-1"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formTouched && formErrors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-2">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Requisitos de contraseña:</p>
                <div className="space-y-2">
                  <div className={`flex items-center text-sm ${password.length >= 6 ? "text-green-600" : "text-slate-500"}`}>
                    <FaCheckCircle className={`mr-3 ${password.length >= 6 ? "text-green-500" : "text-slate-300"}`} />
                    Mínimo 6 caracteres
                  </div>
                  <div className={`flex items-center text-sm ${/\d/.test(password) ? "text-green-600" : "text-slate-500"}`}>
                    <FaCheckCircle className={`mr-3 ${/\d/.test(password) ? "text-green-500" : "text-slate-300"}`} />
                    Al menos un número
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Registrando...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              {/* Login link */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-slate-600 text-base mb-4">¿Ya tienes una cuenta?</p>
                <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors duration-200"
                  onClick={() => navigate("/login")}
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;