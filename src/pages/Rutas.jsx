import { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

const Rutas = () => {
  const [search, setSearch] = useState("");

  const rutas = [
    { id: 1, nombre: "Ruta 101", origen: "Centro", destino: "Norte", horario: "06:00 - 22:00" },
    { id: 2, nombre: "Ruta 202", origen: "Sur", destino: "Centro", horario: "05:30 - 23:00" },
  ];

  const filteredRutas = rutas.filter((ruta) =>
    ruta.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Gestión de Rutas</h2>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar ruta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-button">
          <FaPlus /> Agregar Ruta
        </button>
      </div>

      <table className="routes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Horario</th>
          </tr>
        </thead>
        <tbody>
          {filteredRutas.map((ruta) => (
            <tr key={ruta.id}>
              <td>{ruta.nombre}</td>
              <td>{ruta.origen}</td>
              <td>{ruta.destino}</td>
              <td>{ruta.horario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rutas;
