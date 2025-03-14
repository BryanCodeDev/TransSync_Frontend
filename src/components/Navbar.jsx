import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2>TransSync</h2>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/drivers">Conductores</Link></li>
        <li><Link to="/routes">Rutas</Link></li>
        <li><Link to="/emergency">Emergencias</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
