import React, { useState } from "react";
import "../styles/drivers.css";

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const drivers = [
    { id: 1, name: "Carlos Pérez", status: "En ruta", vehicle: "Bus 42", route: "Centro - Norte", lastActive: "Hace 5 min" },
    { id: 2, name: "María Gómez", status: "Disponible", vehicle: "Bus 18", route: "Este - Oeste", lastActive: "Hace 2 min" },
    { id: 3, name: "Juan Rodríguez", status: "Fuera de servicio", vehicle: "Bus 27", route: "Sur - Centro", lastActive: "Hace 3 horas" },
    { id: 4, name: "Ana López", status: "En ruta", vehicle: "Bus 15", route: "Norte - Sur", lastActive: "Hace 12 min" },
    { id: 5, name: "Roberto Díaz", status: "Disponible", vehicle: "Bus 31", route: "Circular", lastActive: "Hace 1 min" },
  ];

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case "En ruta": return "🟢";
      case "Disponible": return "🔵";
      case "Fuera de servicio": return "🔴";
      default: return "⚪";
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
              placeholder="Buscar conductor..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="add-driver-btn">+ Agregar conductor</button>
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
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.id}</td>
                  <td className="driver-name">{driver.name}</td>
                  <td>
                    <span className={`status-badge status-${driver.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {getStatusIcon(driver.status)} {driver.status}
                    </span>
                  </td>
                  <td>{driver.vehicle}</td>
                  <td>{driver.route}</td>
                  <td>{driver.lastActive}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" title="Ver detalles">👁️</button>
                    <button className="action-btn edit-btn" title="Editar">✏️</button>
                    <button className="action-btn message-btn" title="Enviar mensaje">💬</button>
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
          <button className="pagination-btn">« Anterior</button>
          <span className="page-indicator">Página 1 de 1</span>
          <button className="pagination-btn">Siguiente »</button>
        </div>
      </div>
    </div>
  );
};

export default Drivers;