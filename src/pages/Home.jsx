const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenido a TransSync</h1>
      <p className="text-lg text-gray-700 max-w-lg text-center">
        Gestiona y optimiza las operaciones de transporte público de manera eficiente y segura.
      </p>
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
        Empezar
      </button>
    </div>
  );
};

export default Home;
