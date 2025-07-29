import { useState } from "react";

const Rutas = () => {
  // Mock icons since react-icons is not available
  const FaSearch = () => <span>🔍</span>;
  const FaPlus = () => <span>➕</span>;
  const FaEdit = () => <span>✏️</span>;
  const FaTrash = () => <span>🗑️</span>;
  const FaMapMarkerAlt = () => <span>📍</span>;
  const FaClock = () => <span>🕐</span>;

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentRuta, setCurrentRuta] = useState(null);

  // Datos de ejemplo más completos
  const rutas = [
    { 
      id: 1, 
      nombre: "Ruta 101", 
      origen: "Centro", 
      destino: "Norte", 
      horario: "06:00 - 22:00",
      frecuencia: "Cada 15 min",
      estado: "Activa",
      vehiculosAsignados: 5
    },
    { 
      id: 2, 
      nombre: "Ruta 202", 
      origen: "Sur", 
      destino: "Centro", 
      horario: "05:30 - 23:00",
      frecuencia: "Cada 20 min",
      estado: "Activa",
      vehiculosAsignados: 3
    },
    { 
      id: 3, 
      nombre: "Ruta 303", 
      origen: "Occidente", 
      destino: "Oriente", 
      horario: "06:30 - 21:00",
      frecuencia: "Cada 30 min",
      estado: "Mantenimiento",
      vehiculosAsignados: 2
    },
  ];

  const filteredRutas = rutas.filter((ruta) =>
    ruta.nombre.toLowerCase().includes(search.toLowerCase()) ||
    ruta.origen.toLowerCase().includes(search.toLowerCase()) ||
    ruta.destino.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (ruta) => {
    setCurrentRuta(ruta);
    setShowModal(true);
  };

  const handleAdd = () => {
    setCurrentRuta(null);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold text-slate-800 mb-2">Gestión de Rutas</h2>
          <span className="text-sm text-gray-500 font-medium">Sistema de Transporte Público de Colombia</span>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, origen o destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 pl-9 pr-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-200 text-slate-800 bg-white focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
            />
          </div>
          
          <button 
            className="bg-blue-700 text-white py-2.5 px-4.5 border-none rounded-lg font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
            onClick={handleAdd}
          >
            <FaPlus /> Agregar Ruta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8">
          <div className="text-4xl font-bold text-slate-800 mb-2">{rutas.length}</div>
          <div className="text-sm text-gray-500 font-medium">Total Rutas</div>
        </div>
        <div className="bg-white rounded-xl p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8">
          <div className="text-4xl font-bold text-slate-800 mb-2">
            {rutas.filter(r => r.estado === "Activa").length}
          </div>
          <div className="text-sm text-gray-500 font-medium">Rutas Activas</div>
        </div>
        <div className="bg-white rounded-xl p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8">
          <div className="text-4xl font-bold text-slate-800 mb-2">
            {rutas.reduce((acc, curr) => acc + curr.vehiculosAsignados, 0)}
          </div>
          <div className="text-sm text-gray-500 font-medium">Vehículos Asignados</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Nombre</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Origen</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Destino</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Horario</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Frecuencia</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Estado</th>
              <th className="bg-gray-50 text-gray-600 font-semibold text-left py-4 px-4 text-sm border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRutas.map((ruta) => (
              <tr 
                key={ruta.id} 
                className={`transition-colors duration-200 hover:bg-gray-50 ${
                  ruta.estado !== "Activa" ? "bg-gray-50 text-gray-400" : ""
                }`}
              >
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <span className="font-semibold text-blue-500">{ruta.nombre}</span>
                </td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500 text-sm" />
                    {ruta.origen}
                  </div>
                </td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500 text-sm" />
                    {ruta.destino}
                  </div>
                </td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-500 text-sm" />
                    {ruta.horario}
                  </div>
                </td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">{ruta.frecuencia}</td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <span className={`inline-block py-1.5 px-2.5 rounded-full text-xs font-semibold uppercase ${
                    ruta.estado === "Activa" 
                      ? "bg-green-100 text-green-700" 
                      : ruta.estado === "Inactiva"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {ruta.estado}
                  </span>
                </td>
                <td className="py-4 px-4 border-b border-gray-200 text-slate-700 text-sm">
                  <div className="flex gap-2">
                    <button 
                      className="border-none bg-none w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 text-blue-500 bg-blue-50 hover:bg-blue-200 hover:text-blue-700"
                      onClick={() => handleEdit(ruta)}
                    >
                      <FaEdit />
                    </button>
                    <button className="border-none bg-none w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 text-red-500 bg-red-50 hover:bg-red-200 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-2xl p-6 shadow-2xl">
            <h3 className="text-xl mb-6 mt-0 text-slate-800">
              {currentRuta ? "Editar Ruta" : "Agregar Nueva Ruta"}
            </h3>
            <div className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2 font-medium">Nombre de la Ruta</label>
                <input 
                  type="text" 
                  defaultValue={currentRuta?.nombre || ""}
                  placeholder="Ej: Ruta 101"
                  className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Origen</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.origen || ""}
                    placeholder="Ej: Centro"
                    className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Destino</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.destino || ""}
                    placeholder="Ej: Norte"
                    className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Horario</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.horario || ""}
                    placeholder="Ej: 06:00 - 22:00"
                    className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Frecuencia</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.frecuencia || ""}
                    placeholder="Ej: Cada 15 min"
                    className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2 font-medium">Estado</label>
                <select 
                  defaultValue={currentRuta?.estado || "Activa"}
                  className="py-2.5 px-3 rounded-lg border border-gray-300 text-sm text-slate-700 focus:outline-none focus:shadow-lg focus:shadow-blue-500/30 focus:border-blue-500"
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  className="py-2.5 px-4 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="py-2.5 px-4 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 bg-blue-700 text-white border-none hover:bg-blue-500"
                  onClick={handleSubmit}
                >
                  {currentRuta ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutas;