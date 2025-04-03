import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaHome, FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";

import "../styles/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return JSON.parse(localStorage.getItem("sidebarOpen")) ?? true;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

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
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="sidebar-logo" />
        {isOpen && <span className="sidebar-title">TransSync</span>}
      </div>

      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      <ul className="sidebar-menu">
        {menuItems.map(({ path, icon, label }) => (
          <li key={path} className={location.pathname === path ? "active" : ""}>
            <Link to={path} className="menu-link">
              {icon}
              {isOpen && <span className="menu-label">{label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <button onClick={handleLogout} className="logout-btn">
        <FaSignOutAlt />
        {isOpen && <span className="logout-label">Cerrar Sesión</span>}
      </button>

      {isOpen && <footer className="sidebar-footer">&copy; {new Date().getFullYear()} TransSync v1.0</footer>}
    </div>
  );
};

export default Sidebar;
