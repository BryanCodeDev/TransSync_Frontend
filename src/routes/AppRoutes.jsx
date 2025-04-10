import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";
import SEO from "../components/SEO";
import { FiMenu } from "react-icons/fi"; // Necesitarás instalar react-icons

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

// Componente de carga mientras se cargan los componentes lazy
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

const AppRoutes = () => {
  // Estado para el sidebar
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth > 768 ? 
      (JSON.parse(localStorage.getItem("sidebarOpen")) ?? true) : 
      false;
  });

  // Estado para saber si estamos en modo móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estado para mostrar/ocultar el chatbot
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  // Sincronizar el estado del sidebar con localStorage
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    
    const handleStorageChange = () => {
      const isOpen = JSON.parse(localStorage.getItem("sidebarOpen")) ?? true;
      setSidebarOpen(isOpen);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sidebarOpen]);

  // Función para alternar el sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Calcular el margen dinámicamente según el estado del sidebar
  const getContentStyle = () => {
    if (isMobile) {
      return {
        marginLeft: 0,
        transition: "margin-left 0.3s ease-in-out",
        padding: "20px",
        minHeight: "100vh",
      };
    }
    return {
      marginLeft: sidebarOpen ? "280px" : "70px",
      transition: "margin-left 0.3s ease-in-out",
      padding: "20px",
      minHeight: "100vh",
    };
  };

  // Actualizar estilos al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Para detectar clics fuera del sidebar en móviles y cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && !event.target.closest('.sidebar')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={
            <>
              <SEO title="Iniciar Sesión | TransSync" description="Accede a tu cuenta en TransSync." />
              <Login />
            </>
          } />
          <Route path="/register" element={
            <>
              <SEO title="Registro | TransSync" description="Crea una cuenta en TransSync y accede a nuestros servicios de transporte." />
              <Register />
            </>
          } />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                  {isMobile && (
                    <button 
                      className="mobile-menu-toggle"
                      onClick={toggleSidebar}
                      aria-label="Abrir menú"
                    >
                      <FiMenu size={24} />
                    </button>
                  )}
                  <main style={getContentStyle()} className="main-content">
                    <Routes>
                      <Route path="/home" element={
                        <>
                          <SEO title="Inicio | TransSync" description="Plataforma de gestión de transporte y conductores." />
                          <Home />
                        </>
                      } />
                      <Route path="/dashboard" element={
                        <>
                          <SEO title="Dashboard | TransSync" description="Gestiona y monitorea el sistema de transporte con TransSync." />
                          <Dashboard />
                        </>
                      } />
                      <Route path="/drivers" element={
                        <>
                          <SEO title="Conductores | TransSync" description="Administra y gestiona la información de los conductores." />
                          <Drivers />
                        </>
                      } />
                      <Route path="/rutas" element={
                        <>
                          <SEO title="Rutas | TransSync" description="Consulta y gestiona las rutas de transporte." />
                          <Rutas />
                        </>
                      } />
                      <Route path="/vehiculos" element={
                        <>
                          <SEO title="Vehículos | TransSync" description="Administra la flota de vehículos." />
                          <Vehiculos />
                        </>
                      } />
                      <Route path="/horarios" element={
                        <>
                          <SEO title="Horarios | TransSync" description="Gestiona los horarios de las rutas." />
                          <Horarios />
                        </>
                      } />
                      <Route path="/informes" element={
                        <>
                          <SEO title="Informes | TransSync" description="Genera y consulta informes." />
                          <Informes />
                        </>
                      } />
                      <Route path="/emergency" element={
                        <>
                          <SEO title="Emergencias | TransSync" description="Gestiona situaciones de emergencia en el sistema de transporte." />
                          <Emergency />
                        </>
                      } />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </main>
                  
                  {/* ChatBot siempre visible en todas las rutas protegidas */}
                  {chatbotEnabled && <ChatBot position="bottom-right" theme="light" />}
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;