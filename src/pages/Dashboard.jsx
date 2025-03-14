const Dashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">📊 Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-semibold">Usuarios Activos</h3>
          <p className="text-blue-600 text-2xl font-bold">1,250</p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-semibold">Vehículos en Ruta</h3>
          <p className="text-green-600 text-2xl font-bold">150</p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-semibold">Alertas de Emergencia</h3>
          <p className="text-red-600 text-2xl font-bold">3</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
