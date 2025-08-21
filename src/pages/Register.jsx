import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  FaLock, 
  FaEnvelope, 
  FaExclamationTriangle, 
  FaEye, 
  FaEyeSlash,
  FaUserTie,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdBadge 
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Datos de usuario básicos
    email: "",
    password: "",
    confirmPassword: "",
    
    // Datos personales
    nombres: "",
    apellidos: "",
    numeroDocumento: "",
    telefono: "",
    
    // Tipo de cuenta
    tipoUsuario: "", // 'ADMINISTRADOR' o 'CONDUCTOR'
    
    // Datos de empresa (para administradores)
    nombreEmpresa: "",
    nitEmpresa: "",
    direccionEmpresa: "",
    emailEmpresa: "",
    telefonoEmpresa: "",
    
    // Datos específicos de conductor
    tipoLicencia: "",
    fechaVencimientoLicencia: "",
    
    // Empresa existente (para conductores)
    empresaExistente: "",
    codigoEmpresa: ""
  });
  
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cargar empresas disponibles para conductores
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/empresas/publicas");
        if (response.ok) {
          const data = await response.json();
          setEmpresasDisponibles(data);
        }
      } catch (error) {
        console.warn('No se pudieron cargar las empresas:', error);
      }
    };

    if (formData.tipoUsuario === 'CONDUCTOR') {
      fetchEmpresas();
    }
  }, [formData.tipoUsuario]);

  const tiposLicencia = [
    { value: 'B1', label: 'B1 - Automóviles, camperos, camionetas hasta 3.5 ton' },
    { value: 'B2', label: 'B2 - Camiones rígidos hasta 7.5 ton' },
    { value: 'B3', label: 'B3 - Vehículos articulados hasta 9 ton' },
    { value: 'C1', label: 'C1 - Buses hasta 19 pasajeros' },
    { value: 'C2', label: 'C2 - Buses hasta 32 pasajeros' },
    { value: 'C3', label: 'C3 - Buses de más de 32 pasajeros' }
  ];

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Ingrese un correo electrónico válido";
        }
        break;
      
      case "password":
        if (value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = "La contraseña debe incluir al menos una minúscula";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = "La contraseña debe incluir al menos una mayúscula";
        } else if (!/(?=.*\d)/.test(value)) {
          error = "La contraseña debe incluir al menos un número";
        } else if (!/(?=.*[\W_])/.test(value)) {
          error = "La contraseña debe incluir al menos un símbolo";
        }
        break;
      
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Las contraseñas no coinciden";
        }
        break;

      case "nombres":
      case "apellidos":
        if (value.length < 2) {
          error = "Debe tener al menos 2 caracteres";
        }
        break;

      case "numeroDocumento":
        if (!/^\d{7,12}$/.test(value)) {
          error = "El documento debe tener entre 7 y 12 dígitos";
        }
        break;

      case "telefono":
      case "telefonoEmpresa":
        if (!/^\d{10}$/.test(value)) {
          error = "El teléfono debe tener 10 dígitos";
        }
        break;

      case "nitEmpresa":
        if (!/^\d{9}-\d$/.test(value) && !/^\d{8,12}$/.test(value)) {
          error = "Formato de NIT inválido (ej: 900123456-1)";
        }
        break;

      case "fechaVencimientoLicencia":
        const fechaIngresada = new Date(value);
        const fechaActual = new Date();
        if (fechaIngresada <= fechaActual) {
          error = "La fecha de vencimiento debe ser futura";
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 1) {
      // Validar datos básicos
      const requiredFields = ['email', 'password', 'confirmPassword', 'tipoUsuario'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          errors[field] = "Este campo es requerido";
          isValid = false;
        } else {
          const fieldError = validateField(field, formData[field]);
          if (fieldError) {
            errors[field] = fieldError;
            isValid = false;
          }
        }
      });
    } else if (step === 2) {
      // Validar datos personales
      const requiredFields = ['nombres', 'apellidos', 'numeroDocumento', 'telefono'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          errors[field] = "Este campo es requerido";
          isValid = false;
        } else {
          const fieldError = validateField(field, formData[field]);
          if (fieldError) {
            errors[field] = fieldError;
            isValid = false;
          }
        }
      });
    } else if (step === 3) {
      // Validar según tipo de usuario
      if (formData.tipoUsuario === 'ADMINISTRADOR') {
        const requiredFields = ['nombreEmpresa', 'nitEmpresa', 'direccionEmpresa', 'emailEmpresa', 'telefonoEmpresa'];
        requiredFields.forEach(field => {
          if (!formData[field]) {
            errors[field] = "Este campo es requerido";
            isValid = false;
          } else {
            const fieldError = validateField(field, formData[field]);
            if (fieldError) {
              errors[field] = fieldError;
              isValid = false;
            }
          }
        });
      } else if (formData.tipoUsuario === 'CONDUCTOR') {
        const requiredFields = ['tipoLicencia', 'fechaVencimientoLicencia', 'empresaExistente'];
        requiredFields.forEach(field => {
          if (!formData[field]) {
            errors[field] = "Este campo es requerido";
            isValid = false;
          } else {
            const fieldError = validateField(field, formData[field]);
            if (fieldError) {
              errors[field] = fieldError;
              isValid = false;
            }
          }
        });
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    
    const fieldError = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: fieldError
    });
    
    setError("");
    setSuccess("");
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const registrationData = {
        // Datos de autenticación
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        
        // Datos personales
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        numeroDocumento: formData.numeroDocumento.trim(),
        telefono: formData.telefono.trim(),
        
        // Tipo de usuario
        tipoUsuario: formData.tipoUsuario,
        
        // Datos específicos según el tipo
        ...(formData.tipoUsuario === 'ADMINISTRADOR' ? {
          empresa: {
            nombre: formData.nombreEmpresa.trim(),
            nit: formData.nitEmpresa.trim(),
            direccion: formData.direccionEmpresa.trim(),
            email: formData.emailEmpresa.trim().toLowerCase(),
            telefono: formData.telefonoEmpresa.trim()
          }
        } : {
          conductor: {
            tipoLicencia: formData.tipoLicencia,
            fechaVencimientoLicencia: formData.fechaVencimientoLicencia,
            empresaId: formData.empresaExistente
          }
        })
      };

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Registro exitoso! Por favor, verifica tu correo electrónico para completar el registro.");
        // Limpiar el formulario
        setFormData({
          email: "", password: "", confirmPassword: "", nombres: "", apellidos: "",
          numeroDocumento: "", telefono: "", tipoUsuario: "", nombreEmpresa: "",
          nitEmpresa: "", direccionEmpresa: "", emailEmpresa: "", telefonoEmpresa: "",
          tipoLicencia: "", fechaVencimientoLicencia: "", empresaExistente: "", codigoEmpresa: ""
        });
        setFormErrors({});
        setCurrentStep(1);
        
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        throw new Error(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error de registro:", err);
      
      if (err.message.includes("ya existe") || err.message.includes("Ya Está Registrado")) {
        setError("Este correo electrónico ya está registrado. Intente iniciar sesión.");
      } else if (err.message.includes("foreign key constraint") || err.message.includes("Error En El Servidor")) {
        setError("Error en la configuración del sistema. Por favor contacte al administrador o intente más tarde.");
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("No se puede conectar con el servidor. Verifique su conexión a internet.");
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

  const getPasswordStrength = () => {
    if (!formData.password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    const checks = {
      length: formData.password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(formData.password),
      uppercase: /(?=.*[A-Z])/.test(formData.password),
      number: /(?=.*\d)/.test(formData.password),
      symbol: /(?=.*[\W_])/.test(formData.password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 3) return { score, label: "Débil", color: "text-red-500" };
    if (score < 5) return { score, label: "Media", color: "text-yellow-500" };
    return { score, label: "Fuerte", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Información Básica</h3>
        <p className="text-slate-600">Comience con su email y contraseña</p>
      </div>

      {/* Tipo de Usuario */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          ¿Qué tipo de cuenta necesita?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.tipoUsuario === 'ADMINISTRADOR' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-blue-300'
            }`}
            onClick={() => handleChange({ target: { name: 'tipoUsuario', value: 'ADMINISTRADOR' } })}
          >
            <div className="flex items-center">
              <FaUserTie className="text-blue-600 text-2xl mr-4" />
              <div>
                <h4 className="font-semibold text-slate-800">Administrador</h4>
                <p className="text-sm text-slate-600">Gestionar empresa y flota</p>
              </div>
            </div>
          </div>
          <div 
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.tipoUsuario === 'CONDUCTOR' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-blue-300'
            }`}
            onClick={() => handleChange({ target: { name: 'tipoUsuario', value: 'CONDUCTOR' } })}
          >
            <div className="flex items-center">
              <FaIdBadge className="text-green-600 text-2xl mr-4" />
              <div>
                <h4 className="font-semibold text-slate-800">Conductor</h4>
                <p className="text-sm text-slate-600">Unirse a una empresa</p>
              </div>
            </div>
          </div>
        </div>
        {formErrors.tipoUsuario && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.tipoUsuario}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
          Correo electrónico
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.email ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>
        {formErrors.email && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
          Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Cree una contraseña segura"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.password ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          <button 
            type="button" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500"
            onClick={() => togglePasswordVisibility('password')}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        
        {formData.password && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Fortaleza:</span>
              <span className={`text-sm font-medium ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  passwordStrength.score < 3 ? 'bg-red-500' :
                  passwordStrength.score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {formErrors.password && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
          Confirmar contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme su contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.confirmPassword ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          <button 
            type="button" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500"
            onClick={() => togglePasswordVisibility('confirmPassword')}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {formErrors.confirmPassword && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Datos Personales</h3>
        <p className="text-slate-600">Información personal requerida</p>
      </div>

      {/* Nombres */}
      <div>
        <label htmlFor="nombres" className="block text-sm font-semibold text-slate-700 mb-3">
          Nombres
        </label>
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="nombres"
            name="nombres"
            type="text"
            placeholder="Ingrese sus nombres"
            value={formData.nombres}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.nombres ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>
        {formErrors.nombres && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.nombres}
          </p>
        )}
      </div>

      {/* Apellidos */}
      <div>
        <label htmlFor="apellidos" className="block text-sm font-semibold text-slate-700 mb-3">
          Apellidos
        </label>
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            placeholder="Ingrese sus apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.apellidos ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>
        {formErrors.apellidos && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.apellidos}
          </p>
        )}
      </div>

      {/* Número de Documento */}
      <div>
        <label htmlFor="numeroDocumento" className="block text-sm font-semibold text-slate-700 mb-3">
          Número de Documento
        </label>
        <div className="relative">
          <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="numeroDocumento"
            name="numeroDocumento"
            type="text"
            placeholder="Número de cédula"
            value={formData.numeroDocumento}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.numeroDocumento ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>
        {formErrors.numeroDocumento && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.numeroDocumento}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-3">
          Teléfono Celular
        </label>
        <div className="relative">
          <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            id="telefono"
            name="telefono"
            type="tel"
            placeholder="3001234567"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
              formErrors.telefono ? "border-red-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>
        {formErrors.telefono && (
          <p className="text-red-600 text-sm mt-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {formErrors.telefono}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-3">
          {formData.tipoUsuario === 'ADMINISTRADOR' ? 'Datos de la Empresa' : 'Información de Conductor'}
        </h3>
        <p className="text-slate-600">
          {formData.tipoUsuario === 'ADMINISTRADOR' 
            ? 'Registre su empresa en el sistema'
            : 'Complete su perfil como conductor'
          }
        </p>
      </div>

      {formData.tipoUsuario === 'ADMINISTRADOR' ? (
        <>
          {/* Nombre de la Empresa */}
          <div>
            <label htmlFor="nombreEmpresa" className="block text-sm font-semibold text-slate-700 mb-3">
              Nombre de la Empresa
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="nombreEmpresa"
                name="nombreEmpresa"
                type="text"
                placeholder="Nombre completo de la empresa"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.nombreEmpresa ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.nombreEmpresa && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.nombreEmpresa}
              </p>
            )}
          </div>

          {/* NIT */}
          <div>
            <label htmlFor="nitEmpresa" className="block text-sm font-semibold text-slate-700 mb-3">
              NIT de la Empresa
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="nitEmpresa"
                name="nitEmpresa"
                type="text"
                placeholder="900123456-1"
                value={formData.nitEmpresa}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.nitEmpresa ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.nitEmpresa && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.nitEmpresa}
              </p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccionEmpresa" className="block text-sm font-semibold text-slate-700 mb-3">
              Dirección de la Empresa
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="direccionEmpresa"
                name="direccionEmpresa"
                type="text"
                placeholder="Dirección completa"
                value={formData.direccionEmpresa}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.direccionEmpresa ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.direccionEmpresa && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.direccionEmpresa}
              </p>
            )}
          </div>

          {/* Email Empresa */}
          <div>
            <label htmlFor="emailEmpresa" className="block text-sm font-semibold text-slate-700 mb-3">
              Email Corporativo
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="emailEmpresa"
                name="emailEmpresa"
                type="email"
                placeholder="info@empresa.com"
                value={formData.emailEmpresa}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.emailEmpresa ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.emailEmpresa && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.emailEmpresa}
              </p>
            )}
          </div>

          {/* Teléfono Empresa */}
          <div>
            <label htmlFor="telefonoEmpresa" className="block text-sm font-semibold text-slate-700 mb-3">
              Teléfono de la Empresa
            </label>
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="telefonoEmpresa"
                name="telefonoEmpresa"
                type="tel"
                placeholder="6011234567"
                value={formData.telefonoEmpresa}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.telefonoEmpresa ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.telefonoEmpresa && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.telefonoEmpresa}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Tipo de Licencia */}
          <div>
            <label htmlFor="tipoLicencia" className="block text-sm font-semibold text-slate-700 mb-3">
              Tipo de Licencia de Conducción
            </label>
            <div className="relative">
              <FaIdBadge className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                id="tipoLicencia"
                name="tipoLicencia"
                value={formData.tipoLicencia}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.tipoLicencia ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              >
                <option value="">Seleccione el tipo de licencia</option>
                {tiposLicencia.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            {formErrors.tipoLicencia && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.tipoLicencia}
              </p>
            )}
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label htmlFor="fechaVencimientoLicencia" className="block text-sm font-semibold text-slate-700 mb-3">
              Fecha de Vencimiento de la Licencia
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                id="fechaVencimientoLicencia"
                name="fechaVencimientoLicencia"
                type="date"
                value={formData.fechaVencimientoLicencia}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.fechaVencimientoLicencia ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              />
            </div>
            {formErrors.fechaVencimientoLicencia && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.fechaVencimientoLicencia}
              </p>
            )}
          </div>

          {/* Empresa a la que se quiere unir */}
          <div>
            <label htmlFor="empresaExistente" className="block text-sm font-semibold text-slate-700 mb-3">
              Empresa a la que desea unirse
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                id="empresaExistente"
                name="empresaExistente"
                value={formData.empresaExistente}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 focus:bg-white transition-all ${
                  formErrors.empresaExistente ? "border-red-500" : "border-slate-300 focus:border-blue-500"
                }`}
              >
                <option value="">Seleccione una empresa</option>
                {empresasDisponibles.map(empresa => (
                  <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                    {empresa.nomEmpresa} - {empresa.nitEmpresa}
                  </option>
                ))}
              </select>
            </div>
            {formErrors.empresaExistente && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {formErrors.empresaExistente}
              </p>
            )}
            <p className="text-sm text-slate-600 mt-2">
              Si no ve su empresa en la lista, contacte al administrador de la empresa para que lo registre.
            </p>
          </div>
        </>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col xl:flex-row min-h-[90vh]">
          {/* Left side - Brand section */}
          <div className="xl:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
                TransSync
              </h1>
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                Sistema de gestión empresarial para el transporte moderno
              </p>
              <div className="space-y-6">
                <div className="flex items-center text-blue-100 text-lg">
                  <FaShieldAlt className="mr-4 text-blue-300 text-xl" />
                  <span>Registro seguro y verificado</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaUsers className="mr-4 text-blue-300 text-xl" />
                  <span>Gestión completa de perfiles</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaCogs className="mr-4 text-blue-300 text-xl" />
                  <span>Configuración personalizada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="xl:w-3/5 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl xl:text-4xl font-bold text-slate-800 mb-3">Crear Cuenta</h2>
              <p className="text-slate-600 text-lg">Complete su registro en el sistema</p>
            </div>

            {renderStepIndicator()}

            {/* Success message */}
            {success && (
              <div className="flex items-center bg-green-50 text-green-700 p-4 rounded-xl mb-8 border border-green-200">
                <FaCheckCircle className="mr-3 flex-shrink-0 text-green-500 text-lg" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-200">
                <FaExclamationTriangle className="mr-3 flex-shrink-0 text-red-500 text-lg" />
                <div className="text-sm">
                  <p>{error}</p>
                  {error.includes("configuración del sistema") && (
                    <p className="mt-2 text-red-600 font-medium">
                      Sugerencia: Contacte al administrador del sistema para verificar la configuración de la base de datos.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Steps */}
            <div className="mb-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="sm:w-auto bg-white text-slate-600 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 font-semibold py-3 px-6 rounded-xl transition-all"
                  disabled={loading}
                >
                  Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
                  disabled={loading}
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                      Registrando...
                    </div>
                  ) : (
                    'Completar Registro'
                  )}
                </button>
              )}
            </div>

            {/* Login link */}
            <div className="text-center pt-6 border-t border-slate-200 mt-8">
              <p className="text-slate-600 text-base mb-4">¿Ya tienes una cuenta?</p>
              <button 
                type="button" 
                className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 font-semibold py-3 px-8 rounded-xl transition-all duration-200 text-base disabled:opacity-50"
                onClick={handleNavigateToLogin}
                disabled={loading}
              >
                Iniciar sesión
              </button>
            </div>

            {/* Information about process */}
            {currentStep === 3 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaUserTie className="mr-2" />
                  Proceso de activación
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold">1</span>
                    <span>Su cuenta será creada con estado "PENDIENTE"</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold">2</span>
                    <span>Recibirá un correo de verificación</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold">3</span>
                    <span>
                      {formData.tipoUsuario === 'ADMINISTRADOR' 
                        ? 'Un superadministrador revisará y activará su empresa'
                        : 'El administrador de la empresa revisará su solicitud'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;