import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Drivers from "../pages/Drivers";
import RoutesPage from "../pages/RoutesPage";  
import Vehiculos from "../pages/Vehiculos"; 
import Horarios from "../pages/Horarios"; 
import Emergency from "../pages/Emergency";
import Informes from "../pages/Informes";
import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/vehiculos" element={<Vehiculos />} /> 
        <Route path="/horarios" element={<Horarios />} /> 
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/informes" element={<Informes />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
