import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCog, 
  FaUserShield,
  FaChartBar,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye
} from 'react-icons/fa';
import { getCurrentUser, getUserRole } from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [administradores, setAdministradores] = useState([]);
  const [filteredAdministradores, setFilteredAdministradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getCurrentUser();
    const role = getUserRole();
    
    if (userData) {
      setUser(userData);
      setUserRole(role);
    }

    if (role === 'SUPERADMIN') {
      loadAdministradores();
    } else {
      setLoading(false);
    }
  }, []);

  // Filtrar administradores por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = administradores.filter(admin =>
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.nomAdministrador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.apeAdministrador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.numDocAdministrador?.includes(searchTerm)
      );
      setFilteredAdministradores(filtered);
    } else {
      setFilteredAdministradores(administradores);
    }
  }, [searchTerm, administradores]);

  const loadAdministradores = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdministrators();
      setAdministradores(response.administradores || []);
      setError('');
    } catch (error) {
      console.error('Error loading administradores:', error);
      setError('Error al cargar la lista de administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (idUsuario) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
      try {
        await adminAPI.deleteAdministrator(idUsuario);
        await loadAdministradores();
        alert('Administrador eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando administrador:', error);
        alert('Error al eliminar administrador');
      }
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const formatRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'PENDIENTE': 'Pendiente'
    };
    return roles[role] || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = administradores.length;
    const administradorCount = administradores.filter(a => a.rol === 'ADMINISTRADOR').length;
    const pendienteCount = administradores.filter(a => a.rol === 'PENDIENTE').length;
    const activosCount = administradores.filter(a => a.estActivo).length;

    return { total, administradorCount, pendienteCount, activosCount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bienvenido, {user?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Panel de control - {formatRole(userRole)} • {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 dark:from-blue-900 dark:to-blue-700 dark:text-blue-300">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-600 dark:from-green-900 dark:to-green-700 dark:text-green-300">
                <FaUserShield className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Administradores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.administradorCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-600 dark:from-yellow-900 dark:to-yellow-700 dark:text-yellow-300">
                <FaCog className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pendienteCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 dark:from-purple-900 dark:to-purple-700 dark:text-purple-300">
                <FaChartBar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.activosCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Administradores Table - Solo para SUPERADMIN */}
        {userRole === 'SUPERADMIN' && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Gestión de Administradores
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar administradores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2 font-medium">
                    <FaPlus className="h-4 w-4" />
                    <span>Nuevo Administrador</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {error ? (
                <div className="px-6 py-8 text-center">
                  <div className="text-red-600 mb-2">{error}</div>
                  <button 
                    onClick={loadAdministradores}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              ) : filteredAdministradores.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron administradores' : 'No hay administradores registrados'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAdministradores.map((admin) => (
                      <tr key={admin.idUsuario} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {admin.email?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {admin.nomAdministrador && admin.apeAdministrador 
                                  ? `${admin.nomAdministrador} ${admin.apeAdministrador}`
                                  : admin.email
                                }
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {admin.email}
                              </div>
                              {admin.numDocAdministrador && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  Doc: {admin.numDocAdministrador}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            admin.rol === 'ADMINISTRADOR' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : admin.rol === 'SUPERADMIN'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {formatRole(admin.rol)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            admin.estActivo 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {admin.estActivo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {admin.idEmpresa ? `Empresa ${admin.idEmpresa}` : 'Sin asignar'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditAdmin(admin)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                              title="Ver detalles"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAdmin(admin)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                              title="Editar"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            {admin.rol !== 'SUPERADMIN' && (
                              <button 
                                onClick={() => handleDeleteAdmin(admin.idUsuario)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                                title="Eliminar"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Mensaje para administradores normales */}
        {userRole === 'ADMINISTRADOR' && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full flex items-center justify-center mb-4">
                <FaUserShield className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Panel de Administrador
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Bienvenido al panel de administrador. Aquí podrás gestionar las funciones 
                disponibles para tu rol y supervisar las operaciones del sistema.
              </p>
              <div className="mt-6 space-x-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium"
                >
                  Ir al Dashboard
                </button>
                <button 
                  onClick={() => navigate('/drivers')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Gestionar Conductores
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver/editar administrador */}
        {showModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Detalles del Administrador
                </h3>
                <div className="space-y-3">
                  <p className="text-sm"><span className="font-medium">Nombre:</span> {selectedAdmin.nomAdministrador} {selectedAdmin.apeAdministrador}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedAdmin.email}</p>
                  <p className="text-sm"><span className="font-medium">Documento:</span> {selectedAdmin.numDocAdministrador || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Rol:</span> {formatRole(selectedAdmin.rol)}</p>
                  <p className="text-sm"><span className="font-medium">Estado:</span> {selectedAdmin.estActivo ? 'Activo' : 'Inactivo'}</p>
                  <p className="text-sm"><span className="font-medium">Empresa:</span> {selectedAdmin.idEmpresa || 'No asignada'}</p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      navigate(`/admin/${selectedAdmin.idUsuario}/edit`);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
