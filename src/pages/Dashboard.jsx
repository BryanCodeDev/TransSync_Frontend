import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { 
  Bus, 
  Users, 
  LayoutGrid, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Droplet,
  Calendar
} from "lucide-react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    buses: 0,
    drivers: 0,
    routes: 0,
    schedules: 0,
    alerts: 0,
    fuel: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('semana');
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState({
    tripData: {},
    passengerData: {},
    fuelConsumptionData: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Función para obtener datos reales del dashboard
  const fetchDashboardData = async () => {
    try {
      // Implementar las llamadas a las APIs reales
      // const statsResponse = await api.getStats();
      // const alertsResponse = await api.getAlerts();
      // const tripsResponse = await api.getTripData(selectedPeriod);
      // const passengersResponse = await api.getPassengerData();
      // const fuelResponse = await api.getFuelData();
      
      // Actualizar el estado con los datos reales
      // setData(statsResponse.data);
      // setAlerts(alertsResponse.data);
      // setChartData({
      //   tripData: tripsResponse.data,
      //   passengerData: passengersResponse.data,
      //   fuelConsumptionData: fuelResponse.data
      // });
      
      // Descomentar cuando se implementen las APIs reales
      // setIsLoading(false);
      
      // Para propósitos de desarrollo, establecer isLoading a false después de un tiempo breve
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      setIsLoading(false);
    }
  };

  // Datos de ejemplo para mantener la estructura mientras se implementan las APIs
  const tripData = {
    semana: {
      labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
      datasets: [
        {
          label: "Viajes diarios",
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "rgba(255, 204, 0, 0.5)",
          borderColor: "#FFB800",
          borderWidth: 2,
          tension: 0.4
        },
      ],
    },
    mes: {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
      datasets: [
        {
          label: "Viajes semanales",
          data: [0, 0, 0, 0],
          backgroundColor: "rgba(255, 204, 0, 0.5)",
          borderColor: "#FFB800",
          borderWidth: 2,
          tension: 0.4
        },
      ],
    },
    año: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      datasets: [
        {
          label: "Viajes mensuales",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "rgba(255, 204, 0, 0.5)",
          borderColor: "#FFB800",
          borderWidth: 2,
          tension: 0.4
        },
      ],
    }
  };

  const passengerData = {
    labels: ["Ruta 101", "Ruta 202", "Ruta 303", "Ruta 404", "Ruta 505"],
    datasets: [
      {
        label: "Pasajeros por ruta",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const fuelConsumptionData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    datasets: [
      {
        label: "Litros consumidos",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "#22c55e",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando información del sistema...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Control <span>TransSync</span></h1>
        <div className="date-display">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: <Bus />, label: "Buses en servicio", value: data.buses, color: "blue" },
          { icon: <Users />, label: "Conductores", value: data.drivers, color: "green" },
          { icon: <LayoutGrid />, label: "Rutas activas", value: data.routes, color: "purple" },
          { icon: <Clock />, label: "Horarios", value: data.schedules, color: "orange" },
          { icon: <AlertTriangle />, label: "Alertas activas", value: data.alerts, color: "red" },
          { icon: <Droplet />, label: "Combustible (%)", value: data.fuel, color: "teal" }
        ].map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-row">
          <div className="chart-box trips-chart">
            <div className="chart-header">
              <h3>Frecuencia de Viajes</h3>
              <div className="period-selector">
                <button 
                  className={selectedPeriod === 'semana' ? 'active' : ''} 
                  onClick={() => setSelectedPeriod('semana')}
                >
                  Semana
                </button>
                <button 
                  className={selectedPeriod === 'mes' ? 'active' : ''} 
                  onClick={() => setSelectedPeriod('mes')}
                >
                  Mes
                </button>
                <button 
                  className={selectedPeriod === 'año' ? 'active' : ''} 
                  onClick={() => setSelectedPeriod('año')}
                >
                  Año
                </button>
              </div>
            </div>
            <div className="chart-container">
              <Line data={tripData[selectedPeriod]} options={chartOptions} />
            </div>
          </div>

          <div className="chart-box passenger-chart">
            <h3>Distribución de Pasajeros</h3>
            <div className="chart-container">
              <Doughnut data={passengerData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-box fuel-chart">
            <h3>Consumo de Combustible</h3>
            <div className="chart-container">
              <Line data={fuelConsumptionData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-box alerts-list">
            <h3>Alertas Recientes</h3>
            {alerts && alerts.length > 0 ? (
              <ul className="alerts">
                {alerts.map((alert, index) => (
                  <li key={index} className={`alert-item ${alert.severity}`}>
                    <AlertTriangle size={16} />
                    <div className="alert-content">
                      <p className="alert-title">{alert.title}</p>
                      <p className="alert-time">{alert.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-reports">No hay alertas recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;