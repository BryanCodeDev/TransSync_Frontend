import React, { useState, useEffect, useCallback } from 'react';
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
  Timer,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  X
} from 'lucide-react';
import viajesAPI from '../utilidades/viajesAPI';
import vehiculosAPI from '../utilidades/vehiculosAPI';
import { apiClient } from '../api/baseAPI';

const Horarios = () => {
  const [viajes, setViajes] = useState([]);
  const [filteredViajes, setFilteredViajes] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  
  const [filtroRuta, setFiltroRuta] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState(null);
  
  // Formularios
  const [newViaje, setNewViaje] = useState({
    idVehiculo: '',
    idConductor: '',
    idRuta: '',
    fecHorSalViaje: '',
    fecHorLleViaje: '',
    estViaje: 'PROGRAMADO',
    obsViaje: ''
  });
  
  const [editViaje, setEditViaje] = useState({});

  const estadosViaje = [
    { value: 'PROGRAMADO', label: 'Programado', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'EN_CURSO', label: 'En Curso', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'FINALIZADO', label: 'Finalizado', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-200' }
  ];

  // Filtrar viajes
  const filterViajes = useCallback(() => {
    let results = viajes;
    
    if (filtroRuta) {
      const search = filtroRuta.toLowerCase();
      results = results.filter(v => 
        v.nomRuta?.toLowerCase().includes(search) ||
        v.oriRuta?.toLowerCase().includes(search) ||
        v.desRuta?.toLowerCase().includes(search) ||
        v.plaVehiculo?.toLowerCase().includes(search) ||
        `${v.nomConductor} ${v.apeConductor}`.toLowerCase().includes(search)
      );
    }
    
    if (filtroEstado !== 'todos') {
      results = results.filter(v => v.estViaje === filtroEstado);
    }
    
    setFilteredViajes(results);
  }, [filtroRuta, filtroEstado, viajes]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar cuando cambien los filtros
  useEffect(() => {
    filterViajes();
  }, [filterViajes]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar viajes
      const viajesData = await viajesAPI.getAll();
      setViajes(Array.isArray(viajesData) ? viajesData : []);

      // Cargar vehículos para selects
      try {
        const vehiculosData = await vehiculosAPI.getForSelect();
        setVehiculosDisponibles(Array.isArray(vehiculosData) ? vehiculosData : []);
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
        setVehiculosDisponibles([]);
      }

      // Cargar conductores disponibles
      try {
        const conductoresResponse = await apiClient.get('/api/conductores/disponibles');
        setConductoresDisponibles(conductoresResponse.data.conductoresDisponibles || []);
      } catch (error) {
        console.error('Error al cargar conductores:', error);
        setConductoresDisponibles([]);
      }

      // Cargar rutas disponibles
      try {
        const rutasResponse = await apiClient.get('/api/rutas');
        setRutasDisponibles(rutasResponse.data || []);
      } catch (error) {
        console.error('Error al cargar rutas:', error);
        setRutasDisponibles([]);
      }

      setError('');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los viajes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddViaje = async () => {
    try {
      setError('');
      
      // Validaciones básicas
      if (!newViaje.idVehiculo || !newViaje.idConductor || !newViaje.idRuta || !newViaje.fecHorSalViaje) {
        setError('Por favor, completa todos los campos requeridos.');
        return;
      }

      await viajesAPI.create(newViaje);
      
      // Recargar datos
      await loadInitialData();
      
      // Cerrar modal y resetear formulario
      setShowAddModal(false);
      resetNewViaje();
      
    } catch (error) {
      console.error('Error al crear viaje:', error);
      setError(error.message || 'Error al crear el viaje');
    }
  };

  const handleEditViaje = async () => {
    try {
      setError('');
      
      await viajesAPI.update(selectedViaje.idViaje, editViaje);
      
      // Recargar datos
      await loadInitialData();
      
      // Cerrar modal
      setShowEditModal(false);
      setSelectedViaje(null);
      setEditViaje({});
      
    } catch (error) {
      console.error('Error al actualizar viaje:', error);
      setError(error.message || 'Error al actualizar el viaje');
    }
  };

  const handleDeleteViaje = async (viaje) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el viaje ${viaje.nomRuta}?`)) {
      return;
    }

    try {
      setError('');
      await viajesAPI.delete(viaje.idViaje);
      
      // Recargar datos
      await loadInitialData();
      
    } catch (error) {
      console.error('Error al eliminar viaje:', error);
      setError(error.message || 'Error al eliminar el viaje');
    }
  };

  const handleChangeStatus = async (viaje, nuevoEstado) => {
    try {
      setError('');
      await viajesAPI.changeStatus(viaje.idViaje, nuevoEstado);
      
      // Recargar datos
      await loadInitialData();
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError(error.message || 'Error al cambiar el estado del viaje');
    }
  };

  const openEditModal = (viaje) => {
    setSelectedViaje(viaje);
    setEditViaje({
      idVehiculo: viaje.idVehiculo,
      idConductor: viaje.idConductor,
      idRuta: viaje.idRuta,
      fecHorSalViaje: viaje.fecHorSalViaje ? viaje.fecHorSalViaje.slice(0, 16) : '',
      fecHorLleViaje: viaje.fecHorLleViaje ? viaje.fecHorLleViaje.slice(0, 16) : '',
      estViaje: viaje.estViaje,
      obsViaje: viaje.obsViaje || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (viaje) => {
    setSelectedViaje(viaje);
    setShowViewModal(true);
  };

  const resetNewViaje = () => {
    setNewViaje({
      idVehiculo: '',
      idConductor: '',
      idRuta: '',
      fecHorSalViaje: '',
      fecHorLleViaje: '',
      estViaje: 'PROGRAMADO',
      obsViaje: ''
    });
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedViaje(null);
    setEditViaje({});
    setError('');
  };

  const getStatusConfig = (estatus) => {
    const estado = estadosViaje.find(e => e.value === estatus);
    if (estado) {
      return {
        className: estado.color,
        icon: estatus === 'PROGRAMADO' ? <Clock className="w-3 h-3" /> :
              estatus === 'EN_CURSO' ? <Play className="w-3 h-3" /> :
              estatus === 'FINALIZADO' ? <Square className="w-3 h-3" /> :
              <AlertTriangle className="w-3 h-3" />
      };
    }
    return {
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: <Square className="w-3 h-3" />
    };
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'No especificada';
    return new Date(dateTimeString).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
        <div className="flex justify-between items-center mb-6 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 m-0">
            <Clock className="text-indigo-600 w-7 h-7" />
            Gestión de Viajes
          </h2>
          
          <div className="flex gap-3 md:w-auto w-full">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-green-600 md:flex-1 flex-1 justify-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4" />
              Nuevo Viaje
            </button>
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
              placeholder="Buscar por ruta, vehículo o conductor" 
              className="border-none bg-transparent w-full text-sm text-gray-800 outline-none placeholder-gray-500"
              value={filtroRuta}
              onChange={(e) => setFiltroRuta(e.target.value)}
            />
          </div>
          
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <select 
              className="border-none bg-transparent text-sm text-gray-800 outline-none cursor-pointer"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              {estadosViaje.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
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
                    Vehículo
                  </div>
                </th>
                <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Conductor
                  </div>
                </th>
                <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Salida
                  </div>
                </th>
                <th className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold p-4 text-left border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Llegada
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
              {filteredViajes.map((viaje, index) => {
                const statusConfig = getStatusConfig(viaje.estViaje);
                return (
                  <tr key={viaje.idViaje} className={`transition-colors duration-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">{viaje.nomRuta}</div>
                      <div className="text-sm text-gray-500">{viaje.oriRuta} → {viaje.desRuta}</div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-indigo-600">{viaje.plaVehiculo}</div>
                      <div className="text-sm text-gray-500">{viaje.marVehiculo} {viaje.modVehiculo}</div>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-700">
                      <div className="font-medium">{viaje.nomConductor} {viaje.apeConductor}</div>
                      <div className="text-sm text-gray-500">{viaje.numDocConductor}</div>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      {formatDateTime(viaje.fecHorSalViaje)}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      {formatDateTime(viaje.fecHorLleViaje)}
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                          {statusConfig.icon}
                          {viajesAPI.getStatusLabel(viaje.estViaje)}
                        </span>
                        <select 
                          value={viaje.estViaje}
                          onChange={(e) => handleChangeStatus(viaje, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          title="Cambiar estado"
                        >
                          {estadosViaje.map(estado => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openViewModal(viaje)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200" 
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(viaje)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteViaje(viaje)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredViajes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Clock className="text-gray-400 text-6xl mb-4 mx-auto" />
            <p className="text-gray-500 text-lg">No se encontraron viajes</p>
            {filtroRuta && (
              <p className="text-gray-400 text-sm">
                Intenta con otros términos de búsqueda o cambia los filtros
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-indigo-600" />
            <p>Total de viajes: <span className="font-semibold text-gray-900">{filteredViajes.length}</span></p>
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

      {/* Modal para agregar viaje */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Programar Nuevo Viaje</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Ruta *</label>
                <select 
                  value={newViaje.idRuta} 
                  onChange={(e) => setNewViaje({...newViaje, idRuta: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar ruta</option>
                  {rutasDisponibles.map(ruta => (
                    <option key={ruta.idRuta} value={ruta.idRuta}>
                      {ruta.nomRuta} - {ruta.oriRuta} → {ruta.desRuta}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Vehículo *</label>
                <select 
                  value={newViaje.idVehiculo} 
                  onChange={(e) => setNewViaje({...newViaje, idVehiculo: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiculosDisponibles.map(vehiculo => (
                    <option key={vehiculo.idVehiculo} value={vehiculo.idVehiculo}>
                      {vehiculo.placaVehiculo} - {vehiculo.modeloVehiculo}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Conductor *</label>
                <select 
                  value={newViaje.idConductor} 
                  onChange={(e) => setNewViaje({...newViaje, idConductor: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar conductor</option>
                  {conductoresDisponibles.map(conductor => (
                    <option key={conductor.idConductor} value={conductor.idConductor}>
                      {conductor.nomConductor} {conductor.apeConductor} - {conductor.numDocConductor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Fecha y Hora Salida *</label>
                <input 
                  type="datetime-local" 
                  value={newViaje.fecHorSalViaje} 
                  onChange={(e) => setNewViaje({...newViaje, fecHorSalViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Fecha y Hora Llegada</label>
                <input 
                  type="datetime-local" 
                  value={newViaje.fecHorLleViaje} 
                  onChange={(e) => setNewViaje({...newViaje, fecHorLleViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Estado</label>
                <select 
                  value={newViaje.estViaje} 
                  onChange={(e) => setNewViaje({...newViaje, estViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {estadosViaje.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col mb-6">
              <label className="text-sm font-semibold text-slate-500 mb-2">Observaciones</label>
              <textarea 
                value={newViaje.obsViaje} 
                onChange={(e) => setNewViaje({...newViaje, obsViaje: e.target.value})}
                className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                rows="3"
                placeholder="Observaciones adicionales del viaje..."
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-slate-800 border-none hover:bg-gray-300" 
                onClick={closeAllModals}
              >
                Cancelar
              </button>
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-green-500 text-white border-none hover:bg-green-600" 
                onClick={handleAddViaje}
              >
                Programar Viaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar viaje */}
      {showEditModal && selectedViaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">
                Editar Viaje - {selectedViaje.nomRuta}
              </h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Ruta *</label>
                <select 
                  value={editViaje.idRuta || ''} 
                  onChange={(e) => setEditViaje({...editViaje, idRuta: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar ruta</option>
                  {rutasDisponibles.map(ruta => (
                    <option key={ruta.idRuta} value={ruta.idRuta}>
                      {ruta.nomRuta} - {ruta.oriRuta} → {ruta.desRuta}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Vehículo *</label>
                <select 
                  value={editViaje.idVehiculo || ''} 
                  onChange={(e) => setEditViaje({...editViaje, idVehiculo: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiculosDisponibles.map(vehiculo => (
                    <option key={vehiculo.idVehiculo} value={vehiculo.idVehiculo}>
                      {vehiculo.placaVehiculo} - {vehiculo.modeloVehiculo}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Conductor *</label>
                <select 
                  value={editViaje.idConductor || ''} 
                  onChange={(e) => setEditViaje({...editViaje, idConductor: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">Seleccionar conductor</option>
                  {conductoresDisponibles.map(conductor => (
                    <option key={conductor.idConductor} value={conductor.idConductor}>
                      {conductor.nomConductor} {conductor.apeConductor} - {conductor.numDocConductor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Fecha y Hora Salida *</label>
                <input 
                  type="datetime-local" 
                  value={editViaje.fecHorSalViaje || ''} 
                  onChange={(e) => setEditViaje({...editViaje, fecHorSalViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Fecha y Hora Llegada</label>
                <input 
                  type="datetime-local" 
                  value={editViaje.fecHorLleViaje || ''} 
                  onChange={(e) => setEditViaje({...editViaje, fecHorLleViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 mb-2">Estado</label>
                <select 
                  value={editViaje.estViaje || ''} 
                  onChange={(e) => setEditViaje({...editViaje, estViaje: e.target.value})}
                  className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {estadosViaje.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col mb-6">
              <label className="text-sm font-semibold text-slate-500 mb-2">Observaciones</label>
              <textarea 
                value={editViaje.obsViaje || ''} 
                onChange={(e) => setEditViaje({...editViaje, obsViaje: e.target.value})}
                className="py-3 px-3 rounded-md border border-gray-300 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                rows="3"
                placeholder="Observaciones adicionales del viaje..."
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-slate-800 border-none hover:bg-gray-300" 
                onClick={closeAllModals}
              >
                Cancelar
              </button>
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-blue-500 text-white border-none hover:bg-blue-600" 
                onClick={handleEditViaje}
              >
                Actualizar Viaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del viaje */}
      {showViewModal && selectedViaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Detalles del Viaje
              </h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Información de la ruta */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Información de la Ruta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nombre</label>
                    <p className="text-sm text-slate-800 font-medium">{selectedViaje.nomRuta}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Origen</label>
                    <p className="text-sm text-slate-800">{selectedViaje.oriRuta}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Destino</label>
                    <p className="text-sm text-slate-800">{selectedViaje.desRuta}</p>
                  </div>
                </div>
              </div>

              {/* Información del vehículo */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  Información del Vehículo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Placa</label>
                    <p className="text-sm text-slate-800 font-medium">{selectedViaje.plaVehiculo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Marca</label>
                    <p className="text-sm text-slate-800">{selectedViaje.marVehiculo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Modelo</label>
                    <p className="text-sm text-slate-800">{selectedViaje.modVehiculo}</p>
                  </div>
                </div>
              </div>

              {/* Información del conductor */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Conductor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nombre Completo</label>
                    <p className="text-sm text-slate-800 font-medium">
                      {selectedViaje.nomConductor} {selectedViaje.apeConductor}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Documento</label>
                    <p className="text-sm text-slate-800">{selectedViaje.numDocConductor}</p>
                  </div>
                </div>
              </div>

              {/* Información del viaje */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Información del Viaje
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Fecha y Hora de Salida</label>
                    <p className="text-sm text-slate-800 font-medium">
                      {formatDateTime(selectedViaje.fecHorSalViaje)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Fecha y Hora de Llegada</label>
                    <p className="text-sm text-slate-800">
                      {formatDateTime(selectedViaje.fecHorLleViaje)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Estado</label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const statusConfig = getStatusConfig(selectedViaje.estViaje);
                        return (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                            {statusConfig.icon}
                            {viajesAPI.getStatusLabel(selectedViaje.estViaje)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Duración Estimada</label>
                    <p className="text-sm text-slate-800">
                      {viajesAPI.calculateDuration(selectedViaje.fecHorSalViaje, selectedViaje.fecHorLleViaje) || 'No calculada'}
                    </p>
                  </div>
                </div>
                
                {selectedViaje.obsViaje && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-600">Observaciones</label>
                    <p className="text-sm text-slate-800 mt-1 p-3 bg-white rounded border">
                      {selectedViaje.obsViaje}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-slate-800 border-none hover:bg-gray-300" 
                onClick={closeAllModals}
              >
                Cerrar
              </button>
              <button 
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-blue-500 text-white border-none hover:bg-blue-600" 
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedViaje);
                }}
              >
                Editar Viaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;