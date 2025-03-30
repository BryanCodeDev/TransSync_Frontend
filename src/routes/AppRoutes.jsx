import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Drivers from "../pages/Drivers";
import Rutas from "../pages/Rutas"; 
import Emergency from "../pages/Emergency";
import Login from "../pages/Login";
import Register from "../pages/Register"; // Importamos el componente de registro
import ProtectedRoute from "./ProtectedRoute";
import Button from "../components/Button";
import ChatBot from "../components/ChatBot";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Nueva ruta */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Sidebar />
                <div style={{ marginLeft: "260px", padding: "20px" }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/drivers" element={<Drivers />} />
                    <Route path="/Rutas" element={<Rutas />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/chatbot" element={<ChatBot />} />
                    <Route path="/button" element={<Button />} />
                  </Routes>
                </div>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
