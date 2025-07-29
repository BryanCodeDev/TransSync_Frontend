import { useState, useEffect } from 'react';
import { FaBus, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaPlus } from "react-icons/fa";

const Vehiculos = () => {
  // Enhanced vehicle data with more relevant fields for transport management
  const [vehiculos, setVehiculos] = useState([
    { id: 1, placa: "ABC-123", modelo: "Mercedes-Benz O500", año: 2022, capacidad: 45, conductor: "Carlos Ramírez", ruta: "R-101", ultimoMantenimiento: "2025-03-15", disponible: true, estado: "Excelente" },
    { id: 2, placa: "XYZ-789", modelo: "Volvo 9800", año: 2021, capacidad: 50, conductor: "Ana Martínez", ruta: "R-205", ultimoMantenimiento: "2025-04-01", disponible: false, estado: "En mantenimiento" },
    { id: 3, placa: "DEF-456", modelo: "Scania K410", año: 2023, capacidad: 40, conductor: "Juan Torres", ruta: "R-103", ultimoMantenimiento: "2025-03-28", disponible: true, estado: "Bueno" },
    { id: 4, placa: "GHI-789", modelo: "Mercedes-Benz O500", año: 2020, capacidad: 45, conductor: "Laura Pérez", ruta: "R-104", ultimoMantenimiento: "2025-02-10", disponible: true, estado: "Regular" },
    { id: 5, placa: "JKL-012", modelo: "Volvo 9700", año: 2021, capacidad: 50, conductor: "No asignado", ruta: "Sin asignar", ultimoMantenimiento: "2025-03-05", disponible: false, estado: "En revisión" },
  ]);

  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehiculo, setNewVehiculo] = useState({
    placa: '', modelo: '', año: '', capacidad: '', conductor: '', ruta: '', ultimoMantenimiento: '', disponible: true, estado: 'Excelente'
  });

  // Filter vehicles based on search term and status filter
  useEffect(() => {
    let results = vehiculos;
    
    if (searchTerm) {
      results = results.filter(v => 
        v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.conductor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      results = results.filter(v => 
        filterStatus === 'available' ? v.disponible : !v.disponible
      );
    }
    
    setFilteredVehiculos(results);
  }, [searchTerm, filterStatus, vehiculos]);

  const handleAddVehiculo = () => {
    const id = vehiculos.length > 0 ? Math.max(...vehiculos.map(v => v.id)) + 1 : 1;
    setVehiculos([...vehiculos, { ...newVehiculo, id }]);
    setShowAddModal(false);
    setNewVehiculo({
      placa: '', modelo: '', año: '', capacidad: '', conductor: '', ruta: '', ultimoMantenimiento: '', disponible: true, estado: 'Excelente'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVehiculo({
      ...newVehiculo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3 m-0">
          <FaBus className="text-blue-500 text-3xl" />
          Flota de Vehículos
        </h2>
        <div className="flex gap-5">
          <div className="flex flex-col items-center bg-gray-50 py-2 px-5 rounded-lg min-w-24">
            <span className="text-2xl font-bold text-blue-500">{vehiculos.length}</span>
            <span className="text-sm text-slate-500">Total</span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 py-2 px-5 rounded-lg min-w-24">
            <span className="text-2xl font-bold text-blue-500">{vehiculos.filter(v => v.disponible).length}</span>
            <span className="text-sm text-slate-500">Disponibles</span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 py-2 px-5 rounded-lg min-w-24">
            <span className="text-2xl font-bold text-blue-500">{vehiculos.filter(v => !v.disponible).length}</span>
            <span className="text-sm text-slate-500">No Disponibles</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-grow-2 relative min-w-64">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por placa, modelo o conductor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        
        <div className="flex-1 relative min-w-48">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 text-base bg-white cursor-pointer transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
          >
            <option value="all">Todos los vehículos</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>
        </div>

        <button 
          className="bg-green-500 text-white border-none rounded-lg px-6 text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Agregar Vehículo
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {filteredVehiculos.map((vehiculo) => (
          <div key={vehiculo.id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="m-0 text-lg text-slate-800">{vehiculo.modelo}</h3>
              <span className={`flex items-center gap-1 text-sm font-semibold py-1 px-2 rounded-2xl ${
                vehiculo.disponible 
                  ? "text-green-600 bg-green-50" 
                  : "text-red-500 bg-red-50"
              }`}>
                {vehiculo.disponible ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{vehiculo.disponible ? "Disponible" : "No disponible"}</span>
              </span>
            </div>
            <div className="p-4">
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Placa:</span>
                <span className="text-slate-800 text-sm">{vehiculo.placa}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Año:</span>
                <span className="text-slate-800 text-sm">{vehiculo.año}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Capacidad:</span>
                <span className="text-slate-800 text-sm">{vehiculo.capacidad} pasajeros</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Conductor:</span>
                <span className="text-slate-800 text-sm">{vehiculo.conductor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Ruta:</span>
                <span className="text-slate-800 text-sm">{vehiculo.ruta}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Estado:</span>
                <span className="text-slate-800 text-sm">{vehiculo.estado}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-slate-500 text-sm">Último mantenimiento:</span>
                <span className="text-slate-800 text-sm">{vehiculo.ultimoMantenimiento}</span>
              </div>
            </div>
            <div className="flex gap-2 p-4 bg-gray-50">
              <button className="flex-1 py-2 px-4 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-blue-500 text-white hover:bg-blue-600">
                Editar
              </button>
              <button className="flex-1 py-2 px-4 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-gray-200 text-slate-800 hover:bg-gray-300">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-3xl max-h-screen overflow-y-auto">
            <h3 className="mt-0 text-slate-800 border-b border-gray-100 pb-4">Agregar Nuevo Vehículo</h3>
            <div className="flex gap-5 mb-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Placa</label>
                <input 
                  type="text" 
                  name="placa" 
                  value={newVehiculo.placa} 
                  onChange={handleInputChange} 
                  required 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Modelo</label>
                <input 
                  type="text" 
                  name="modelo" 
                  value={newVehiculo.modelo} 
                  onChange={handleInputChange} 
                  required 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-5 mb-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Año</label>
                <input 
                  type="number" 
                  name="año" 
                  value={newVehiculo.año} 
                  onChange={handleInputChange} 
                  required 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Capacidad</label>
                <input 
                  type="number" 
                  name="capacidad" 
                  value={newVehiculo.capacidad} 
                  onChange={handleInputChange} 
                  required 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-5 mb-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Conductor</label>
                <input 
                  type="text" 
                  name="conductor" 
                  value={newVehiculo.conductor} 
                  onChange={handleInputChange} 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Ruta</label>
                <input 
                  type="text" 
                  name="ruta" 
                  value={newVehiculo.ruta} 
                  onChange={handleInputChange} 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-5 mb-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Último Mantenimiento</label>
                <input 
                  type="date" 
                  name="ultimoMantenimiento" 
                  value={newVehiculo.ultimoMantenimiento} 
                  onChange={handleInputChange} 
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Estado</label>
                <select 
                  name="estado" 
                  value={newVehiculo.estado} 
                  onChange={handleInputChange}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="En revisión">En revisión</option>
                </select>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="disponible" 
                name="disponible" 
                checked={newVehiculo.disponible} 
                onChange={handleInputChange} 
                className="w-4 h-4"
              />
              <label htmlFor="disponible" className="text-sm font-semibold text-slate-500">Disponible para operación</label>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-slate-800 border-none hover:bg-gray-300" 
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-green-500 text-white border-none hover:bg-green-600" 
                onClick={handleAddVehiculo}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehiculos;