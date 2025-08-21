import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Bus, 
  Map, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Square,
  AlertTriangle,
  Eye,
  Route,
  Timer
} from 'lucide-react';

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

  const getStatusConfig = (estatus) => {
    switch(estatus) {
      case 'Activo': 
        return {
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: <Play className="w-3 h-3" />
        };
      case 'Reducido': 
        return {
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <AlertTriangle className="w-3 h-3" />
        };
      case 'Suspendido': 
        return {
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: <Square className="w-3 h-3" />
        };
      default: 
        return {
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <Square className="w-3 h-3" />
        };
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm m-6">
      <div className="flex justify-between items-center mb-6 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="text-indigo-600 w-7 h-7" />
          Horarios de Servicio
        </h2>
        
        <div className="flex gap-3 md:w-auto w-full">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-100 md:flex-1 flex-1 justify-center">
            <Map className="w-4 h-4" />
            Ver Mapa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-cyan-100 md:flex-1 flex-1 justify-center">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 md:flex-row flex-col">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-grow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por ruta o nombre" 
            className="border-none bg-transparent w-full text-sm text-gray-800 outline-none placeholder-gray-500"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <select 
            className="border-none bg-transparent text-sm text-gray-800 outline-none cursor-pointer"
            value={filtroHorario}
            onChange={(e) => setFiltroHorario(e.target.value)}
          >
            <option value="todos">Todos los horarios</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-indigo-600" />
                  Ruta
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-indigo-600" />
                  Nombre
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hora Salida
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hora Llegada
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-600" />
                  Frecuencia
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                Estado
              </th>
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-center border-b border-gray-200">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrarHorarios().map((h, index) => {
              const statusConfig = getStatusConfig(h.estatus);
              return (
                <tr key={h.id} className={`transition-colors duration-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4 border-b border-gray-200">
                    <div className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block">
                      {h.ruta}
                    </div>
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 font-medium">{h.nombre}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">{h.salida}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">{h.llegada}</td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-sm font-medium">
                      {h.frecuencia}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                      {statusConfig.icon}
                      {h.estatus}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" 
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200" 
                        title="Ver en mapa"
                      >
                        <Map className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Bus className="w-4 h-4 text-indigo-600" />
          <p>Total de rutas: <span className="font-semibold text-gray-900">{filtrarHorarios().length}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300">
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="flex items-center px-3 py-2 text-gray-500 font-medium">
            Página 1 de 1
          </span>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Horarios;