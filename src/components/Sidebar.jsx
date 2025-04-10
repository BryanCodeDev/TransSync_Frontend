import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaHome, FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaRobot, FaUserShield, FaBars, FaTimes
} from "react-icons/fa";

import "../styles/sidebar.css";
import logoImg from "../assets/transport-background.jpg"; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("sidebarOpen")) ?? true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Manejar redimensionamiento de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/home", icon: <FaHome />, label: "Inicio" },
    { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/drivers", icon: <FaUserTie />, label: "Conductores" },
    { path: "/rutas", icon: <FaRoute />, label: "Rutas" },
    { path: "/vehiculos", icon: <FaBus />, label: "Vehículos" }, 
    { path: "/horarios", icon: <FaClock />, label: "Horarios" }, 
    { path: "/emergency", icon: <FaExclamationTriangle />, label: "Emergencias" },
    { path: "/informes", icon: <FaFileAlt />, label: "Informes" },
  ];

  return (
    <>
      {/* Botón de menú móvil */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay para cerrar el menú en móvil al tocar fuera */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <div className={`sidebar ${isOpen ? "open" : "closed"} ${mobileMenuOpen ? "mobile open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <img 
              src={logoImg || `${process.env.PUBLIC_URL}/logo.svg`} 
              alt="Logo TransSync" 
              className="sidebar-logo" 
            />
            {isOpen && <span className="sidebar-title">TransSync</span>}
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle sidebar"
          >
            {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <div className="user-profile">
          <div className="avatar">
            <FaUserShield size={24} />
          </div>
          {isOpen && (
            <div className="user-info">
              <h4>Administrador</h4>
              <p>TransSync</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map(({ path, icon, label }) => (
              <li key={path} className={location.pathname === path ? "active" : ""}>
                <Link to={path} className="menu-link">
                  <span className="menu-icon">{icon}</span>
                  {isOpen && <span className="menu-label">{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon"><FaSignOutAlt /></span>
            {isOpen && <span className="logout-label">Cerrar Sesión</span>}
          </button>
          
          {isOpen && (
            <div className="version-info">
              <p>&copy; {new Date().getFullYear()} TransSync v1.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;