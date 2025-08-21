import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Eye, Edit, MessageSquare, ChevronLeft, ChevronRight, AlertCircle, Loader } from "lucide-react";
import driversAPI from "../utilidades/driversAPI";

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters] = useState({}); // Removido setFilters ya que no se usa
  const driversPerPage = 5;

  // Usar useCallback para evitar el warning de dependencies
  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Corregido: usar driversAPI.getAll en lugar de apiService.data.getDrivers
      const response = await driversAPI.getAll(filters);
      // La respuesta puede venir directamente como array o con una propiedad específica
      setDrivers(response.conductores || response || []);
    } catch (error) {
      console.error('Error cargando conductores:', error);
      setError(error.message || 'Error al cargar los conductores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar conductores al montar el componente
  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  // Filtrar los conductores por término de búsqueda
  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase();
    return (
      driver.nomConductor?.toLowerCase().includes(searchLower) ||
      driver.apeConductor?.toLowerCase().includes(searchLower) ||
      driver.estConductor?.toLowerCase().includes(searchLower) ||
      driver.numDocConductor?.toLowerCase().includes(searchLower) ||
      driver.telConductor?.toLowerCase().includes(searchLower) ||
      // Buscar en datos del vehículo si está asignado
      (driver.vehiculo && (
        driver.vehiculo.numVehiculo?.toLowerCase().includes(searchLower) ||
        driver.vehiculo.plaVehiculo?.toLowerCase().includes(searchLower)
      ))
    );
  });

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

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusConfig = (status) => {
    switch(status) {
      case "ACTIVO": 
        return {
          badgeClass: "bg-green-50 text-green-700 border border-green-200",
          indicatorClass: "bg-green-600 shadow-green-200",
          displayText: "Activo"
        };
      case "INACTIVO": 
        return {
          badgeClass: "bg-red-50 text-red-700 border border-red-200",
          indicatorClass: "bg-red-600 shadow-red-200",
          displayText: "Inactivo"
        };
      case "DIA_DESCANSO": 
        return {
          badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
          indicatorClass: "bg-blue-600 shadow-blue-200",
          displayText: "Día de descanso"
        };
      case "INCAPACITADO": 
        return {
          badgeClass: "bg-orange-50 text-orange-700 border border-orange-200",
          indicatorClass: "bg-orange-600 shadow-orange-200",
          displayText: "Incapacitado"
        };
      case "DE_VACACIONES": 
        return {
          badgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
          indicatorClass: "bg-purple-600 shadow-purple-200",
          displayText: "De vacaciones"
        };
      default: 
        return {
          badgeClass: "bg-gray-50 text-gray-700 border border-gray-200",
          indicatorClass: "bg-gray-600 shadow-gray-200",
          displayText: status || "Desconocido"
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const handleCreateDriver = () => {
    // Implementar modal o navegación para crear conductor
    console.log('Crear nuevo conductor');
  };

  const handleViewDriver = (driver) => {
    // Implementar modal o navegación para ver detalles
    console.log('Ver conductor:', driver);
  };

  const handleEditDriver = (driver) => {
    // Implementar modal o navegación para editar
    console.log('Editar conductor:', driver);
  };

  const handleSendMessage = (driver) => {
    // Implementar funcionalidad de mensajería
    console.log('Enviar mensaje a:', driver);
  };

  // Calcular estadísticas
  const stats = {
    total: drivers.length,
    activos: drivers.filter(d => d.estConductor === 'ACTIVO').length,
    inactivos: drivers.filter(d => d.estConductor === 'INACTIVO').length,
    descanso: drivers.filter(d => d.estConductor === 'DIA_DESCANSO').length,
    incapacitados: drivers.filter(d => d.estConductor === 'INCAPACITADO').length,
    vacaciones: drivers.filter(d => d.estConductor === 'DE_VACACIONES').length
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 shadow-lg max-w-7xl mx-auto my-6 font-sans">
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin mr-3" size={24} />
          <span className="text-slate-600">Cargando conductores...</span>
        </div>
      </div>
    );
  }

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
              placeholder="Buscar por nombre, documento, estado o vehículo..." 
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 text-sm transition-all bg-white text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          </div>
          
          {/* Add Button */}
          <button 
            onClick={handleCreateDriver}
            className="bg-blue-600 text-white border-none px-5 py-3 rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-2 shadow-blue-300 shadow-md whitespace-nowrap hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-blue-400 hover:shadow-lg active:translate-y-0 active:shadow-blue-300 active:shadow-sm"
          >
            <Plus size={16} />
            <span>Agregar conductor</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div className="text-red-700">
            <p className="font-semibold">Error al cargar los datos</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={loadDrivers}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0 first:rounded-tl-xl">ID</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Nombre Completo</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Documento</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Licencia</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Estado</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Vehículo</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0">Teléfono</th>
              <th className="bg-slate-800 text-white font-semibold p-4 text-left whitespace-nowrap sticky top-0 last:rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver, index) => {
                const statusConfig = getStatusConfig(driver.estConductor);
                const fullName = `${driver.nomConductor || ''} ${driver.apeConductor || ''}`.trim();
                const vehicleInfo = driver.vehiculo 
                  ? `${driver.vehiculo.numVehiculo} (${driver.vehiculo.plaVehiculo})`
                  : 'Sin asignar';

                return (
                  <tr key={driver.idConductor} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-slate-100 transition-colors`}>
                    <td className="p-4 border-t border-slate-200">{driver.idConductor}</td>
                    <td className="p-4 border-t border-slate-200 font-semibold text-slate-800">
                      {fullName || 'Sin nombre'}
                    </td>
                    <td className="p-4 border-t border-slate-200">{driver.numDocConductor || 'N/A'}</td>
                    <td className="p-4 border-t border-slate-200">
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.tipLicConductor || 'N/A'}</span>
                        <span className="text-xs text-slate-500">
                          Vence: {formatDate(driver.fecVenLicConductor)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-t border-slate-200">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium gap-1.5 ${statusConfig.badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig.indicatorClass} shadow-sm`}></span>
                        {statusConfig.displayText}
                      </span>
                    </td>
                    <td className="p-4 border-t border-slate-200">{vehicleInfo}</td>
                    <td className="p-4 border-t border-slate-200">{driver.telConductor || 'N/A'}</td>
                    <td className="p-4 border-t border-slate-200 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewDriver(driver)}
                        className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer mr-1.5 transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-blue-600 hover:border-blue-600" 
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditDriver(driver)}
                        className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer mr-1.5 transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-orange-500 hover:border-orange-500" 
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleSendMessage(driver)}
                        className="bg-white border border-slate-200 w-8 h-8 rounded-md cursor-pointer transition-all inline-flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5 hover:text-green-600 hover:border-green-600" 
                        title="Enviar mensaje"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-500 italic border-t border-slate-200">
                  {searchTerm ? 'No se encontraron conductores que coincidan con la búsqueda' : 'No hay conductores registrados'}
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
            <span className="text-sm text-slate-500">Total:</span>
            <span className="font-semibold text-slate-800">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Activos:</span>
            <span className="font-semibold text-green-600">{stats.activos}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Inactivos:</span>
            <span className="font-semibold text-red-600">{stats.inactivos}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">En descanso:</span>
            <span className="font-semibold text-blue-600">{stats.descanso}</span>
          </div>
          {(stats.incapacitados > 0 || stats.vacaciones > 0) && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Incapacitados:</span>
                <span className="font-semibold text-orange-600">{stats.incapacitados}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">De vacaciones:</span>
                <span className="font-semibold text-purple-600">{stats.vacaciones}</span>
              </div>
            </>
          )}
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
            Página {currentPage} de {totalPages || 1} ({filteredDrivers.length} conductor{filteredDrivers.length !== 1 ? 'es' : ''})
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