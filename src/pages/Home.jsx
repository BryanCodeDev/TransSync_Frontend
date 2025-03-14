import React from 'react';
import { ArrowRight, Bus, Clock, Shield } from 'lucide-react';
import "../styles/home.css";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-700 mb-4">TransSync</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            La plataforma integral para la gestión y optimización del transporte público moderno
          </p>
        </div>
        
        <div className="flex space-x-4 mb-12">
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center">
            Comenzar ahora
            <ArrowRight className="ml-2" size={18} />
          </button>
          <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition">
            Ver demostración
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Soluciones de clase mundial</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 rounded-xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Bus size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestión de flota</h3>
              <p className="text-gray-600">
                Monitoreo de vehículos en tiempo real para una operación optimizada y eficiente.
              </p>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Clock size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Programación inteligente</h3>
              <p className="text-gray-600">
                Algoritmos predictivos que mejoran la puntualidad y reducen el tiempo de espera.
              </p>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Shield size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad avanzada</h3>
              <p className="text-gray-600">
                Protección de datos y sistemas de vigilancia para la seguridad de pasajeros y conductores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;