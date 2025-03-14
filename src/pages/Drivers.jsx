const Drivers = () => {
  const drivers = [
    { id: 1, name: "Carlos Pérez", status: "En ruta" },
    { id: 2, name: "María Gómez", status: "Disponible" },
    { id: 3, name: "Juan Rodríguez", status: "Fuera de servicio" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">🚗 Conductores</h2>
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
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-t">
                <td className="p-3">{driver.id}</td>
                <td className="p-3">{driver.name}</td>
                <td
                  className={`p-3 ${
                    driver.status === "En ruta"
                      ? "text-green-600"
                      : driver.status === "Disponible"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {driver.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drivers;
