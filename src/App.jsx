// src/App.jsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Componentes principales (no lazy para mejor UX)
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import Tutorial from "./components/Tutorial";
import NavigationDebugger from "./components/NavigationDebugger";
import { fixNavigationIssues } from "./utilidades/navigationUtils";
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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

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
          <ErrorBoundary
            FallbackComponent={RouteErrorFallback}
            onReset={() => window.location.reload()}
          >
            {children}
          </ErrorBoundary>
        </div>
      </main>
      <ChatBot className="fixed bottom-6 right-6 z-50" data-tutorial="chatbot" />
      <Tutorial />
      <NavigationDebugger />
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

// Componente para manejar errores de carga de rutas
const RouteErrorFallback = ({ error, resetError }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Error de navegación
    </h2>
    <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
      Ha ocurrido un error al cargar esta página. Esto puede deberse a problemas de conexión o cache.
    </p>
    <div className="flex gap-3">
      <button
        onClick={resetError}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Reintentar
      </button>
      <button
        onClick={() => window.location.href = '/home'}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Ir al inicio
      </button>
    </div>
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-4 text-left max-w-lg">
        <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
          Detalles del error (desarrollo)
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
          {error?.message || 'Error desconocido'}
        </pre>
      </details>
    )}
  </div>
);

// ======================================================
// COMPONENTE APP
// ======================================================
function App() {
  // Verificar y solucionar problemas de navegación al cargar
  useEffect(() => {
    const checkNavigationHealth = async () => {
      try {
        // Pequeño delay para permitir que se cargue la aplicación
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar si hay problemas de navegación y solucionarlos
        await fixNavigationIssues();
      } catch (error) {
        console.error('Error checking navigation health:', error);
      }
    };

    // Solo ejecutar en producción o si hay problemas detectados
    if (process.env.NODE_ENV === 'production' || window.location.search.includes('debug=true')) {
      checkNavigationHealth();
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Router basename="/">
          <Suspense fallback={<LazyLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* Rutas públicas usando tu PublicLayout */}
              <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
              <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

              {/* Rutas protegidas usando tu ProtectedLayout y ProtectedRoute */}
              <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={['SUPERADMIN']}><ProtectedLayout><AdminDashboard /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><Drivers /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/rutas" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR', 'CONDUCTOR']}><ProtectedLayout><Rutas /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/vehiculos" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><Vehiculos /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/horarios" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><Horarios /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/informes" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><Informes /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR', 'CONDUCTOR']}><ProtectedLayout><Profile /></ProtectedLayout></ProtectedRoute>} />

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