import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FaQuestionCircle
} from 'react-icons/fa';
import { isAuthenticated, getCurrentUser, getUserRole, logout } from '../utilidades/authAPI';

const Navbar = ({ toggleSidebar, isMobile, isPublic = false }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obtener datos del usuario actual
  useEffect(() => {
    if (!isPublic && isAuthenticated()) {
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
    }
  }, [isPublic]);

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        await logout();
        navigate("/home");
        setIsUserMenuOpen(false);
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.clear();
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
        return 'bg-purple-100 text-purple-800';
      case 'ADMINISTRADOR':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
        : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Menu button for mobile when authenticated */}
            {!isPublic && isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 group"
                aria-label="Toggle menu"
              >
                <FaBars size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}
            
            {/* Logo and brand - Mejorado */}
            <Link to="/home" className="flex items-center gap-3 no-underline group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a237e] to-[#3949ab] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="text-white font-bold text-lg">T</div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1a237e] to-[#3949ab] rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-[#1a237e] to-[#3949ab] bg-clip-text text-transparent group-hover:from-[#283593] group-hover:to-[#1a237e] transition-all duration-300">
                  TransSync
                </span>
                <span className="text-xs text-gray-500 -mt-1 opacity-80">
                  Transport Management
                </span>
              </div>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {isPublic || !isAuthenticated() ? (
              /* Public navigation buttons - Mejorados */
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1a237e] hover:text-[#3949ab] border border-[#1a237e]/20 hover:border-[#3949ab]/40 rounded-xl transition-all duration-200 hover:bg-[#1a237e]/5 hover:shadow-sm group"
                >
                  <FaSignInAlt size={14} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
                <button 
                  onClick={handleRegister}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#1a237e] to-[#3949ab] hover:from-[#283593] hover:to-[#1a237e] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 group"
                >
                  <FaUserCircle size={14} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:inline">Registrarse</span>
                </button>
              </div>
            ) : (
              /* Authenticated user section - Mejorado */
              <div className="flex items-center gap-3">
                {/* Notification button */}
                <button className="relative p-2.5 text-gray-600 hover:text-[#3949ab] hover:bg-gray-100/80 rounded-xl transition-all duration-200 group">
                  <FaBell size={16} className="group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-md">
                    3
                  </div>
                </button>

                {/* Help button */}
                <button className="p-2.5 text-gray-600 hover:text-[#3949ab] hover:bg-gray-100/80 rounded-xl transition-all duration-200 group">
                  <FaQuestionCircle size={16} className="group-hover:scale-110 transition-transform duration-200" />
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group border border-transparent hover:border-gray-200/50"
                    aria-label="User menu"
                  >
                    {/* Avatar mejorado */}
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md ring-2 ring-white group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
                        <span className="text-white font-bold text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    
                    {/* User info - mejorada */}
                    <div className="hidden md:flex flex-col items-start min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px] group-hover:text-[#1a237e] transition-colors duration-200" title={getDisplayName()}>
                        {getDisplayName()}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>
                          {formatUserRole(userRole)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Dropdown arrow */}
                    <FaChevronDown 
                      size={12} 
                      className={`text-gray-400 transition-all duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#3949ab]' : ''} group-hover:text-gray-600`} 
                    />
                  </button>

                  {/* Dropdown menu mejorado */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200/60 py-2 z-50 backdrop-blur-sm">
                      {/* User info header mejorado */}
                      <div className="px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md`}>
                            {getUserRoleIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate" title={getDisplayName()}>
                              {getDisplayName()}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={currentUser?.email}>
                              {currentUser?.email}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>
                                {formatUserRole(userRole)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu items mejorados */}
                      <div className="py-2">
                        <button 
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#1a237e] transition-all duration-200 group"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            console.log('Navigate to profile');
                          }}
                        >
                          <FaUser className="text-gray-400 group-hover:text-[#3949ab] transition-colors duration-200" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Mi Perfil</span>
                            <span className="text-xs text-gray-500">Ver y editar información personal</span>
                          </div>
                        </button>
                        
                        <button 
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#1a237e] transition-all duration-200 group"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            console.log('Navigate to settings');
                          }}
                        >
                          <FaCog className="text-gray-400 group-hover:text-[#3949ab] transition-colors duration-200" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Configuración</span>
                            <span className="text-xs text-gray-500">Preferencias y ajustes</span>
                          </div>
                        </button>
                        
                        <div className="border-t border-gray-100 my-2" />
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200 group"
                        >
                          <FaSignOutAlt className="text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Cerrar Sesión</span>
                            <span className="text-xs text-red-400">Salir de la cuenta</span>
                          </div>
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