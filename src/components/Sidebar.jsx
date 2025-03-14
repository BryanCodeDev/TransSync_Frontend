import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";
import { useState, useEffect } from "react";
import { FaHome, FaChartLine, FaUserTie, FaRoute, FaBus, FaClock, FaExclamationTriangle, FaFileAlt, FaSignOutAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
    { path: "/", icon: <FaHome />, label: "Inicio" },
    { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/drivers", icon: <FaUserTie />, label: "Conductores" },
    { path: "/routes", icon: <FaRoute />, label: "Rutas" },
    { path: "/vehicles", icon: <FaBus />, label: "Vehículos" },
    { path: "/schedules", icon: <FaClock />, label: "Horarios" },
    { path: "/emergency", icon: <FaExclamationTriangle />, label: "Emergencias" },
    { path: "/reports", icon: <FaFileAlt />, label: "Informes" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        {isOpen && <div className="sidebar-title">TransportApp</div>}
      </div>
      
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      
      <ul>
        {menuItems.map(({ path, icon, label }) => (
          <li key={path}>
            <Link to={path} className={location.pathname === path ? "active" : ""}>
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
      
      {isOpen && (
        <div className="sidebar-footer">
          &copy; {new Date().getFullYear()} TransportApp v1.0
        </div>
      )}
    </div>
  );
};

export default Sidebar;
