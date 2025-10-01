// src/App.jsx

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated } from './utilidades/authAPI';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// Componentes
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import Tutorial from "./components/Tutorial";
import "./i18n";

// Páginas (Lazy Loading)
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Rutas = lazy(() => import("./pages/Rutas"));
const Vehiculos = lazy(() => import("./pages/Vehiculos"));
const Horarios = lazy(() => import("./pages/Horarios"));
// const Informes = lazy(() => import("./pages/Informes")); // Eliminado
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MobileDownload = lazy(() => import("./pages/MobileDownload"));

// ======================================================
// COMPONENTES DE LAYOUT Y RUTAS
// ======================================================

const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
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

// 👇 COMPONENTE PROTECTEDROUTE MEJORADO 👇
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData } = useAuth();
  const userRole = authData?.user?.rol;

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Comprobación insensible a mayúsculas/minúsculas
  const hasPermission = allowedRoles.some(
    (role) => role.toUpperCase() === userRole?.toUpperCase()
  );

  if (allowedRoles && !hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ProtectedLayout = ({ children }) => {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const paddingLeft = !isMobile && sidebarOpen ? 'pl-[280px]' : 'pl-0 md:pl-[70px]';

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
      <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile}/>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onOverlayClick={closeSidebar} isMobile={isMobile}/>
      <main className={`pt-16 transition-all duration-300 ${paddingLeft}`}>
        <div className="p-4 md:p-8">{children}</div>
      </main>
      <ChatBot className="fixed bottom-6 right-6 z-50" data-tutorial="chatbot" />
      <Tutorial />
    </div>
  );
};

const PublicLayout = ({ children }) => (
  <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
    <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
    <Navbar isPublic={true} />
    <main className="pt-16">{children}</main>
  </div>
);

const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// ======================================================
// COMPONENTE APP
// ======================================================
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Router basename="/">
            <Suspense fallback={<LazyLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Rutas públicas */}
                <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
                <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
                <Route path="/mobile-download" element={<PublicLayout><MobileDownload /></PublicLayout>} />

                {/* 👇 RUTAS PROTEGIDAS CORREGIDAS 👇 */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR', 'CONDUCTOR']}><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><ProtectedLayout><AdminDashboard /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/drivers" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}><ProtectedLayout><Drivers /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/rutas" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR', 'CONDUCTOR']}><ProtectedLayout><Rutas /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/vehiculos" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}><ProtectedLayout><Vehiculos /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/horarios" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR']}><ProtectedLayout><Horarios /></ProtectedLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'GESTOR', 'CONDUCTOR']}><ProtectedLayout><Profile /></ProtectedLayout></ProtectedRoute>} />
                {/* <Route path="/informes" ... /> // RUTA ELIMINADA */}

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