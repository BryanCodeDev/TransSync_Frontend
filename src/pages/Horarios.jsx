import { FaClock } from "react-icons/fa";

const Horarios = () => {
  const horarios = [
    { id: 1, ruta: "101", salida: "06:00 AM", llegada: "10:00 PM" },
    { id: 2, ruta: "202", salida: "05:30 AM", llegada: "11:30 PM" },
  ];

  return (
    <div className="horarios-container">
      <h2 className="title"><FaClock /> Horarios de Servicio</h2>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Salida</th>
            <th>Llegada</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map((h) => (
            <tr key={h.id}>
              <td>{h.ruta}</td>
              <td>{h.salida}</td>
              <td>{h.llegada}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Horarios;
