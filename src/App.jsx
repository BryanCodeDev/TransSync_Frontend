// src/App.jsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { isAuthenticated, getCurrentUser } from './utilidades/authAPI';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import realTimeService from './utilidades/realTimeService';
import RoleProtectedRoute from './routes/RoleProtectedRoute';

// Componentes principales (no lazy para mejor UX)
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import Tutorial from "./components/Tutorial";
import "./i18n";

// Páginas cargadas bajo demanda (lazy loading)
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Rutas = lazy(() => import("./pages/Rutas"));
const Vehiculos = lazy(() => import("./pages/Vehiculos"));
const Horarios = lazy(() => import("./pages/Horarios"));
const Informes = lazy(() => import("./pages/Informes"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// ======================================================
// Tus componentes y hooks
// ======================================================
const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false); };

  return { sidebarOpen, isMobile, toggleSidebar, closeSidebar };
};


const ProtectedLayout = ({ children }) => {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const paddingLeft = !isMobile && sidebarOpen ? 'pl-[280px]' : 'pl-0 md:pl-[70px]';

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
      <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile}/>

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onOverlayClick={closeSidebar}
        isMobile={isMobile}
      />
      {/* =============================================================== */}

      <main className={`pt-16 transition-all duration-300 ${paddingLeft}`}>
        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>
      <ChatBot className="fixed bottom-6 right-6 z-50" data-tutorial="chatbot" />
      <Tutorial />
    </div>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
      <Navbar isPublic={true} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

// Componente de loading para rutas lazy
const LazyLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-primary-100 dark:border-primary-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-3"></div>
    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Cargando...</p>
  </div>
);

// ======================================================
// COMPONENTE APP
// ======================================================
function App() {
  // Conectar WebSocket cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      const userContext = getCurrentUser();
      if (userContext) {
        console.log('🔗 Conectando WebSocket con contexto de usuario:', userContext);
        realTimeService.connect(userContext);

        // Configurar permisos de notificaciones
        realTimeService.requestNotificationPermission();
      }
    }

    // Limpiar conexión al desmontar
    return () => {
      realTimeService.disconnect();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Router>
          <Suspense fallback={<LazyLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* Rutas públicas usando tu PublicLayout */}
              <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

              {/* Rutas protegidas con control de acceso basado en roles */}
              {/* SUPERADMIN: acceso a todo */}
              <Route path="/dashboard" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Dashboard /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <ProtectedLayout><AdminDashboard /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/drivers" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Drivers /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/rutas" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Rutas /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/vehiculos" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Vehiculos /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/horarios" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Horarios /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              <Route path="/informes" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}>
                  <ProtectedLayout><Informes /></ProtectedLayout>
                </RoleProtectedRoute>
              } />
              {/* CONDUCTOR: solo acceso a perfil */}
              <Route path="/profile" element={
                <RoleProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR', 'CONDUCTOR']}>
                  <ProtectedLayout><Profile /></ProtectedLayout>
                </RoleProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;