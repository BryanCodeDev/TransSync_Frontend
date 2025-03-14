import React from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Users, Bus, AlertTriangle, Clock, Map, Calendar } from 'lucide-react';
import "../styles/dashboard.css";

// Sample data for charts
const trafficData = [
  { name: '6:00', pasajeros: 1240 },
  { name: '8:00', pasajeros: 3450 },
  { name: '10:00', pasajeros: 2000 },
  { name: '12:00', pasajeros: 2780 },
  { name: '14:00', pasajeros: 1890 },
  { name: '16:00', pasajeros: 2390 },
  { name: '18:00', pasajeros: 3490 },
  { name: '20:00', pasajeros: 2490 },
];

const routePerformance = [
  { name: 'Ruta 103', eficiencia: 85 },
  { name: 'Ruta 205', eficiencia: 75 },
  { name: 'Ruta 87', eficiencia: 92 },
  { name: 'Ruta 64', eficiencia: 78 },
  { name: 'Ruta 32', eficiencia: 80 },
];

const vehicleStatus = [
  { name: 'En operación', value: 150 },
  { name: 'En mantenimiento', value: 15 },
  { name: 'Fuera de servicio', value: 8 },
];

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

// Component structure
const Dashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header />
      
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Title and Actions */}
        <DashboardTitle />
        
        {/* KPI Cards */}
        <KpiSection />
        
        {/* Charts Section */}
        <ChartsSection />
        
        {/* Lower Section - Vehicle Status and Alerts */}
        <LowerSection />
        
        {/* Route Map */}
        <RouteMap />
      </div>
    </div>
  );
};

// Header Component
const Header = () => (
  <div className="bg-white shadow-sm">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-700">TransSync</h1>
      <div className="flex items-center space-x-2">
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Online</span>
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <span className="font-medium">JS</span>
        </div>
      </div>
    </div>
  </div>
);

// Dashboard Title Component
const DashboardTitle = () => (
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
    <div className="flex space-x-2">
      <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        <Calendar size={18} className="inline mr-1" />
        Hoy
      </button>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Generar Reporte
      </button>
    </div>
  </div>
);

// KPI Section Component
const KpiSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <KpiCard 
      icon={<Users size={24} className="text-blue-600" />}
      iconBg="bg-blue-100"
      title="Usuarios Activos"
      value="1,250"
      change="+3.4% vs. ayer"
      positive={true}
    />
    
    <KpiCard 
      icon={<Bus size={24} className="text-green-600" />}
      iconBg="bg-green-100"
      title="Vehículos en Ruta"
      value="150"
      change="95% de la flota"
      positive={true}
    />
    
    <KpiCard 
      icon={<Clock size={24} className="text-yellow-600" />}
      iconBg="bg-yellow-100"
      title="Tiempo Promedio"
      value="12:30 min"
      change="-1:45 min vs. meta"
      positive={true}
    />
    
    <KpiCard 
      icon={<AlertTriangle size={24} className="text-red-600" />}
      iconBg="bg-red-100"
      title="Alertas Activas"
      value="3"
      change="+1 en última hora"
      positive={false}
    />
  </div>
);

// KPI Card Component
const KpiCard = ({ icon, iconBg, title, value, change, positive }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center">
      <div className={`${iconBg} p-3 rounded-lg mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </div>
    </div>
  </div>
);

// Charts Section Component
const ChartsSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Flujo de Pasajeros (Hoy)</h3>
      <LineChart width={500} height={300} data={trafficData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pasajeros" stroke="#3B82F6" strokeWidth={2} />
      </LineChart>
    </div>
    
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Eficiencia por Ruta (%)</h3>
      <BarChart width={500} height={300} data={routePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="eficiencia" fill="#3B82F6" />
      </BarChart>
    </div>
  </div>
);

// Lower Section Component
const LowerSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <VehicleStatusChart />
    <AlertsTable />
  </div>
);

// Vehicle Status Chart Component
const VehicleStatusChart = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Vehículos</h3>
    <div className="flex justify-center">
      <PieChart width={250} height={250}>
        <Pie
          data={vehicleStatus}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {vehicleStatus.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  </div>
);

// Alerts Table Component
const AlertsTable = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Recientes</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">ID</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Tipo</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Vehículo</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Ubicación</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Estado</th>
          </tr>
        </thead>
        <tbody>
          <AlertRow 
            id="#A1023" 
            type="Emergencia" 
            typeBg="bg-red-100 text-red-800" 
            vehicle="Bus 087" 
            location="Av. Principal" 
            status="En proceso" 
            statusBg="bg-yellow-100 text-yellow-800" 
          />
          <AlertRow 
            id="#A1022" 
            type="Retraso" 
            typeBg="bg-yellow-100 text-yellow-800" 
            vehicle="Bus 142" 
            location="Calle Norte" 
            status="Resuelto" 
            statusBg="bg-green-100 text-green-800" 
          />
          <AlertRow 
            id="#A1021" 
            type="Técnico" 
            typeBg="bg-red-100 text-red-800" 
            vehicle="Bus 056" 
            location="Terminal Sur" 
            status="Resuelto" 
            statusBg="bg-green-100 text-green-800" 
          />
        </tbody>
      </table>
    </div>
    <div className="mt-4 text-right">
      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Ver todas las alertas →
      </button>
    </div>
  </div>
);

// Alert Row Component
const AlertRow = ({ id, type, typeBg, vehicle, location, status, statusBg }) => (
  <tr className="border-b">
    <td className="py-3 px-4 text-sm">{id}</td>
    <td className="py-3 px-4 text-sm">
      <span className={`${typeBg} text-xs font-medium px-2.5 py-0.5 rounded`}>{type}</span>
    </td>
    <td className="py-3 px-4 text-sm">{vehicle}</td>
    <td className="py-3 px-4 text-sm">{location}</td>
    <td className="py-3 px-4 text-sm">
      <span className={`${statusBg} text-xs font-medium px-2.5 py-0.5 rounded`}>{status}</span>
    </td>
  </tr>
);

// Route Map Component
const RouteMap = () => (
  <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Monitoreo de Rutas en Tiempo Real</h3>
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Todas las rutas</button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Alta demanda</button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Incidentes</button>
      </div>
    </div>
    <div className="bg-gray-200 h-64 rounded flex items-center justify-center">
      <div className="flex flex-col items-center text-gray-500">
        <Map size={48} />
        <p className="mt-2">Vista previa del mapa de rutas</p>
      </div>
    </div>
  </div>
);

export default Dashboard;