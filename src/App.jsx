import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated, getUserRole } from './services/authService';
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";

// Importaciones directas de componentes
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Rutas from "./pages/Rutas";
import Vehiculos from "./pages/Vehiculos";
import Horarios from "./pages/Horarios";
import Informes from "./pages/Informes";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Componente Protected Route
const ProtectedRoute = ({ children, requiredRoles = [], redirectTo = '/login' }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0) {
    const userRole = getUserRole();
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      if (userRole === 'SUPERADMIN' || userRole === 'ADMINISTRADOR') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

// Layout principal para rutas protegidas
const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    setSidebarOpen(!isMobile);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleOverlayClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const getContentClasses = () => {
    if (isMobile) return "min-h-screen w-full transition-all duration-300";
    const paddingLeft = sidebarOpen ? 'pl-[280px]' : 'pl-[70px]';
    return `min-h-screen w-full transition-all duration-300 ${paddingLeft}`;
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        onOverlayClick={handleOverlayClick}
        isMobile={isMobile}
      />
      
      <main className={getContentClasses()}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/informes" element={<Informes />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      
      <ChatBot position="bottom-right" theme="professional" />
    </div>
  );
};

// Componente principal App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;