import React, { useState } from "react";
import { Search, Plus, Eye, Edit, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const driversPerPage = 5;
  
  const drivers = [
    { id: 1, name: "Carlos Pérez", status: "En ruta", vehicle: "Bus 42", route: "Centro - Norte", lastActive: "Hace 5 min" },
    { id: 2, name: "María Gómez", status: "Disponible", vehicle: "Bus 18", route: "Este - Oeste", lastActive: "Hace 2 min" },
    { id: 3, name: "Juan Rodríguez", status: "Fuera de servicio", vehicle: "Bus 27", route: "Sur - Centro", lastActive: "Hace 3 horas" },
    { id: 4, name: "Ana López", status: "En ruta", vehicle: "Bus 15", route: "Norte - Sur", lastActive: "Hace 12 min" },
    { id: 5, name: "Roberto Díaz", status: "Disponible", vehicle: "Bus 31", route: "Circular", lastActive: "Hace 1 min" },
    { id: 6, name: "Daniela Vargas", status: "En ruta", vehicle: "Bus 05", route: "Express Centro", lastActive: "Hace 8 min" },
    { id: 7, name: "Miguel Sánchez", status: "Fuera de servicio", vehicle: "Bus 22", route: "Periférico", lastActive: "Hace 5 horas" },
  ];

  // Filtrar los conductores
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular la paginación
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage);

  // Cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case "En ruta": 
        return {
          badgeClass: "bg-green-50 text-green-700 border border-green-200",
          indicatorClass: "bg-green-600 shadow-green-200"
        };
      case "Disponible": 
        return {
          badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
          indicatorClass: "bg-blue-600 shadow-blue-200"
        };
      case "Fuera de servicio": 
        return {
          badgeClass: "bg-red-50 text-red-700 border border-red-200",
          indicatorClass: "bg-red-600 shadow-red-200"
        };
      default: 
        return {
          badgeClass: "bg-gray-50 text-gray-700 border border-gray-200",
          indicatorClass: "bg-gray-600 shadow-gray-200"
        };
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-lg max-w-7xl mx-auto my-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 m-0 pb-1.5 border-b-4 border-blue-600 inline-block">
          Conductores
        </h2>
        <p className="text-slate-500 text-base mt-2 mb-6 font-normal">
          Panel de gestión de conductores de transporte público
        </p>
        
        <div className="flex justify-between items-center mt-5 gap-4 flex-col lg:flex-row">
          {/* Search */}
          <div className="relative w-full lg:w-96 flex-shrink">
            <input 
              type="text" 
              placeholder="Buscar por nombre, estado, vehículo o ruta..." 
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 text-sm transition-all bg-white text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          </div>
          
          {/* Add Button */}
          <button className="bg-blue-600 text-white border-none px-5 py-3 rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-2 shadow-blue-300 shadow-md whitespace-nowrap hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-blue-400 hover:shadow-lg active:translate-y-0 active:shadow-blue-300 active:shadow-sm">
            <Plus size={16} />
            <span>Agregar conductor</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0 first:rounded-tl-xl">ID</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Nombre</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Estado</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Vehículo</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Ruta</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Última actividad</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0 last:rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver, index) => {
                const statusConfig = getStatusConfig(driver.status);
                return (
                  <tr key={driver.id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-slate-100 transition-colors`}>
                    <td className="p-4 border-t border-slate-200">{driver.id}</td>
                    <td className="p-4 border-t border-slate-200 font-semibold text-slate-800">{driver.name}</td>
                    <td className="p-4 border-t border-slate-200">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium gap-1.5 ${statusConfig.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig.indicatorClass} shadow-sm`}></span>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-4 border-t border-slate-200">{driver.vehicle}</td>
                    <td className="p-4 border-t border-slate-200">{driver.route}</td>
                    <td className="p-4 border-t border-slate-200">{driver.lastActive}</td>
                    <td className="p-4 border-t border-slate-200 whitespace-nowrap">
                      <button className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer mr-1.5 transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-blue-600 hover:border-blue-600" title="Ver detalles">
                        <Eye size={16} />
                      </button>
                      <button className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer mr-1.5 transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-orange-500 hover:border-orange-500" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-green-600 hover:border-green-600" title="Enviar mensaje">
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-500 italic border-t border-slate-200">
                  No se encontraron conductores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-200 flex-col lg:flex-row gap-5">
        {/* Stats */}
        <div className="flex gap-6 flex-wrap justify-center lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total conductores:</span>
            <span className="font-semibold text-slate-800">{drivers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">En ruta:</span>
            <span className="font-semibold text-slate-800">{drivers.filter(d => d.status === "En ruta").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Disponibles:</span>
            <span className="font-semibold text-slate-800">{drivers.filter(d => d.status === "Disponible").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Fuera de servicio:</span>
            <span className="font-semibold text-slate-800">{drivers.filter(d => d.status === "Fuera de servicio").length}</span>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center gap-3">
          <button 
            className={`bg-white border border-slate-300 px-4 py-2 rounded-md cursor-pointer transition-all flex items-center gap-1.5 text-slate-800 font-medium ${
              currentPage === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-slate-100 hover:border-slate-400'
            }`}
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          <span className="text-sm text-slate-500 font-medium">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button 
            className={`bg-white border border-slate-300 px-4 py-2 rounded-md cursor-pointer transition-all flex items-center gap-1.5 text-slate-800 font-medium ${
              currentPage === totalPages || totalPages === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-slate-100 hover:border-slate-400'
            }`}
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drivers;