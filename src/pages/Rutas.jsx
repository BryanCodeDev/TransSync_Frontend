import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const Rutas = () => {
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

  return (
    <div className="rutas-container">
      <div className="rutas-header">
        <div className="rutas-title-section">
          <h2 className="rutas-title">Gestión de Rutas</h2>
          <span className="rutas-subtitle">Sistema de Transporte Público de Colombia</span>
        </div>

        <div className="rutas-controls">
          <div className="rutas-search-bar">
            <FaSearch className="rutas-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, origen o destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rutas-search-input"
            />
          </div>
          
          <button className="rutas-add-button" onClick={handleAdd}>
            <FaPlus /> Agregar Ruta
          </button>
        </div>
      </div>

      <div className="rutas-stats">
        <div className="rutas-stat-card">
          <div className="rutas-stat-value">{rutas.length}</div>
          <div className="rutas-stat-label">Total Rutas</div>
        </div>
        <div className="rutas-stat-card">
          <div className="rutas-stat-value">
            {rutas.filter(r => r.estado === "Activa").length}
          </div>
          <div className="rutas-stat-label">Rutas Activas</div>
        </div>
        <div className="rutas-stat-card">
          <div className="rutas-stat-value">
            {rutas.reduce((acc, curr) => acc + curr.vehiculosAsignados, 0)}
          </div>
          <div className="rutas-stat-label">Vehículos Asignados</div>
        </div>
      </div>

      <div className="rutas-table-container">
        <table className="rutas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Horario</th>
              <th>Frecuencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRutas.map((ruta) => (
              <tr key={ruta.id} className={`ruta-row ${ruta.estado !== "Activa" ? "ruta-inactive" : ""}`}>
                <td className="ruta-nombre">{ruta.nombre}</td>
                <td>
                  <div className="ruta-ubicacion">
                    <FaMapMarkerAlt className="ruta-icon-origen" />
                    {ruta.origen}
                  </div>
                </td>
                <td>
                  <div className="ruta-ubicacion">
                    <FaMapMarkerAlt className="ruta-icon-destino" />
                    {ruta.destino}
                  </div>
                </td>
                <td>
                  <div className="ruta-horario">
                    <FaClock className="ruta-icon-horario" />
                    {ruta.horario}
                  </div>
                </td>
                <td>{ruta.frecuencia}</td>
                <td>
                  <span className={`ruta-estado ruta-estado-${ruta.estado.toLowerCase()}`}>
                    {ruta.estado}
                  </span>
                </td>
                <td>
                  <div className="ruta-acciones">
                    <button className="ruta-edit-btn" onClick={() => handleEdit(ruta)}>
                      <FaEdit />
                    </button>
                    <button className="ruta-delete-btn">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para añadir/editar ruta */}
      {showModal && (
        <div className="ruta-modal-overlay">
          <div className="ruta-modal">
            <h3>{currentRuta ? "Editar Ruta" : "Agregar Nueva Ruta"}</h3>
            <form className="ruta-form">
              <div className="ruta-form-group">
                <label>Nombre de la Ruta</label>
                <input 
                  type="text" 
                  defaultValue={currentRuta?.nombre || ""}
                  placeholder="Ej: Ruta 101"
                />
              </div>
              <div className="ruta-form-row">
                <div className="ruta-form-group">
                  <label>Origen</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.origen || ""}
                    placeholder="Ej: Centro"
                  />
                </div>
                <div className="ruta-form-group">
                  <label>Destino</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.destino || ""}
                    placeholder="Ej: Norte"
                  />
                </div>
              </div>
              <div className="ruta-form-row">
                <div className="ruta-form-group">
                  <label>Horario</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.horario || ""}
                    placeholder="Ej: 06:00 - 22:00"
                  />
                </div>
                <div className="ruta-form-group">
                  <label>Frecuencia</label>
                  <input 
                    type="text"
                    defaultValue={currentRuta?.frecuencia || ""}
                    placeholder="Ej: Cada 15 min"
                  />
                </div>
              </div>
              <div className="ruta-form-group">
                <label>Estado</label>
                <select defaultValue={currentRuta?.estado || "Activa"}>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div className="ruta-modal-actions">
                <button type="button" className="ruta-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="ruta-btn-save">
                  {currentRuta ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutas;