import { Link, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <ul>
        <li><Link to="/">🏠 Inicio</Link></li>
        <li><Link to="/dashboard">📊 Dashboard</Link></li>
        <li><Link to="/drivers">🚗 Conductores</Link></li>
        <li><Link to="/routes">🛣️ Rutas</Link></li>
        <li><Link to="/emergency">⚠️ Emergencias</Link></li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            🔐 Cerrar Sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
