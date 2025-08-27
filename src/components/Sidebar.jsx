import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaUserShield, FaCogs, FaUser
} from "react-icons/fa";
import { getCurrentUser, getUserRole, logout } from '../utilidades/authAPI';

const Sidebar = ({ isOpen, toggleSidebar, onOverlayClick, isMobile: isMobileProp }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDeviceType = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    if (isMobileProp !== undefined) {
      setIsMobile(isMobileProp);
      setIsTablet(false);
    } else {
      checkDeviceType();
      window.addEventListener('resize', checkDeviceType);
      return () => window.removeEventListener('resize', checkDeviceType);
    }
  }, [isMobileProp]);

  // Obtener datos del usuario actual
  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = getCurrentUser();
        const role = getUserRole();
        
        setCurrentUser(user);
        setUserRole(role);
      } catch (error) {
        console.error('Error loading user data:', error);
        setCurrentUser(null);
        setUserRole('');
      }
    };

    loadUserData();
  }, []);

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if ((isMobile || isTablet) && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile, isTablet, isOpen]);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        await logout();
        navigate("/home");
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.clear();
        navigate("/home");
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOverlayClick) {
      onOverlayClick();
    } else {
      toggleSidebar();
    }
  };

  // Manejo mejorado del cierre del menú al hacer clic en links
  const handleLinkClick = (e) => {
    // En móvil y tablet: cerrar inmediatamente
    if (isMobile || isTablet) {
      // Cerrar inmediatamente sin delay
      setTimeout(() => {
        toggleSidebar();
      }, 100); // Delay mínimo para permitir la navegación
    }
    // En desktop: no hacer nada, mantener el sidebar abierto
  };

  const formatUserRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'CONDUCTOR': 'Conductor',
      'USER': 'Usuario',
      'PENDIENTE': 'Usuario Pendiente'
    };
    return roles[role] || role || 'Usuario';
  };

  const getUserInitials = () => {
    if (currentUser?.name) {
      return currentUser.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (currentUser?.name) {
      return currentUser.name;
    } else if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getAvatarGradient = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'from-purple-500 to-purple-700';
      case 'ADMINISTRADOR':
        return 'from-[#3949ab] to-[#1a237e]';
      case 'CONDUCTOR':
        return 'from-green-500 to-green-700';
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
        return <FaUserShield size={20} className="text-white" />;
      case 'ADMINISTRADOR':
        return <FaCogs size={20} className="text-white" />;
      case 'CONDUCTOR':
        return <FaUserTie size={20} className="text-white" />;
      default:
        return <FaUser size={20} className="text-white" />;
    }
  };

  // FUNCIÓN PARA VERIFICAR PERMISOS POR ROL
  const hasPermissionForRoute = (path) => {
    if (!userRole) return false;

    const rolePermissions = {
      'SUPERADMIN': [
        '/dashboard',
        '/admin/dashboard', // Solo SUPERADMIN tiene acceso
        '/drivers',
        '/rutas',
        '/vehiculos',
        '/horarios',
        '/emergency',
        '/informes'
      ],
      'ADMINISTRADOR': [
        '/dashboard',
        // NO incluye '/admin/dashboard'
        '/drivers',
        '/rutas',
        '/vehiculos',
        '/horarios',
        '/emergency',
        '/informes'
      ],
      'CONDUCTOR': [
        // Solo puede ver algunas secciones básicas
      ],
      'USER': [
        // Sin acceso a las funciones principales
      ],
      'PENDIENTE': [
        // Sin acceso hasta ser aprobado
      ]
    };

    return rolePermissions[userRole]?.includes(path) || false;
  };

  // DEFINICIÓN DE MENÚ CON CONTROL DE ROLES
  const allMenuItems = [
    { 
      path: "/dashboard", 
      icon: <FaChartLine />, 
      label: "Dashboard",
      description: "Panel principal"
    },
    { 
      path: "/admin/dashboard", 
      icon: <FaCogs />, 
      label: "Admin Dashboard",
      description: "Panel de administración",
      superAdminOnly: true
    },
    { 
      path: "/drivers", 
      icon: <FaUserTie />, 
      label: "Conductores",
      description: "Gestión de conductores"
    },
    { 
      path: "/rutas", 
      icon: <FaRoute />, 
      label: "Rutas",
      description: "Gestión de rutas"
    },
    { 
      path: "/vehiculos", 
      icon: <FaBus />, 
      label: "Vehículos",
      description: "Gestión de vehículos"
    }, 
    { 
      path: "/horarios", 
      icon: <FaClock />, 
      label: "Horarios",
      description: "Gestión de horarios"
    }, 
    { 
      path: "/emergency", 
      icon: <FaExclamationTriangle />, 
      label: "Emergencias",
      description: "Centro de emergencias"
    },
    { 
      path: "/informes", 
      icon: <FaFileAlt />, 
      label: "Informes",
      description: "Reportes y estadísticas"
    },
  ];

  // FILTRAR MENÚ SEGÚN PERMISOS
  const menuItems = allMenuItems.filter(item => hasPermissionForRoute(item.path));

  // COMPONENTE PARA MOSTRAR ACCESO RESTRINGIDO
  const RestrictedAccessMessage = () => {
    if (userRole === 'CONDUCTOR') {
      return (
        <div className="p-4 text-center">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <FaUserTie className="mx-auto text-green-400 text-2xl mb-2" />
            <p className="text-green-200 text-sm">
              Acceso de Conductor
            </p>
            <p className="text-green-300/70 text-xs mt-1">
              Panel en desarrollo
            </p>
          </div>
        </div>
      );
    }

    if (userRole === 'PENDIENTE' || userRole === 'USER') {
      return (
        <div className="p-4 text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <FaUser className="mx-auto text-yellow-400 text-2xl mb-2" />
            <p className="text-yellow-200 text-sm">
              {userRole === 'PENDIENTE' ? 'Cuenta Pendiente' : 'Usuario Sin Permisos'}
            </p>
            <p className="text-yellow-300/70 text-xs mt-1">
              {userRole === 'PENDIENTE' 
                ? 'Esperando aprobación del administrador'
                : 'Contacte al administrador para obtener permisos'
              }
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Overlay para móvil y tablet */}
      {isOpen && (isMobile || isTablet) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] backdrop-blur-sm"
          onClick={handleOverlayClick}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-16 h-[calc(100vh-64px)] z-[999]
          bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab]
          shadow-2xl text-white
          flex flex-col
          transition-all duration-300 ease-in-out
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:pointer-events-none
          ${isMobile || isTablet
            ? `w-[280px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : `${isOpen ? 'w-[280px]' : 'w-[70px]'} translate-x-0`
          }
        `}
      >
        {/* Header del sidebar */}
        <div className="relative p-4 border-b border-white/20 min-h-[70px] flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.svg`} 
                alt="Logo TransSync" 
                className="h-10 w-10 object-contain filter drop-shadow-lg" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-50" />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <div className={`flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent whitespace-nowrap">
                  TransSync
                </span>
                <span className="text-xs text-blue-200 opacity-80">
                  Sistema de Gestión
                </span>
              </div>
            )}
          </div>
          
          {/* Botón toggle solo para desktop */}
          {!isMobile && !isTablet && (
            <button 
              className="bg-white/10 hover:bg-white/20 border-none text-white cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <div className="relative">
                <FaChevronLeft className={`transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}`} />
                <FaChevronRight className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 -rotate-180' : 'opacity-100 rotate-0'}`} />
              </div>
            </button>
          )}
        </div>

        {/* Perfil de usuario */}
        <div className="p-4 border-b border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
                {currentUser ? (
                  <span className="text-white font-bold text-sm">
                    {getUserInitials()}
                  </span>
                ) : (
                  getUserRoleIcon()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <h4 className="text-sm font-semibold text-white truncate" title={getDisplayName()}>
                  {getDisplayName()}
                </h4>
                <p className="text-xs text-blue-200 opacity-80 truncate" title={formatUserRole(userRole)}>
                  {formatUserRole(userRole)}
                </p>
                {currentUser?.email && (
                  <p className="text-xs text-blue-300 opacity-60 truncate mt-0.5" title={currentUser.email}>
                    {currentUser.email}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300">En línea</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" role="navigation">
          {menuItems.length > 0 ? (
            <div className="px-2 space-y-1" role="menu">
              {menuItems.map(({ path, icon, label, description, superAdminOnly }) => {
                const isActive = location.pathname === path;
                
                // Verificación adicional para Admin Dashboard
                if (superAdminOnly && userRole !== 'SUPERADMIN') {
                  return null;
                }

                return (
                  <div key={path} className="relative group">
                    <Link 
                      to={path} 
                      className={`
                        flex items-center text-white no-underline rounded-xl
                        transition-all duration-300 ease-in-out
                        hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg
                        active:scale-[0.98]
                        ${isActive 
                          ? 'bg-white/20 shadow-lg backdrop-blur-sm text-blue-100 font-semibold' 
                          : 'text-white/90 hover:text-white'
                        }
                        ${(isOpen || (!isMobile && !isTablet)) ? 'p-3 justify-start' : 'p-3 justify-center'}
                      `}
                      onClick={handleLinkClick}
                      role="menuitem"
                    >
                      <div className={`
                        flex items-center justify-center text-lg
                        ${(isOpen || (!isMobile && !isTablet)) ? 'w-6 mr-4' : 'w-6'}
                        ${isActive ? 'text-blue-200' : ''}
                      `}>
                        {icon}
                      </div>
                      {(isOpen || (!isMobile && !isTablet)) && (
                        <span className={`text-sm font-medium truncate transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                          {label}
                        </span>
                      )}
                      {superAdminOnly && (isOpen || (!isMobile && !isTablet)) && (
                        <div className="absolute right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      )}
                      {isActive && !superAdminOnly && (isOpen || (!isMobile && !isTablet)) && (
                        <div className="absolute right-2 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                      )}
                    </Link>
                    
                    {/* Tooltip para sidebar colapsado (solo desktop) */}
                    {!isOpen && !isMobile && !isTablet && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a237e] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/20">
                        <div className="font-medium">{label}</div>
                        {description && <div className="text-xs text-blue-200 mt-1">{description}</div>}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a237e]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <RestrictedAccessMessage />
          )}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-white/20 mt-auto backdrop-blur-sm">
          <button 
            onClick={handleLogout} 
            className={`
              bg-gradient-to-r from-[#c62828] to-[#d32f2f] hover:from-[#b71c1c] hover:to-[#c62828]
              text-white border-none rounded-xl cursor-pointer 
              transition-all duration-300 ease-in-out
              text-sm font-medium shadow-lg hover:shadow-xl
              hover:scale-105 active:scale-95
              flex items-center w-full
              ${(isOpen || (!isMobile && !isTablet)) ? 'p-3 justify-start' : 'p-3 justify-center'}
            `}
            title="Cerrar Sesión"
          >
            <div className={`
              flex items-center justify-center
              ${(isOpen || (!isMobile && !isTablet)) ? 'mr-3' : ''}
            `}>
              <FaSignOutAlt />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <span className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                Cerrar Sesión
              </span>
            )}
          </button>
          
          {(isOpen || (!isMobile && !isTablet)) && (
            <div className={`mt-4 text-center transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-xs text-blue-200 opacity-75 mb-1">
                &copy; {new Date().getFullYear()} TransSync
              </p>
              <p className="text-xs text-blue-300 opacity-60">
                v2.0.1 - {formatUserRole(userRole)}
              </p>
              {userRole && (
                <div className={`mt-2 px-2 py-1 rounded-full text-xs ${
                  userRole === 'SUPERADMIN' ? 'bg-purple-500/20 text-purple-200' :
                  userRole === 'ADMINISTRADOR' ? 'bg-blue-500/20 text-blue-200' :
                  userRole === 'CONDUCTOR' ? 'bg-green-500/20 text-green-200' :
                  'bg-yellow-500/20 text-yellow-200'
                }`}>
                  {userRole}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;