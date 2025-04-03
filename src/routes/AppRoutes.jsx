import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Drivers from "../pages/Drivers";
import Rutas from "../pages/Rutas";
import Emergency from "../pages/Emergency";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import Button from "../components/Button";
import ChatBot from "../components/ChatBot";
import SEO from "../components/SEO";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<><SEO title="Iniciar Sesión | TransSync" description="Accede a tu cuenta en TransSync." /><Login /></>} />
        <Route path="/register" element={<><SEO title="Registro | TransSync" description="Crea una cuenta en TransSync y accede a nuestros servicios de transporte." /><Register /></>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Sidebar />
                <div style={{ marginLeft: "260px", padding: "20px" }}>
                  <Routes>
                    <Route path="/home" element={<><SEO title="Inicio | TransSync" description="Plataforma de gestión de transporte y conductores." /><Home /></>} />
                    <Route path="/dashboard" element={<><SEO title="Dashboard | TransSync" description="Gestiona y monitorea el sistema de transporte con TransSync." /><Dashboard /></>} />
                    <Route path="/drivers" element={<><SEO title="Conductores | TransSync" description="Administra y gestiona la información de los conductores." /><Drivers /></>} />
                    <Route path="/Rutas" element={<><SEO title="Rutas | TransSync" description="Consulta y gestiona las rutas de transporte." /><Rutas /></>} />
                    <Route path="/emergency" element={<><SEO title="Emergencias | TransSync" description="Gestiona situaciones de emergencia en el sistema de transporte." /><Emergency /></>} />
                    <Route path="/chatbot" element={<><SEO title="ChatBot | TransSync" description="Asistencia automática para la gestión de transporte." /><ChatBot /></>} />
                    <Route path="/button" element={<><SEO title="Botón de Acción | TransSync" description="Interacciones rápidas dentro de la plataforma." /><Button /></>} />
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
