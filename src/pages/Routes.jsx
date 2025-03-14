const RoutesPage = () => {
  const routes = [
    { id: 101, name: "Ruta Centro - Norte", status: "Activa" },
    { id: 102, name: "Ruta Sur - Oeste", status: "En mantenimiento" },
    { id: 103, name: "Ruta Este - Terminal", status: "Activa" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">🛣️ Rutas</h2>
      <div className="bg-white shadow-md rounded-lg p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t">
                <td className="p-3">{route.id}</td>
                <td className="p-3">{route.name}</td>
                <td
                  className={`p-3 ${
                    route.status === "Activa"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {route.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoutesPage;
