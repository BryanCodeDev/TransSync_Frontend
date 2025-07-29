import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaHome, FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaUserShield, FaBars, FaTimes
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar, onOverlayClick }) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    if (isMobile && isOpen) {
      const timer = setTimeout(() => {
        toggleSidebar();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isMobile, isOpen, toggleSidebar]);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/home", icon: <FaHome />, label: "Inicio" },
    { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/drivers", icon: <FaUserTie />, label: "Conductores" },
    { path: "/rutas", icon: <FaRoute />, label: "Rutas" },
    { path: "/vehiculos", icon: <FaBus />, label: "Vehículos" }, 
    { path: "/horarios", icon: <FaClock />, label: "Horarios" }, 
    { path: "/emergency", icon: <FaExclamationTriangle />, label: "Emergencias" },
    { path: "/informes", icon: <FaFileAlt />, label: "Informes" },
  ];

  return (
    <>
      {/* Botón de menú móvil */}
      <button 
        className={`
          fixed top-4 left-4 z-[1100] 
          bg-gradient-to-r from-[#1a237e] to-[#3949ab]
          text-white border-none rounded-lg 
          w-12 h-12 flex justify-center items-center cursor-pointer 
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          hover:scale-105 active:scale-95
          md:hidden backdrop-blur-sm
          ${isOpen && isMobile ? 'bg-red-600 hover:bg-red-700' : ''}
        `}
        onClick={toggleSidebar}
        aria-label="Toggle mobile menu"
      >
        <div className="relative w-5 h-5">
          <FaBars className={`absolute inset-0 transition-all duration-300 ${isOpen && isMobile ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
          <FaTimes className={`absolute inset-0 transition-all duration-300 ${isOpen && isMobile ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
        </div>
      </button>

      {/* Overlay para cerrar el menú en móvil */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-[998] backdrop-blur-sm transition-opacity duration-300"
          onClick={onOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-[999]
        bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab]
        transition-all duration-300 ease-in-out
        shadow-2xl text-white
        flex flex-col
        ${isMobile 
          ? `w-[300px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `${isOpen ? 'w-[280px]' : 'w-[70px]'} translate-x-0`
        }
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:pointer-events-none
      `}>
        
        {/* Encabezado del sidebar */}
        <div className="relative p-4 border-b border-white/20 min-h-[70px] flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.svg`} 
                alt="Logo TransSync" 
                className="h-10 w-10 object-contain filter drop-shadow-lg" 
              />
              <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-50" />
            </div>
            {(isOpen || isMobile) && (
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent whitespace-nowrap">
                  TransSync
                </span>
                <span className="text-xs text-blue-200 opacity-80">
                  Sistema de Gestión
                </span>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <button 
              className={`
                bg-white/10 hover:bg-white/20 border-none text-white cursor-pointer 
                w-8 h-8 rounded-full flex items-center justify-center 
                transition-all duration-300 ease-in-out
                hover:scale-110 active:scale-95
                backdrop-blur-sm shadow-lg
              `}
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                <FaUserShield size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            {(isOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">Administrador</h4>
                <p className="text-xs text-blue-200 opacity-80 truncate">Sistema TransSync</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300">En línea</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="px-2 space-y-1">
            {menuItems.map(({ path, icon, label }) => {
              const isActive = location.pathname === path;
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
                      ${(isOpen || isMobile) ? 'p-3 justify-start' : 'p-3 justify-center'}
                    `}
                  >
                    <div className={`
                      flex items-center justify-center text-lg
                      ${(isOpen || isMobile) ? 'w-6 mr-4' : 'w-6'}
                      ${isActive ? 'text-blue-200' : ''}
                    `}>
                      {icon}
                    </div>
                    {(isOpen || isMobile) && (
                      <span className="text-sm font-medium truncate">{label}</span>
                    )}
                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                    )}
                  </Link>
                  
                  {/* Tooltip para sidebar colapsado */}
                  {!isOpen && !isMobile && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-white/20 mt-auto backdrop-blur-sm">
          <button 
            onClick={handleLogout} 
            className={`
              bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
              text-white border-none rounded-xl cursor-pointer 
              transition-all duration-300 ease-in-out
              text-sm font-medium shadow-lg hover:shadow-xl
              hover:scale-105 active:scale-95
              flex items-center w-full
              ${(isOpen || isMobile) ? 'p-3 justify-start' : 'p-3 justify-center'}
            `}
            title="Cerrar Sesión"
          >
            <div className={`
              flex items-center justify-center
              ${(isOpen || isMobile) ? 'mr-3' : ''}
            `}>
              <FaSignOutAlt />
            </div>
            {(isOpen || isMobile) && <span>Cerrar Sesión</span>}
          </button>
          
          {(isOpen || isMobile) && (
            <div className="mt-4 text-center">
              <p className="text-xs text-blue-200 opacity-75 mb-1">
                &copy; {new Date().getFullYear()} TransSync
              </p>
              <p className="text-xs text-blue-300 opacity-60">
                v2.0.1 - Profesional
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;