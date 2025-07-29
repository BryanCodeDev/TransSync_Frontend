import { useState, useEffect } from "react";
import { 
  Bus, 
  Users, 
  LayoutGrid, 
  Clock, 
  AlertTriangle,
  Droplet,
  Calendar
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
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
  const [data] = useState({
    buses: 0,
    drivers: 0,
    routes: 0,
    schedules: 0,
    alerts: 0,
    fuel: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('semana');
  const [alerts] = useState([]);

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
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-5"></div>
        <p className="text-gray-600">Cargando información del sistema...</p>
      </div>
    );
  }

  const stats = [
    { icon: <Bus />, label: "Buses en servicio", value: data.buses, colorClass: "border-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    { icon: <Users />, label: "Conductores", value: data.drivers, colorClass: "border-green-500", iconBg: "bg-green-50", iconColor: "text-green-500" },
    { icon: <LayoutGrid />, label: "Rutas activas", value: data.routes, colorClass: "border-purple-500", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
    { icon: <Clock />, label: "Horarios", value: data.schedules, colorClass: "border-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
    { icon: <AlertTriangle />, label: "Alertas activas", value: data.alerts, colorClass: "border-red-500", iconBg: "bg-red-50", iconColor: "text-red-500" },
    { icon: <Droplet />, label: "Combustible (%)", value: data.fuel, colorClass: "border-teal-500", iconBg: "bg-teal-50", iconColor: "text-teal-500" }
  ];

  return (
    <div className="p-5 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-col md:flex-row md:items-center gap-3">
        <h1 className="text-3xl font-bold text-blue-900 m-0">
          Panel de Control <span className="text-yellow-500">TransSync</span>
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-md shadow-sm">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`flex items-center p-5 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border-l-4 ${stat.colorClass}`}
          >
            <div className={`flex items-center justify-center w-12 h-12 ${stat.iconBg} rounded-xl mr-4 ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 m-0 mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 m-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Container */}
      <div className="flex flex-col gap-5">
        {/* First Chart Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Trips Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-col md:flex-row gap-3">
              <h3 className="text-lg font-semibold text-slate-700 m-0">Frecuencia de Viajes</h3>
              <div className="flex gap-0.5 bg-slate-100 rounded-md p-0.5">
                <button 
                  className={`px-3 py-1.5 text-sm rounded transition-all ${selectedPeriod === 'semana' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setSelectedPeriod('semana')}
                >
                  Semana
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm rounded transition-all ${selectedPeriod === 'mes' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setSelectedPeriod('mes')}
                >
                  Mes
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm rounded transition-all ${selectedPeriod === 'año' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setSelectedPeriod('año')}
                >
                  Año
                </button>
              </div>
            </div>
            <div className="flex-grow h-80 relative">
              <Line data={tripData[selectedPeriod]} options={chartOptions} />
            </div>
          </div>

          {/* Passenger Chart */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 m-0 mb-4">Distribución de Pasajeros</h3>
            <div className="flex-grow h-80 relative">
              <Doughnut data={passengerData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Second Chart Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Fuel Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 m-0 mb-4">Consumo de Combustible</h3>
            <div className="flex-grow h-80 relative">
              <Line data={fuelConsumptionData} options={chartOptions} />
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-700 m-0 mb-4">Alertas Recientes</h3>
            {alerts && alerts.length > 0 ? (
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {alerts.map((alert, index) => (
                  <li key={index} className={`flex items-start gap-3 p-3 rounded-md bg-slate-50 ${
                    alert.severity === 'critical' ? 'border-l-4 border-red-500 text-red-500' :
                    alert.severity === 'warning' ? 'border-l-4 border-orange-500 text-orange-500' :
                    'border-l-4 border-blue-500 text-blue-500'
                  }`}>
                    <AlertTriangle size={16} />
                    <div className="flex-1">
                      <p className="m-0 mb-0.5 text-sm font-medium text-slate-800">{alert.title}</p>
                      <p className="m-0 text-xs text-slate-500">{alert.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-center py-12 italic">No hay alertas recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;