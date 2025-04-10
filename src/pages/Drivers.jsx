import React, { useState } from "react";
import { Search, Plus, Eye, Edit, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/drivers.css";

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

  const getStatusClass = (status) => {
    switch(status) {
      case "En ruta": return "status-en-ruta";
      case "Disponible": return "status-disponible";
      case "Fuera de servicio": return "status-fuera-de-servicio";
      default: return "";
    }
  };

  return (
    <div className="drivers-container">
      <div className="drivers-header">
        <h2 className="drivers-title">Conductores</h2>
        <p className="drivers-subtitle">Panel de gestión de conductores de transporte público</p>
        
        <div className="drivers-actions">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar por nombre, estado, vehículo o ruta..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon" size={18} />
          </div>
          <button className="add-driver-btn">
            <Plus size={16} />
            <span>Agregar conductor</span>
          </button>
        </div>
      </div>

      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Vehículo</th>
              <th>Ruta</th>
              <th>Última actividad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.id}</td>
                  <td className="driver-name">{driver.name}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(driver.status)}`}>
                      <span className="status-indicator"></span>
                      {driver.status}
                    </span>
                  </td>
                  <td>{driver.vehicle}</td>
                  <td>{driver.route}</td>
                  <td>{driver.lastActive}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" title="Ver detalles">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn edit-btn" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button className="action-btn message-btn" title="Enviar mensaje">
                      <MessageSquare size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">No se encontraron conductores</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="drivers-footer">
        <div className="drivers-stats">
          <div className="stat-item">
            <span className="stat-label">Total conductores:</span>
            <span className="stat-value">{drivers.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En ruta:</span>
            <span className="stat-value">{drivers.filter(d => d.status === "En ruta").length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Disponibles:</span>
            <span className="stat-value">{drivers.filter(d => d.status === "Disponible").length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Fuera de servicio:</span>
            <span className="stat-value">{drivers.filter(d => d.status === "Fuera de servicio").length}</span>
          </div>
        </div>
        <div className="pagination">
          <button 
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          <span className="page-indicator">Página {currentPage} de {totalPages || 1}</span>
          <button 
            className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
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