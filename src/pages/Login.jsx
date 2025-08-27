import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaLock, 
  FaExclamationTriangle, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner,
  FaWifi,
  FaServer
} from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  // Verificar si hay credenciales guardadas al cargar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Verificar estado del servidor al cargar
    checkServerConnection();
  }, []);

  // Función para verificar conexión con el servidor
  const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health", {
        method: "GET",
        timeout: 5000
      });
      
      if (response.ok) {
        setServerStatus({ status: 'connected', message: 'Servidor conectado' });
      } else {
        setServerStatus({ status: 'error', message: 'Servidor no responde' });
      }
    } catch (error) {
      setServerStatus({ 
        status: 'disconnected', 
        message: 'No se puede conectar con el servidor' 
      });
    }
  };

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
    setError("");
    setSuccess("");
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
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
        
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
        localStorage.setItem("userEmail", data.user?.email || "");
        localStorage.setItem("userId", data.user?.id || "");
        
        // Guardar token
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userToken", data.token);
        }
        
        // Redirigir después de un momento
        setTimeout(() => {
          const userRole = data.user?.role;
          const from = location.state?.from?.pathname;
          
          // Si vino de una ruta protegida, redirigir allí
          if (from && from !== '/login' && from !== '/register') {
            navigate(from, { replace: true });
          } else {
            // Redirigir según el rol
            if (userRole === "SUPERADMIN" || userRole === "ADMINISTRADOR") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
        }, 1500);
      } else {
        // Manejo específico de errores
        if (response.status === 401) {
          setError("Credenciales incorrectas. Verifique su email y contraseña.");
        } else if (response.status === 403) {
          setError("Su cuenta no está activada. Por favor verifique su correo electrónico.");
        } else {
          setError(data.message || "Error de autenticación. Intente nuevamente.");
        }
      }
    } catch (err) {
      console.error("Error de login:", err);
      
      // Manejo de errores de conexión
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("No se puede conectar con el servidor. Verifique su conexión a internet.");
        setServerStatus({ status: 'disconnected', message: 'Sin conexión al servidor' });
      } else {
        setError("Error al conectar con el servidor. Verifique su conexión e intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 lg:p-8">
      {/* Main container */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col xl:flex-row min-h-[80vh]">
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
                  <span>Acceso seguro y confiable</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaUsers className="mr-4 text-blue-300 text-xl" />
                  <span>Gestión de administradores</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaCogs className="mr-4 text-blue-300 text-xl" />
                  <span>Panel de control avanzado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="xl:w-3/5 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl xl:text-4xl font-bold text-slate-800 mb-3">Iniciar Sesión</h2>
              <p className="text-slate-600 text-lg">Acceda a su cuenta empresarial</p>
              
              {/* Server status indicator */}
              {serverStatus && (
                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center justify-center ${
                  serverStatus.status === 'connected' 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : serverStatus.status === 'disconnected'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {serverStatus.status === 'connected' && <FaWifi className="mr-2" />}
                  {serverStatus.status === 'disconnected' && <FaServer className="mr-2" />}
                  {serverStatus.status === 'error' && <FaExclamationTriangle className="mr-2" />}
                  <span>{serverStatus.message}</span>
                </div>
              )}
            </div>

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
                  <span>{error}</span>
                  {error.includes("servidor") && (
                    <div className="mt-2">
                      <button 
                        onClick={checkServerConnection}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                        disabled={loading}
                      >
                        Verificar conexión nuevamente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-8">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    disabled={loading}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg disabled:opacity-50 ${
                      formTouched && !isEmailValid(email) && email 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                {formTouched && !isEmailValid(email) && email && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    Por favor ingrese un correo válido
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    disabled={loading}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg disabled:opacity-50 ${
                      formTouched && !isPasswordValid(password) && password 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    tabIndex="-1"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formTouched && !isPasswordValid(password) && password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <label className="flex items-center cursor-pointer text-slate-700">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      disabled={loading}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                      rememberMe 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    } ${loading ? 'opacity-50' : ''}`}>
                      {rememberMe && (
                        <FaCheckCircle className="w-full h-full text-white" />
                      )}
                    </div>
                  </div>
                  <span className="ml-3 font-medium">Recordarme</span>
                </label>
                <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline disabled:opacity-50"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                disabled={loading || serverStatus?.status === 'disconnected'}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-6 h-6 mr-3 animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              {/* Register link */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-slate-600 text-base mb-4">¿No tienes una cuenta?</p>
                <button 
                  type="button" 
                  className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 font-semibold py-3 px-8 rounded-xl transition-all duration-200 text-base disabled:opacity-50"
                  onClick={handleNavigateToRegister}
                  disabled={loading}
                >
                  Crear cuenta nueva
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;