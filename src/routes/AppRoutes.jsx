import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";
import SEO from "../components/SEO";

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

// Componente de carga mejorado
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
  // Estados principales
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detectar dispositivo móvil y configurar estado inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (!isInitialized) {
        // Configuración inicial basada en el dispositivo
        if (mobile) {
          setSidebarOpen(false);
        } else {
          // En desktop, recuperar estado del localStorage
          const savedState = localStorage.getItem("sidebarOpen");
          setSidebarOpen(savedState ? JSON.parse(savedState) : true);
        }
        setIsInitialized(true);
      } else if (mobile && sidebarOpen) {
        // Si cambiamos a móvil y el sidebar está abierto, cerrarlo
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen, isInitialized]);

  // Guardar estado del sidebar en localStorage solo para desktop
  useEffect(() => {
    if (isInitialized && !isMobile) {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile, isInitialized]);

  // Función para alternar el sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Función para cerrar sidebar desde overlay
  const handleOverlayClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Prevenir scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  // Calcular clases CSS del contenido principal
  const getContentClasses = () => {
    const baseClasses = "min-h-screen transition-all duration-300 ease-in-out bg-gradient-to-br from-gray-50 to-blue-50";
    
    if (isMobile) {
      return `${baseClasses} ml-0 p-4`;
    }
    
    const marginLeft = sidebarOpen ? 'ml-[280px]' : 'ml-[70px]';
    return `${baseClasses} ${marginLeft} p-6`;
  };

  // Manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Alt + S para alternar sidebar
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        toggleSidebar();
      }
      // Escape para cerrar sidebar en móvil
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleSidebar, isMobile, sidebarOpen]);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

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
              <div className="relative min-h-screen">
                {/* Sidebar */}
                <Sidebar 
                  isOpen={sidebarOpen} 
                  toggleSidebar={toggleSidebar}
                  onOverlayClick={handleOverlayClick}
                />
                
                {/* Contenido principal */}
                <main className={getContentClasses()}>
                  <div className="max-w-7xl mx-auto">
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
                
                {/* ChatBot - Solo visible en rutas protegidas */}
                <ChatBot 
                  position="bottom-right" 
                  theme="professional"
                  className={`transition-all duration-300 ${
                    isMobile && sidebarOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'
                  }`}
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