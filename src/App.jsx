import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import Tutorial from "./components/Tutorial";
import LazyWrapper from "./components/LazyWrapper";
import { fixNavigationIssues } from "./utilidades/navigationUtils";
import "./i18n";
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

// COMPONENTE APP
function App() {
  useEffect(() => {
    const checkNavigationHealth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fixNavigationIssues();
      } catch (error) {
        // Error checking navigation health - logged in production builds
      }
    };

    if (process.env.NODE_ENV === 'production' || window.location.search.includes('debug=true')) {
      checkNavigationHealth();
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Router basename="/">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />

              <Route path="/home" element={<PublicLayout><LazyWrapper importFunc={() => import("./pages/Home")} /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LazyWrapper importFunc={() => import("./pages/Login")} /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><LazyWrapper importFunc={() => import("./pages/Register")} /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><LazyWrapper importFunc={() => import("./pages/ForgotPassword")} /></PublicLayout>} />
              <Route path="/reset-password" element={<PublicLayout><LazyWrapper importFunc={() => import("./pages/ResetPassword")} /></PublicLayout>} />

              <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Dashboard")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={['SUPERADMIN']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/AdminDashboard")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Drivers")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/rutas" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR', 'CONDUCTOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Rutas")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/vehiculos" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Vehiculos")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/horarios" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Horarios")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/informes" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Informes")} /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMINISTRADOR', 'CONDUCTOR']}><ProtectedLayout><LazyWrapper importFunc={() => import("./pages/Profile")} /></ProtectedLayout></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;