import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaHome, FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBars 
} from "react-icons/fa";

import "../styles/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("sidebarOpen")) ?? true;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/", icon: <FaHome />, label: "Inicio" },
    { path: "/Dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/Drivers", icon: <FaUserTie />, label: "Conductores" },
    { path: "/Rutas", icon: <FaRoute />, label: "Rutas" },
    { path: "/Vehiculos", icon: <FaBus />, label: "Vehículos" }, 
    { path: "/Horarios", icon: <FaClock />, label: "Horarios" }, 
    { path: "/Emergency", icon: <FaExclamationTriangle />, label: "Emergencias" },
    { path: "/Informes", icon: <FaFileAlt />, label: "Informes" }, 
  ];

  return (
    <>
      {/* Botón para móviles */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </button>
      )}

      <div className={`sidebar ${isOpen ? "open" : "closed"} ${isMobile ? "mobile" : ""}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" className="sidebar-logo" />
          {isOpen && <span className="sidebar-title">TransSync</span>}
        </div>

        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <ul className="sidebar-menu">
          {menuItems.map(({ path, icon, label }) => (
            <li key={path} className={location.pathname === path ? "active" : ""}>
              <Link to={path}>
                {icon}
                {isOpen && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt />
          {isOpen && <span>Cerrar Sesión</span>}
        </button>

        {isOpen && <footer className="sidebar-footer">&copy; {new Date().getFullYear()} TransSync v1.0</footer>}
      </div>
    </>
  );
};

export default Sidebar;
