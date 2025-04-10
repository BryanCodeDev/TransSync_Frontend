import React, { useState } from 'react';
import { Clock, Search, Filter, Download, Truck, Map } from 'lucide-react';
import "../styles/horarios.css";

const Horarios = () => {
  const [filtroRuta, setFiltroRuta] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('todos');
  
  const horarios = [
    { id: 1, ruta: "101", nombre: "Centro - Norte", salida: "06:00 AM", llegada: "10:00 PM", frecuencia: "15 min", estatus: "Activo" },
    { id: 2, ruta: "202", nombre: "Terminal - Oeste", salida: "05:30 AM", llegada: "11:30 PM", frecuencia: "20 min", estatus: "Activo" },
    { id: 3, ruta: "305", nombre: "Aeropuerto - Centro", salida: "04:45 AM", llegada: "11:00 PM", frecuencia: "30 min", estatus: "Activo" },
    { id: 4, ruta: "118", nombre: "Norte - Sur Express", salida: "06:30 AM", llegada: "09:30 PM", frecuencia: "25 min", estatus: "Reducido" },
    { id: 5, ruta: "250", nombre: "Terminal - Este", salida: "05:00 AM", llegada: "10:45 PM", frecuencia: "15 min", estatus: "Activo" },
  ];

  const filtrarHorarios = () => {
    return horarios.filter(h => {
      const coincideRuta = h.ruta.toLowerCase().includes(filtroRuta.toLowerCase()) || 
                           h.nombre.toLowerCase().includes(filtroRuta.toLowerCase());
      
      if (filtroHorario === 'todos') return coincideRuta;
      if (filtroHorario === 'manana' && h.salida.includes('AM')) return coincideRuta;
      if (filtroHorario === 'tarde' && h.salida.includes('PM')) return coincideRuta;
      return false;
    });
  };

  const getStatusClass = (estatus) => {
    switch(estatus) {
      case 'Activo': return 'status-active';
      case 'Reducido': return 'status-reduced';
      case 'Suspendido': return 'status-suspended';
      default: return '';
    }
  };

  return (
    <div className="horarios-container">
      <div className="header-container">
        <h2 className="title">
          <Clock className="title-icon" />
          Horarios de Servicio
        </h2>
        
        <div className="actions-container">
          <button className="action-button">
            <Map size={16} />
            Ver mapa
          </button>
          <button className="action-button">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por ruta o nombre" 
            className="search-input"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} className="filter-icon" />
          <select 
            className="filter-select"
            value={filtroHorario}
            onChange={(e) => setFiltroHorario(e.target.value)}
          >
            <option value="todos">Todos los horarios</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Nombre</th>
              <th>Hora Salida</th>
              <th>Hora Llegada</th>
              <th>Frecuencia</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarHorarios().map((h) => (
              <tr key={h.id} className="table-row">
                <td className="route-number">{h.ruta}</td>
                <td>{h.nombre}</td>
                <td>{h.salida}</td>
                <td>{h.llegada}</td>
                <td>{h.frecuencia}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(h.estatus)}`}>
                    {h.estatus}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-button" title="Ver detalles">
                      <Truck size={16} />
                    </button>
                    <button className="icon-button" title="Ver en mapa">
                      <Map size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="schedule-footer">
        <p>Total de rutas: {filtrarHorarios().length}</p>
        <div className="pagination">
          <button className="pagination-button">Anterior</button>
          <span className="pagination-info">Página 1 de 1</span>
          <button className="pagination-button">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default Horarios;