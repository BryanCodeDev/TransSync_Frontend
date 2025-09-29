// src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaCog, FaUserShield, FaEdit, FaTrash } from 'react-icons/fa';
import { getUserRole } from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// Eliminar dependencias problemáticas para evitar errores de chunks
// import { useNotification } from '../utilidades/notificationService';
// import { useSocket } from '../utilidades/realTimeService';

// ====================================================================
// COMPONENTE SIMPLIFICADO - SIN FORMULARIO DE EDICIÓN
// ====================================================================

// ====================================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD - VERSIÓN SIMPLIFICADA
// ====================================================================
const AdminDashboard = () => {
   const { t } = useTranslation();
   const { theme } = useTheme();
   const [usuarios, setUsuarios] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
     const role = getUserRole();
     if (role === 'SUPERADMIN') {
       loadUsers();
     } else {
       setLoading(false);
       setError('No tienes permisos para acceder a este módulo');
     }
   }, []);

   const loadUsers = async () => {
     setLoading(true);
     try {
       const data = await adminAPI.getUsers();
       setUsuarios(data || []);
       setError('');
     } catch (err) {
       console.error('Error cargando usuarios:', err);
       setError('Error al cargar la lista de usuarios');
       toast.error('No se pudo cargar la lista de usuarios');
     } finally {
       setLoading(false);
     }
   };

   const formatRole = (role) => {
     const roles = {
       'SUPERADMIN': 'Super Admin',
       'GESTOR': 'Gestor',
       'CONDUCTOR': 'Conductor'
     };
     return roles[role] || role;
   };

   if (loading) {
     return (
       <div className={`p-8 min-h-screen text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
         <p>{t('adminDashboard.messages.loading') || 'Cargando dashboard...'}</p>
       </div>
     );
   }

   if (error) {
     return (
       <div className={`p-8 min-h-screen text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
         <div className="text-red-500 mb-4">⚠️</div>
         <h2 className="text-xl font-semibold mb-2">{t('adminDashboard.messages.errorTitle') || 'Error de Acceso'}</h2>
         <p className="mb-4">{error}</p>
         <button
           onClick={loadUsers}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         >
           {t('adminDashboard.messages.retry') || 'Reintentar'}
         </button>
       </div>
     );
   }

   const stats = {
     total: usuarios.length,
     gestores: usuarios.filter(u => u.rol === 'GESTOR').length,
     conductores: usuarios.filter(u => u.rol === 'CONDUCTOR').length,
     activos: usuarios.filter(u => u.estActivo).length,
   };

   return (
     <div className={`p-4 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
       <h1 className="text-2xl font-bold mb-2">{t('adminDashboard.title') || 'Panel de Administración'}</h1>
       <p className="mb-6 text-gray-600 dark:text-gray-400">{t('adminDashboard.subtitle') || 'Gestión de usuarios del sistema'}</p>

       {/* Estadísticas */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
           <div className="flex items-center">
             <FaUsers className="text-blue-500 mr-3" size={20} />
             <div>
               <h3 className="text-2xl font-bold">{stats.total}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.stats.totalUsers') || 'Total Usuarios'}</p>
             </div>
           </div>
         </div>

         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
           <div className="flex items-center">
             <FaUserShield className="text-green-500 mr-3" size={20} />
             <div>
               <h3 className="text-2xl font-bold">{stats.gestores}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.stats.managers') || 'Gestores'}</p>
             </div>
           </div>
         </div>

         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
           <div className="flex items-center">
             <FaCog className="text-yellow-500 mr-3" size={20} />
             <div>
               <h3 className="text-2xl font-bold">{stats.conductores}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.stats.drivers') || 'Conductores'}</p>
             </div>
           </div>
         </div>

         <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
           <div className="flex items-center">
             <div className="text-green-500 mr-3 text-xl">✅</div>
             <div>
               <h3 className="text-2xl font-bold">{stats.activos}</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminDashboard.stats.active') || 'Activos'}</p>
             </div>
           </div>
         </div>
       </div>

       {/* Tabla de usuarios */}
       <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
         <table className="w-full">
           <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
             <tr>
               <th className="px-4 py-3 text-left">Nombre</th>
               <th className="px-4 py-3 text-left">Email</th>
               <th className="px-4 py-3 text-left">Documento</th>
               <th className="px-4 py-3 text-left">Rol</th>
               <th className="px-4 py-3 text-left">Estado</th>
               <th className="px-4 py-3 text-left">Acciones</th>
             </tr>
           </thead>
           <tbody>
             {usuarios.length > 0 ? (
               usuarios.map((user) => (
                 <tr key={user.idUsuario} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                   <td className="px-4 py-3">{user.nomUsuario} {user.apeUsuario}</td>
                   <td className="px-4 py-3">{user.email}</td>
                   <td className="px-4 py-3">{user.numDocUsuario}</td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-xs ${
                       user.rol === 'GESTOR'
                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                         : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                     }`}>
                       {formatRole(user.rol)}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-xs ${
                       user.estActivo
                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                         : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                     }`}>
                       {user.estActivo ? 'Activo' : 'Inactivo'}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <button className="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                       <FaEdit size={16} />
                     </button>
                     <button className="text-red-600 hover:text-red-800" title="Eliminar">
                       <FaTrash size={16} />
                     </button>
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                   <div className="text-4xl mb-2">👥</div>
                   <p>No se encontraron usuarios</p>
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
     </div>
   );
};

export default AdminDashboard;