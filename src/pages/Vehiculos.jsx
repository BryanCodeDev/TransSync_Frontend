import { FaBus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Vehiculos = () => {
  const vehiculos = [
    { id: 1, placa: "ABC-123", modelo: "Mercedes-Benz", disponible: true },
    { id: 2, placa: "XYZ-789", modelo: "Volvo", disponible: false },
  ];

  return (
    <div className="vehiculos-container">
      <h2 className="title"><FaBus /> Flota de Vehículos</h2>

      <div className="vehicles-grid">
        {vehiculos.map((vehiculo) => (
          <div key={vehiculo.id} className="vehicle-card">
            <h3>{vehiculo.modelo}</h3>
            <p>Placa: {vehiculo.placa}</p>
            <div className={vehiculo.disponible ? "available" : "not-available"}>
              {vehiculo.disponible ? <FaCheckCircle /> : <FaTimesCircle />}
              {vehiculo.disponible ? "Disponible" : "No disponible"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehiculos;
