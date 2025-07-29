import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";

// Componente SEO optimizado para evitar warnings
const SEO = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
  
  return null;
};

// Lazy loading para mejorar el rendimiento
const Home = lazy(() => import("../pages/Home"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Drivers = lazy(() => import("../pages/Drivers"));
const Rutas = lazy(() => import("../pages/Rutas"));
const Vehiculos = lazy(() => import("../pages/Vehiculos"));
const Horarios = lazy(() => import("../pages/Horarios"));
const Informes = lazy(() => import("../pages/Informes"));
const Emergency = lazy(() => import("../pages/Emergency"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));

// Componente de carga
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-2 border-2 border-blue-100 border-b-blue-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-6 text-gray-700 font-medium text-lg">Cargando TransSync...</p>
      <p className="mt-2 text-gray-500 text-sm">Preparando tu experiencia</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Iniciar cerrado por defecto
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil y configurar sidebar inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      const wasMobile = isMobile;
      
      setIsMobile(mobile);
      
      // Solo cambiar el estado del sidebar si realmente cambió el tipo de dispositivo
      if (wasMobile !== mobile) {
        if (!mobile && !sidebarOpen) {
          // Cambió de móvil a desktop, abrir sidebar
          setSidebarOpen(true);
        } else if (mobile && sidebarOpen) {
          // Cambió de desktop a móvil, cerrar sidebar
          setSidebarOpen(false);
        }
      }
    };
    
    // Configuración inicial
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    setSidebarOpen(!mobile); // Abierto en desktop, cerrado en móvil
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para alternar el sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Función para cerrar sidebar desde overlay (solo móvil)
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Calcular clases del contenido principal
  const getContentClasses = () => {
    if (isMobile) {
      return "min-h-screen w-full transition-all duration-300 ease-in-out";
    }
    
    // En desktop, ajustar según el estado del sidebar
    const paddingLeft = sidebarOpen ? 'pl-[280px]' : 'pl-[70px]';
    return `min-h-screen w-full transition-all duration-300 ease-in-out ${paddingLeft}`;
  };

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={
            <>
              <SEO 
                title="Iniciar Sesión | TransSync" 
                description="Accede a tu cuenta en TransSync - Sistema profesional de gestión de transporte." 
              />
              <Login />
            </>
          } />
          
          <Route path="/register" element={
            <>
              <SEO 
                title="Registro | TransSync" 
                description="Crea una cuenta en TransSync y accede a nuestros servicios profesionales de gestión de transporte." 
              />
              <Register />
            </>
          } />

          {/* Redirección de la raíz */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Rutas protegidas */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="relative min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar 
                  isOpen={sidebarOpen} 
                  toggleSidebar={toggleSidebar}
                  onOverlayClick={handleOverlayClick}
                  isMobile={isMobile}
                />
                
                {/* Contenido principal */}
                <main className={getContentClasses()}>
                  <div className="min-h-screen">
                    <Routes>
                      <Route path="/home" element={
                        <>
                          <SEO 
                            title="Inicio | TransSync" 
                            description="Panel principal de TransSync - Sistema profesional de gestión de transporte y conductores." 
                          />
                          <Home />
                        </>
                      } />
                      
                      <Route path="/dashboard" element={
                        <>
                          <SEO 
                            title="Dashboard | TransSync" 
                            description="Dashboard ejecutivo - Monitorea y gestiona todo tu sistema de transporte desde una vista centralizada." 
                          />
                          <Dashboard />
                        </>
                      } />
                      
                      <Route path="/drivers" element={
                        <>
                          <SEO 
                            title="Gestión de Conductores | TransSync" 
                            description="Administra la información completa de conductores, licencias, capacitaciones y rendimiento." 
                          />
                          <Drivers />
                        </>
                      } />
                      
                      <Route path="/rutas" element={
                        <>
                          <SEO 
                            title="Gestión de Rutas | TransSync" 
                            description="Consulta, planifica y optimiza las rutas de transporte para máxima eficiencia." 
                          />
                          <Rutas />
                        </>
                      } />
                      
                      <Route path="/vehiculos" element={
                        <>
                          <SEO 
                            title="Gestión de Vehículos | TransSync" 
                            description="Administra tu flota vehicular - mantenimiento, documentación y seguimiento en tiempo real." 
                          />
                          <Vehiculos />
                        </>
                      } />
                      
                      <Route path="/horarios" element={
                        <>
                          <SEO 
                            title="Gestión de Horarios | TransSync" 
                            description="Programa y gestiona horarios de rutas, turnos de conductores y servicios especiales." 
                          />
                          <Horarios />
                        </>
                      } />
                      
                      <Route path="/informes" element={
                        <>
                          <SEO 
                            title="Informes y Reportes | TransSync" 
                            description="Genera informes detallados, estadísticas y análisis de rendimiento del sistema de transporte." 
                          />
                          <Informes />
                        </>
                      } />
                      
                      <Route path="/emergency" element={
                        <>
                          <SEO 
                            title="Centro de Emergencias | TransSync" 
                            description="Centro de comando para gestión de emergencias, alertas y respuesta rápida en el sistema de transporte." 
                          />
                          <Emergency />
                        </>
                      } />
                      
                      {/* Ruta 404 */}
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </div>
                </main>
                
                {/* ChatBot */}
                <ChatBot 
                  position="bottom-right" 
                  theme="professional"
                />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;