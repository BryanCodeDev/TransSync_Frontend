import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { FaBus, FaUsers, FaRoute, FaClock } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState({
    buses: 0,
    drivers: 0,
    routes: 0,
    schedules: 0,
  });

  useEffect(() => {
    // Simulación de datos dinámicos (puede reemplazarse con una API real)
    setTimeout(() => {
      setData({ buses: 24, drivers: 50, routes: 12, schedules: 8 });
    }, 1000);
  }, []);

  const stats = [
    { icon: <FaBus />, label: "Buses en servicio", value: data.buses },
    { icon: <FaUsers />, label: "Conductores", value: data.drivers },
    { icon: <FaRoute />, label: "Rutas activas", value: data.routes },
    { icon: <FaClock />, label: "Horarios registrados", value: data.schedules },
  ];

  const chartData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    datasets: [
      {
        label: "Viajes diarios",
        data: [50, 65, 80, 70, 60, 75, 85],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1>Panel de Control</h1>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="icon">{stat.icon}</div>
            <div className="info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="charts-container">
        <div className="chart-box">
          <h3>Frecuencia de Viajes</h3>
          <Bar data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
