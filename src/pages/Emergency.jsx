const Emergency = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Emergencias</h1>
      <p className="text-lg text-gray-700 text-center">
        Presiona el botón de emergencia en caso de incidentes.
      </p>
      <button className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-800 transition">
        🚨 Enviar Alerta
      </button>
    </div>
  );
};

export default Emergency;
