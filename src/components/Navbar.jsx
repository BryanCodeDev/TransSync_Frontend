import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaUserShield,
  FaCogs,
  FaSignInAlt,
  FaBell,
  FaQuestionCircle,
  FaMoon,
  FaSun,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaBus,
  FaUserTie,
  FaHome,
  FaChartLine
} from 'react-icons/fa';
import { getUserRole } from '../utilidades/authAPI';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ toggleSidebar, isMobile, isPublic = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, userRole, logout: handleLogoutAuth, loading: authLoading } = useAuth();
  const { theme, toggleTheme: toggleThemeContext } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (!isPublic && isLoggedIn) {
      loadNotifications();
    }
  }, [isPublic, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simular notificaciones en tiempo real (cada 30 segundos)
  useEffect(() => {
    if (!isPublic && isLoggedIn) {
      const interval = setInterval(() => {
        // Simular nuevas notificaciones
        const randomNotifications = [
          {
            id: Date.now() + Math.random(),
            type: 'alert',
            title: 'Vehículo requiere mantenimiento',
            message: 'El vehículo ABC-123 necesita revisión técnica',
            time: new Date(),
            read: false,
            icon: <FaBus className="text-blue-500" />
          },
          {
            id: Date.now() + Math.random() + 1,
            type: 'warning',
            title: 'Licencia por vencer',
            message: 'La licencia del conductor Juan Pérez vence en 15 días',
            time: new Date(),
            read: false,
            icon: <FaExclamationTriangle className="text-orange-500" />
          },
          {
            id: Date.now() + Math.random() + 2,
            type: 'success',
            title: 'Viaje completado',
            message: 'El viaje de la ruta Norte-Sur ha sido completado exitosamente',
            time: new Date(),
            read: false,
            icon: <FaCheckCircle className="text-green-500" />
          }
        ];

        // Agregar una notificación aleatoria cada cierto tiempo
        if (Math.random() > 0.7) {
          const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
          setNotifications(prev => [randomNotif, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isPublic, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        await handleLogoutAuth();
        navigate("/home");
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      } catch (error) {
        console.error('Error during logout:', error);
        // El hook useAuth ya maneja el logout local
        navigate("/home");
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
    setIsNotificationsOpen(false); // Cerrar notificaciones si están abiertas
  };

  const toggleTheme = () => {
    toggleThemeContext();
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    setIsUserMenuOpen(false); // Cerrar menú de usuario si está abierto
  };

  // Función para navegar al dashboard
  const goToDashboard = () => {
    const userRole = getUserRole();
    if (userRole === "SUPERADMIN" || userRole === "ADMINISTRADOR") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Función para navegar al home
  const goToHome = () => {
    navigate("/home", { replace: true });
  };


  // Cargar notificaciones iniciales
  const loadNotifications = () => {
    // Notificaciones de ejemplo
    const sampleNotifications = [
      {
        id: 1,
        type: 'alert',
        title: 'Sistema actualizado',
        message: 'TransSync ha sido actualizado a la versión 2.1.0',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        read: false,
        icon: <FaCheckCircle className="text-green-500" />
      },
      {
        id: 2,
        type: 'warning',
        title: 'Mantenimiento programado',
        message: 'Mantenimiento del sistema programado para mañana a las 2:00 AM',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        read: false,
        icon: <FaExclamationTriangle className="text-orange-500" />
      },
      {
        id: 3,
        type: 'info',
        title: 'Nuevo conductor registrado',
        message: 'Carlos Rodríguez se ha registrado como conductor',
        time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
        read: true,
        icon: <FaUserTie className="text-blue-500" />
      },
      {
        id: 4,
        type: 'success',
        title: 'Backup completado',
        message: 'El backup automático de la base de datos se completó exitosamente',
        time: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
        read: true,
        icon: <FaCheckCircle className="text-green-500" />
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  };

  // Marcar notificación como leída
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Eliminar notificación
  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  // Formatear tiempo relativo
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const formatUserRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'USER': 'Usuario',
      'PENDIENTE': 'Usuario Pendiente'
    };
    return roles[role] || role || 'Usuario';
  };

  const getAvatarGradient = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'from-purple-500 to-purple-700';
      case 'ADMINISTRADOR':
        return 'from-[#3949ab] to-[#1a237e]';
      case 'USER':
        return 'from-[#283593] to-[#1a237e]';
      case 'PENDIENTE':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-[#3949ab] to-[#283593]';
    }
  };

  const getUserRoleIcon = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return <FaUserShield size={14} className="text-white" />;
      case 'ADMINISTRADOR':
        return <FaCogs size={14} className="text-white" />;
      default:
        return <FaUser size={14} className="text-white" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ADMINISTRADOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl shadow-lg border-b border-border-light/50 dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Verificando sesión...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isScrolled
        ? 'bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl shadow-lg border-b border-border-light/50 dark:border-border-dark'
        : 'bg-gradient-to-r from-background-light/95 via-primary-50/30 to-primary-100/20 dark:from-background-dark/90 dark:via-surface-dark/90 dark:to-background-dark/90 backdrop-blur-md shadow-sm border-b border-border-light/30 dark:border-border-dark'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {!isPublic && isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-white hover:bg-primary-50/80 dark:hover:bg-surface-dark/50 transition-all duration-200 group border border-transparent hover:border-primary-200/50 dark:hover:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                aria-label="Abrir menú de navegación"
                aria-expanded={false}
                aria-controls="sidebar-navigation"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSidebar();
                  }
                }}
              >
                <FaBars size={18} className="group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
              </button>
            )}
            
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 no-underline group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a237e] to-[#3949ab] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="text-white font-bold text-lg">T</div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-800 dark:to-primary-700 bg-clip-text text-transparent">TransSync</span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark -mt-1 opacity-80">Transport Management</span>
              </div>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group border border-transparent hover:border-indigo-200/50 dark:hover:border-gray-600"
              title={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {theme === "dark" ? (
                <FaSun size={16} className="text-amber-500 group-hover:text-amber-600" />
              ) : (
                <FaMoon size={16} className="text-indigo-600 group-hover:text-indigo-700" />
              )}
            </button>

            {/* Botones de navegación inteligente */}
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                {location.pathname === '/home' && (
                  <button
                    onClick={goToDashboard}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-transparent"
                    title="Ir al Panel de Control"
                  >
                    <FaChartLine size={14} />
                    <span className="hidden sm:inline">Panel de Control</span>
                  </button>
                )}

                {(location.pathname === '/dashboard' || location.pathname.startsWith('/admin')) && (
                  <button
                    onClick={goToHome}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-gray-200 border border-indigo-200 dark:border-gray-600 rounded-xl transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:border-indigo-300 hover:scale-105"
                    title="Ir al Inicio"
                  >
                    <FaHome size={14} />
                    <span className="hidden sm:inline">Ir a Home</span>
                  </button>
                )}
              </div>
            )}

            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-gray-200 border border-indigo-200 dark:border-gray-600 rounded-xl transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:border-indigo-300">
                  <FaSignInAlt size={14} />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
                <button onClick={handleRegister} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-[#1a237e] dark:to-[#3949ab] rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <FaUserCircle size={14} />
                  <span className="hidden sm:inline">Registrarse</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2.5 text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-indigo-200/50 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    title="Notificaciones"
                    aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : '(sin notificaciones nuevas)'}`}
                    aria-expanded={isNotificationsOpen}
                    aria-controls="notifications-dropdown"
                    aria-haspopup="true"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleNotifications();
                      }
                    }}
                  >
                    <FaBell size={16} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-md animate-pulse"
                        aria-label={`${unreadCount} notificaciones sin leer`}
                        role="status"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                   {isNotificationsOpen && (
                     <div
                       id="notifications-dropdown"
                       className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
                       role="dialog"
                       aria-modal="true"
                       aria-labelledby="notifications-title"
                     >
                      {/* Header */}
                       <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                         <h3 id="notifications-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                           Notificaciones
                           {unreadCount > 0 && (
                             <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" aria-label={`${unreadCount} notificaciones sin leer`}>
                               {unreadCount}
                             </span>
                           )}
                         </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                      <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded"
                                        title="Eliminar notificación"
                                      >
                                        <FaTimes size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                      {formatTimeAgo(notification.time)}
                                    </span>
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                      >
                                        Marcar como leída
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <FaBell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No hay notificaciones
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="p-2.5 text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-indigo-200/50 dark:hover:border-gray-600">
                  <FaQuestionCircle size={16} />
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 group border border-transparent hover:border-indigo-200/50 dark:hover:border-gray-700"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md ring-2 ring-white`}>
                        <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-start min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{getDisplayName()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>{formatUserRole(userRole)}</span>
                    </div>
                    <FaChevronDown size={12} className={`text-gray-400 dark:text-gray-300 ${isUserMenuOpen ? 'rotate-180 text-[#3949ab]' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md`}>
                            {getUserRoleIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{getDisplayName()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FaUser />
                          <span>Mi Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FaCog />
                          <span>Configuración</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
                          <FaSignOutAlt />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
