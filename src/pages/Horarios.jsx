import React, { useState } from 'react';
import { Clock, Search, Filter, Download, Truck, Map } from 'lucide-react';

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
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Reducido': return 'bg-yellow-100 text-yellow-800';
      case 'Suspendido': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm m-6">
      <div className="flex justify-between items-center mb-6 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
        <h2 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
          <Clock className="text-blue-600" />
          Horarios de Servicio
        </h2>
        
        <div className="flex gap-3 md:w-auto w-full">
          <button className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-100 md:flex-1 flex-1 justify-center">
            <Map size={16} />
            Ver mapa
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-100 md:flex-1 flex-1 justify-center">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 md:flex-row flex-col">
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2 flex-grow">
          <Search size={18} className="text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por ruta o nombre" 
            className="border-none bg-transparent w-full text-sm text-gray-800 outline-none"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
          <Filter size={18} className="text-gray-500 mr-2" />
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

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full border-collapse text-sm text-left">
          <thead>
            <tr>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Ruta</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Nombre</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Hora Salida</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Hora Llegada</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Frecuencia</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Estatus</th>
              <th className="bg-gray-50 text-gray-600 font-medium p-3 border-b border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarHorarios().map((h) => (
              <tr key={h.id} className="transition-colors duration-200 hover:bg-gray-50">
                <td className="p-3 border-b border-gray-300 text-gray-700 font-semibold text-blue-600">{h.ruta}</td>
                <td className="p-3 border-b border-gray-300 text-gray-700">{h.nombre}</td>
                <td className="p-3 border-b border-gray-300 text-gray-700">{h.salida}</td>
                <td className="p-3 border-b border-gray-300 text-gray-700">{h.llegada}</td>
                <td className="p-3 border-b border-gray-300 text-gray-700">{h.frecuencia}</td>
                <td className="p-3 border-b border-gray-300 text-gray-700">
                  <span className={`inline-flex px-2 py-1 rounded-xl text-xs font-medium ${getStatusClass(h.estatus)}`}>
                    {h.estatus}
                  </span>
                </td>
                <td className="p-3 border-b border-gray-300 text-gray-700">
                  <div className="flex gap-2">
                    <button className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200" title="Ver detalles">
                      <Truck size={16} />
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200" title="Ver en mapa">
                      <Map size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <p>Total de rutas: {filtrarHorarios().length}</p>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400">Anterior</button>
          <span className="text-gray-500">Página 1 de 1</span>
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default Horarios;