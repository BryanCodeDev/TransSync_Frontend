import { useState, useEffect } from 'react';
import { FaBus, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import '../styles/vehiculos.css';

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
    <div className="vehiculos-container">
      <div className="vehiculos-header">
        <h2 className="title"><FaBus /> Flota de Vehículos</h2>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{vehiculos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{vehiculos.filter(v => v.disponible).length}</span>
            <span className="stat-label">Disponibles</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{vehiculos.filter(v => !v.disponible).length}</span>
            <span className="stat-label">No Disponibles</span>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por placa, modelo o conductor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los vehículos</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">No disponibles</option>
          </select>
        </div>

        <button className="add-vehicle-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Agregar Vehículo
        </button>
      </div>

      <div className="vehicles-grid">
        {filteredVehiculos.map((vehiculo) => (
          <div key={vehiculo.id} className="vehicle-card">
            <div className="vehicle-header">
              <h3>{vehiculo.modelo}</h3>
              <span className={`vehicle-status ${vehiculo.disponible ? "available" : "not-available"}`}>
                {vehiculo.disponible ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{vehiculo.disponible ? "Disponible" : "No disponible"}</span>
              </span>
            </div>
            <div className="vehicle-details">
              <div className="detail-row">
                <span className="detail-label">Placa:</span>
                <span className="detail-value">{vehiculo.placa}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Año:</span>
                <span className="detail-value">{vehiculo.año}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Capacidad:</span>
                <span className="detail-value">{vehiculo.capacidad} pasajeros</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Conductor:</span>
                <span className="detail-value">{vehiculo.conductor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ruta:</span>
                <span className="detail-value">{vehiculo.ruta}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className="detail-value">{vehiculo.estado}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Último mantenimiento:</span>
                <span className="detail-value">{vehiculo.ultimoMantenimiento}</span>
              </div>
            </div>
            <div className="vehicle-actions">
              <button className="edit-btn">Editar</button>
              <button className="detail-btn">Ver detalles</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-vehicle-modal">
            <h3>Agregar Nuevo Vehículo</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Placa</label>
                <input 
                  type="text" 
                  name="placa" 
                  value={newVehiculo.placa} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input 
                  type="text" 
                  name="modelo" 
                  value={newVehiculo.modelo} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Año</label>
                <input 
                  type="number" 
                  name="año" 
                  value={newVehiculo.año} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Capacidad</label>
                <input 
                  type="number" 
                  name="capacidad" 
                  value={newVehiculo.capacidad} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Conductor</label>
                <input 
                  type="text" 
                  name="conductor" 
                  value={newVehiculo.conductor} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Ruta</label>
                <input 
                  type="text" 
                  name="ruta" 
                  value={newVehiculo.ruta} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Último Mantenimiento</label>
                <input 
                  type="date" 
                  name="ultimoMantenimiento" 
                  value={newVehiculo.ultimoMantenimiento} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select 
                  name="estado" 
                  value={newVehiculo.estado} 
                  onChange={handleInputChange}
                >
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="En revisión">En revisión</option>
                </select>
              </div>
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="disponible" 
                name="disponible" 
                checked={newVehiculo.disponible} 
                onChange={handleInputChange} 
              />
              <label htmlFor="disponible">Disponible para operación</label>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="save-btn" onClick={handleAddVehiculo}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehiculos;