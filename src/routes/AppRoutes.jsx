import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Drivers from "../pages/Drivers";
import RoutesPage from "../pages/Routes";
import Emergency from "../pages/Emergency";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Button from "../components/Button";
import ChatBot from "../components/ChatBot";
import EmergencyButton from "../components/EmergencyButton";
import Menu from "../components/Menu";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
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
                    <Route path="/routes" element={<RoutesPage />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/chatbot" element={<ChatBot />} />
                    <Route path="/emergency-button" element={<EmergencyButton />} />
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