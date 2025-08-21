import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from './utilidades/authService';
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";

// Importaciones de páginas
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Drivers from "./pages/Drivers";
import Rutas from "./pages/Rutas";
import Vehiculos from "./pages/Vehiculos";
import Horarios from "./pages/Horarios";
import Informes from "./pages/Informes";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Hook personalizado para gestión del sidebar
const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    // Configuración inicial
    const initialMobile = window.innerWidth <= 768;
    setIsMobile(initialMobile);
    setSidebarOpen(!initialMobile);
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencias intencionalmente vacías para ejecutar solo una vez

  // Efecto separado para manejar cambios de sidebar basado en isMobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return { sidebarOpen, isMobile, toggleSidebar, closeSidebar };
};

// Componente Protected Route básico (solo verifica autenticación)
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout principal para rutas protegidas SIN MÁRGENES PREDEFINIDOS
const ProtectedLayout = ({ children }) => {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();

  const getContentClasses = () => {
    if (isMobile) {
      return "min-h-screen w-full transition-all duration-300 ease-in-out";
    }
    
    const paddingLeft = sidebarOpen ? 'pl-[280px]' : 'pl-[70px]';
    return `min-h-screen w-full transition-all duration-300 ease-in-out ${paddingLeft}`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        onOverlayClick={closeSidebar}
        isMobile={isMobile}
      />
      
      {/* Contenido principal SIN padding predefinido */}
      <main className={getContentClasses()}>
        {/* Eliminé el div con padding interno para que tengas control total */}
        {children}
      </main>
      
      {/* ChatBot flotante */}
      <ChatBot 
        position="bottom-right" 
        theme="professional"
        className="fixed bottom-6 right-6 z-50"
      />
    </div>
  );
};

// Componente de redirección automática para la ruta raíz
const AutoRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to="/home" replace />;
};

// Componente principal App
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas - SIN Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ruta raíz con redirección automática */}
          <Route path="/" element={<AutoRedirect />} />
          
          {/* Rutas protegidas - CON Layout - SIN RESTRICCIONES */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AdminDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/drivers" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Drivers />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rutas" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Rutas />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vehiculos" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Vehiculos />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/horarios" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Horarios />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/informes" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Informes />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/emergency" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Emergency />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta catch-all para páginas no encontradas */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;