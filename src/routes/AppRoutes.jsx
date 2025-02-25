// Configuración de las rutas

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Drivers from "../pages/Drivers";
import RoutesPage from "../pages/Routes"; // Evitamos conflicto con "Routes" de React Router
import Emergency from "../pages/Emergency";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/emergency" element={<Emergency />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
