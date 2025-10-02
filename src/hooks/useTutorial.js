import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const STORAGE_USER_KEY = 'transync_tutorial_user_';

export const useTutorial = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, user } = useAuthContext();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Definir los pasos del tutorial según el rol del usuario
  const tutorialSteps = useMemo(() => {
    const baseSteps = {
      welcome: {
        id: 'welcome',
        title: '¡Bienvenido a TransSync!',
        description: 'Te guiaremos por las funcionalidades específicas de tu rol. Comenzaremos explorando el menú lateral.',
        target: null,
        placement: 'center',
        page: null,
        isNavigation: false
      },
      sidebar: {
        id: 'sidebar-intro',
        title: 'Menú de Navegación',
        description: 'Este es el menú lateral donde encontrarás todas las secciones disponibles para tu rol. Cada ícono representa una funcionalidad diferente.',
        target: '#sidebar-navigation',
        placement: 'right',
        page: null,
        isNavigation: false
      },
      profile: {
        id: 'navigate-profile',
        title: 'Acceder a tu Perfil',
        description: 'Haz clic en tu avatar en la parte superior derecha para ver el menú de opciones.',
        target: '[data-tutorial="user-menu"]',
        placement: 'bottom',
        page: null,
        isNavigation: false
      },
      profileMenu: {
        id: 'show-profile-menu',
        title: 'Menú de Usuario',
        description: 'Aquí puedes acceder a tu perfil, cambiar configuraciones y cerrar sesión.',
        target: '[data-tutorial="profile-menu-item"]',
        placement: 'left',
        page: null,
        isNavigation: true,
        navigateTo: '/profile'
      },
      profileSettings: {
        id: 'explain-profile',
        title: 'Configuración de Perfil',
        description: 'Personaliza tu perfil, cambia contraseñas y configura tus preferencias del sistema.',
        target: '[data-tutorial="profile"]',
        placement: 'bottom',
        page: '/profile',
        isNavigation: false
      },
      final: {
        id: 'final-message',
        title: '¡Tutorial Completado!',
        description: 'Has explorado todas las funcionalidades disponibles para tu rol. Ahora puedes usar TransSync con confianza. Si necesitas ayuda, recuerda que tienes disponible el ChatBot inteligente.',
        target: null,
        placement: 'center',
        page: '/profile',
        isNavigation: false
      }
    };

    // Tutorial específico para SUPERADMIN
    if (userRole === 'SUPERADMIN') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-admin-dashboard',
          title: 'Panel de Administración',
          description: 'Como SuperAdmin, accede al panel de administración para gestionar usuarios, empresas y configuración global del sistema.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/admin-dashboard'
        },
        {
          id: 'explain-admin-dashboard',
          title: 'Gestión Completa de Usuarios',
          description: 'Aquí puedes crear nuevos usuarios, asignar roles (SuperAdmin, Gestor, Conductor), editar permisos y gestionar el acceso al sistema completo.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'bottom',
          page: '/admin-dashboard',
          isNavigation: false
        },
        {
          id: 'user-management-actions',
          title: 'Acciones de Usuario',
          description: 'Usa los botones de acción para editar usuarios existentes, cambiar sus roles o eliminar cuentas cuando sea necesario.',
          target: '[data-tutorial="user-actions"]',
          placement: 'left',
          page: '/admin-dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-dashboard',
          title: 'Dashboard General del Sistema',
          description: 'Accede al panel principal para monitorear métricas globales, rendimiento de todas las empresas y estadísticas del sistema completo.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: '/admin-dashboard',
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Panel de Control Global',
          description: 'Visualiza métricas en tiempo real de todas las empresas, conductores activos, rutas operativas y alertas del sistema completo.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'system-monitoring',
          title: 'Monitoreo del Sistema',
          description: 'Supervisa el estado general del sistema, conexiones activas, rendimiento de servidores y métricas de uso en tiempo real.',
          target: '[data-tutorial="system-status"]',
          placement: 'top',
          page: '/dashboard',
          isNavigation: false
        },
        baseSteps.profile,
        baseSteps.profileMenu,
        baseSteps.profileSettings,
        baseSteps.final
      ];
    }

    // Tutorial específico para GESTOR
    if (userRole === 'GESTOR') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-dashboard',
          title: 'Panel de Control Empresarial',
          description: 'Como Gestor, accede al dashboard para monitorear el rendimiento de tu empresa, métricas clave y estado operativo en tiempo real.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Panel de Control Completo',
          description: 'Visualiza métricas específicas de tu empresa: conductores activos, vehículos en operación, rutas activas y alertas importantes del día.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'dashboard-metrics',
          title: 'Métricas Clave',
          description: 'Revisa las tarjetas de métricas para entender rápidamente el estado de tu operación: buses en servicio, viajes completados y alertas pendientes.',
          target: '[data-tutorial="dashboard-metrics"]',
          placement: 'top',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-drivers',
          title: 'Gestión de Conductores',
          description: 'Administra tu equipo de conductores: asigna vehículos, verifica licencias, revisa historial y gestiona permisos del personal.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/drivers'
        },
        {
          id: 'explain-drivers',
          title: 'Panel de Conductores',
          description: 'Aquí puedes ver todos tus conductores, su estado actual, vehículos asignados, fechas de vencimiento de licencias y estadísticas de rendimiento.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: false
        },
        {
          id: 'driver-actions',
          title: 'Acciones con Conductores',
          description: 'Usa las opciones de cada conductor para editar información, cambiar asignaciones de vehículos o gestionar estados laborales.',
          target: '[data-tutorial="driver-actions"]',
          placement: 'left',
          page: '/drivers',
          isNavigation: false
        },
        {
          id: 'navigate-vehicles',
          title: 'Gestión de Flota Vehicular',
          description: 'Controla todos los vehículos de tu empresa: estado operativo, mantenimiento programado, ubicación actual y asignaciones.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: true,
          navigateTo: '/vehiculos'
        },
        {
          id: 'explain-vehicles',
          title: 'Panel de Vehículos',
          description: 'Visualiza tu flota completa con información detallada: placas, modelos, capacidad, estado de mantenimiento y conductores asignados.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: false
        },
        {
          id: 'vehicle-maintenance',
          title: 'Control de Mantenimiento',
          description: 'Gestiona mantenimientos preventivos, revisa historial de servicios y programa mantenimientos para mantener tu flota en óptimas condiciones.',
          target: '[data-tutorial="vehicle-maintenance"]',
          placement: 'bottom',
          page: '/vehiculos',
          isNavigation: false
        },
        {
          id: 'navigate-routes',
          title: 'Sistema de Rutas Inteligente',
          description: 'Crea y administra rutas optimizadas para tu operación, define paradas estratégicas y mejora la eficiencia de tu servicio.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: true,
          navigateTo: '/rutas'
        },
        {
          id: 'explain-routes',
          title: 'Gestión Avanzada de Rutas',
          description: 'Diseña rutas eficientes considerando tráfico, distancia y demanda. Asigna rutas específicas a vehículos y conductores según necesidades.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'route-optimization',
          title: 'Optimización de Rutas',
          description: 'Utiliza herramientas de optimización para reducir tiempos de viaje, minimizar costos de combustible y mejorar la satisfacción del usuario.',
          target: '[data-tutorial="route-optimization"]',
          placement: 'top',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Programación de Horarios',
          description: 'Organiza horarios de manera inteligente: crea turnos, asigna rutas específicas y sincroniza toda tu operación para máxima eficiencia.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Centro de Programación',
          description: 'Gestiona horarios de salida, asigna conductores y vehículos específicos, y mantén toda tu operación perfectamente sincronizada.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-reports',
          title: 'Análisis e Informes',
          description: 'Genera reportes detallados sobre el rendimiento de tu empresa, analiza tendencias y toma decisiones basadas en datos reales.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/informes'
        },
        {
          id: 'explain-reports',
          title: 'Sistema de Analytics',
          description: 'Accede a métricas avanzadas, gráficos de rendimiento, análisis de eficiencia y reportes personalizados para optimizar tu operación.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/informes',
          isNavigation: false
        },
        baseSteps.profile,
        baseSteps.profileMenu,
        baseSteps.profileSettings,
        baseSteps.final
      ];
    }

    // Tutorial específico para CONDUCTOR
    if (userRole === 'CONDUCTOR') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-dashboard',
          title: 'Panel de Control Personal',
          description: 'Como Conductor, accede a tu dashboard personal para ver tus viajes asignados, horarios de trabajo y estadísticas de rendimiento.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Tu Centro de Operaciones',
          description: 'Visualiza tus métricas personales: viajes completados hoy, próximos horarios, rutas asignadas y tu rendimiento general como conductor.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'personal-metrics',
          title: 'Métricas Personales',
          description: 'Revisa tus estadísticas individuales: viajes completados, puntualidad, distancia recorrida y calificaciones de servicio.',
          target: '[data-tutorial="personal-metrics"]',
          placement: 'top',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Gestión de Horarios',
          description: 'Consulta tus horarios de trabajo, rutas asignadas, cambios de turno y programación específica de tus viajes.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Tu Programación Diaria',
          description: 'Aquí encontrarás todos tus viajes programados, rutas específicas asignadas, horarios de salida y llegada, y cambios de último momento.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'schedule-details',
          title: 'Detalles de Viajes',
          description: 'Revisa información detallada de cada viaje: ruta específica, vehículo asignado, pasajeros esperados y notas importantes del supervisor.',
          target: '[data-tutorial="schedule-details"]',
          placement: 'left',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'route-preview',
          title: 'Vista Previa de Rutas',
          description: 'Visualiza el mapa de tu ruta asignada, puntos de parada, tráfico estimado y tiempo de duración para planificar mejor tu viaje.',
          target: '[data-tutorial="route-preview"]',
          placement: 'bottom',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-profile',
          title: 'Perfil y Configuración',
          description: 'Gestiona tu información personal, cambia tu contraseña, actualiza datos de contacto y configura tus preferencias de notificación.',
          target: '[data-tutorial="user-menu"]',
          placement: 'bottom',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'show-profile-menu',
          title: 'Menú Personal',
          description: 'Accede rápidamente a tu información personal, historial de viajes, documentos y configuraciones de cuenta.',
          target: '[data-tutorial="profile-menu-item"]',
          placement: 'left',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/profile'
        },
        {
          id: 'explain-profile',
          title: 'Gestión de Perfil',
          description: 'Mantén actualizada tu información: foto de perfil, datos de contacto, documentos de identificación y certificaciones profesionales.',
          target: '[data-tutorial="profile"]',
          placement: 'bottom',
          page: '/profile',
          isNavigation: false
        },
        {
          id: 'document-management',
          title: 'Gestión de Documentos',
          description: 'Sube y administra tus documentos importantes: licencia de conducir, certificados médicos, credenciales y otros documentos requeridos.',
          target: '[data-tutorial="documents"]',
          placement: 'top',
          page: '/profile',
          isNavigation: false
        },
        {
          id: 'emergency-contact',
          title: 'Contactos de Emergencia',
          description: 'Configura tus contactos de emergencia y números importantes para situaciones críticas durante tus rutas.',
          target: '[data-tutorial="emergency"]',
          placement: 'right',
          page: '/profile',
          isNavigation: false
        },
        baseSteps.final
      ];
    }

    // Tutorial por defecto (para roles desconocidos)
    return [
      baseSteps.welcome,
      baseSteps.sidebar,
      baseSteps.profile,
      baseSteps.profileMenu,
      baseSteps.profileSettings,
      baseSteps.final
    ];
  }, [userRole]);

  // Función para verificar si un elemento existe en el DOM con mejor manejo de errores
  const elementExists = useCallback((selector) => {
    if (!selector) return true; // Para pasos sin target (como welcome)

    try {
      // Manejar diferentes tipos de selectores
      let element = null;

      if (selector.startsWith('#')) {
        // Selector de ID
        element = document.getElementById(selector.substring(1));
      } else if (selector.startsWith('.')) {
        // Selector de clase
        element = document.querySelector(selector);
      } else if (selector.startsWith('[')) {
        // Selector de atributo
        element = document.querySelector(selector);
      } else if (selector.includes(' ')) {
        // Selector complejo
        element = document.querySelector(selector);
      } else {
        // Selector de etiqueta o clase simple
        element = document.querySelector(selector);
      }

      // Verificar si el elemento está visible
      if (element) {
        const style = window.getComputedStyle(element);
        const isVisible = style.display !== 'none' &&
                         style.visibility !== 'hidden' &&
                         element.offsetParent !== null &&
                         style.opacity !== '0';

        return isVisible;
      }

      return false;
    } catch (error) {
      console.warn('Error checking element existence for selector:', selector, error);
      return false;
    }
  }, []);

  // Función para obtener el siguiente paso disponible con mejor manejo de errores
  const getNextAvailableStep = useCallback((startIndex = 0) => {
    console.log('Looking for next available step starting from index:', startIndex);

    for (let i = startIndex; i < tutorialSteps.length; i++) {
      const step = tutorialSteps[i];
      console.log(`Checking step ${i}:`, step.id, 'Target:', step.target, 'Page:', step.page);

      try {
        // Si el paso no tiene página específica o coincide con la página actual
        if (!step.page || location.pathname === step.page) {
          console.log(`Step ${i} matches current page or has no page restriction`);

          // Verificar si el elemento existe y está disponible
          if (elementExists(step.target)) {
            console.log(`Step ${i} element exists and is visible`);
            return i;
          } else {
            console.log(`Step ${i} element does not exist or is not visible`);
          }
        } else {
          console.log(`Step ${i} skipped - page mismatch. Expected: ${step.page}, Current: ${location.pathname}`);
        }
      } catch (error) {
        console.warn(`Error checking step ${i}:`, error);
        // Continuar con el siguiente paso en caso de error
        continue;
      }
    }

    console.log('No more available steps found');
    return -1; // No hay más pasos disponibles
  }, [tutorialSteps, location.pathname, elementExists]);

  // Función para obtener clave específica del usuario
  const getUserSpecificKey = useCallback((key) => {
    if (!user?.id) return key;
    return `${STORAGE_USER_KEY}${user.id}_${key}`;
  }, [user?.id]);

  // Verificar si el usuario ya completó o saltó el tutorial
  useEffect(() => {
    if (!user?.id || !userRole) return;

    const userCompletedKey = getUserSpecificKey('completed');
    const userSkippedKey = getUserSpecificKey('skipped');

    const completed = localStorage.getItem(userCompletedKey) === 'true';
    const skipped = localStorage.getItem(userSkippedKey) === 'true';

    setIsCompleted(completed);
    setIsSkipped(skipped);

    // Solo activar el tutorial automáticamente una vez cuando el usuario inicia sesión por primera vez
    // y está en una página protegida
    if (!completed && !skipped && !isActive && location.pathname !== '/home' && location.pathname !== '/login' && location.pathname !== '/register') {
      // Verificar si es la primera vez que se activa el tutorial para este usuario
      const tutorialStartedKey = getUserSpecificKey('started');
      const tutorialStarted = localStorage.getItem(tutorialStartedKey) === 'true';

      if (!tutorialStarted) {
        // Pequeño delay para que la UI se cargue completamente
        const timer = setTimeout(() => {
          const firstStep = getNextAvailableStep(0);
          if (firstStep !== -1) {
            localStorage.setItem(tutorialStartedKey, 'true');
            setIsActive(true);
            setCurrentStep(firstStep);
          }
        }, 1500); // Delay optimizado para mejor UX
        return () => clearTimeout(timer);
      }
    }
  }, [getNextAvailableStep, isActive, location.pathname, user?.id, userRole, getUserSpecificKey]);

  // Efecto para manejar cambios de página durante el tutorial
  useEffect(() => {
    if (isActive && !isPaused) {
      const currentStepData = tutorialSteps[currentStep];

      // Si es un paso de navegación y acabamos de llegar a la página destino
      if (currentStepData?.isNavigation && currentStepData.navigateTo === location.pathname) {
        // Avanzar automáticamente al siguiente paso (explicación de la página)
        const nextStepIndex = currentStep + 1;
        if (nextStepIndex < tutorialSteps.length) {
          setCurrentStep(nextStepIndex);
        }
        return;
      }

      // Si el paso actual no es válido para la página actual
      if (currentStepData.page && location.pathname !== currentStepData.page) {
        // Buscar el siguiente paso disponible en esta página
        const nextAvailable = getNextAvailableStep(currentStep);
        if (nextAvailable !== -1 && nextAvailable !== currentStep) {
          setCurrentStep(nextAvailable);
        } else {
          // No hay pasos disponibles en esta página, pausar tutorial
          setIsPaused(true);
        }
      } else if (!elementExists(currentStepData.target)) {
        // El elemento no existe, intentar el siguiente paso
        const nextAvailable = getNextAvailableStep(currentStep + 1);
        if (nextAvailable !== -1) {
          setCurrentStep(nextAvailable);
        } else {
          setIsPaused(true);
        }
      }
    } else if (isPaused) {
      // Si está pausado, verificar si ahora hay pasos disponibles
      const nextAvailable = getNextAvailableStep(0);
      if (nextAvailable !== -1) {
        setIsPaused(false);
        setCurrentStep(nextAvailable);
      }
    }
  }, [location.pathname, isActive, isPaused, currentStep, tutorialSteps, getNextAvailableStep, elementExists]);

  // Función para iniciar el tutorial
  const startTutorial = useCallback(() => {
    console.log('Starting tutorial from button');
    // Reiniciar completamente el tutorial
    setIsActive(true);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsPaused(false);

    if (user?.id) {
      // Limpiar claves específicas del usuario
      const userCompletedKey = getUserSpecificKey('completed');
      const userSkippedKey = getUserSpecificKey('skipped');
      const tutorialStartedKey = getUserSpecificKey('started');

      localStorage.removeItem(userCompletedKey);
      localStorage.removeItem(userSkippedKey);
      localStorage.removeItem(tutorialStartedKey);
    }

    // Encontrar el primer paso disponible en la página actual
    const firstStep = getNextAvailableStep(0);
    if (firstStep !== -1) {
      setCurrentStep(firstStep);
      console.log('Tutorial started successfully at step:', firstStep);
    } else {
      // Si no hay pasos disponibles, ir al dashboard
      console.log('No steps available, navigating to dashboard');
      navigate('/dashboard');
      // El efecto de navegación se encargará de iniciar el tutorial
    }
  }, [getNextAvailableStep, navigate, user?.id, getUserSpecificKey]);

  // Función para completar el tutorial
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);

    if (user?.id) {
      const userCompletedKey = getUserSpecificKey('completed');
      localStorage.setItem(userCompletedKey, 'true');

      // Limpiar claves específicas del usuario
      const tutorialStartedKey = getUserSpecificKey('started');
      localStorage.removeItem(tutorialStartedKey);
    }
  }, [user?.id, getUserSpecificKey]);

  // Función para ir al siguiente paso
  const nextStep = useCallback(() => {
    const currentStepData = tutorialSteps[currentStep];
    const nextStepIndex = getNextAvailableStep(currentStep + 1);

    // Si es un paso de navegación y tiene navigateTo, navegar automáticamente
    if (currentStepData?.isNavigation && currentStepData.navigateTo) {
      navigate(currentStepData.navigateTo);
      // El efecto de cambio de página se encargará de continuar
      return;
    }

    if (nextStepIndex !== -1) {
      setCurrentStep(nextStepIndex);
    } else {
      completeTutorial();
    }
  }, [currentStep, getNextAvailableStep, completeTutorial, tutorialSteps, navigate]);

  // Función para ir al paso anterior
  const previousStep = useCallback(() => {
    let prevIndex = currentStep - 1;
    while (prevIndex >= 0) {
      const step = tutorialSteps[prevIndex];
      if ((!step.page || location.pathname === step.page) && elementExists(step.target)) {
        setCurrentStep(prevIndex);
        return;
      }
      prevIndex--;
    }
    // Si no hay paso anterior disponible, mantener el actual
  }, [currentStep, tutorialSteps, location.pathname, elementExists]);

  // Función para saltar al paso específico
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.length) {
      setCurrentStep(stepIndex);
    }
  }, [tutorialSteps.length]);

  // Función para saltar el tutorial
  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setIsSkipped(true);

    if (user?.id) {
      const userSkippedKey = getUserSpecificKey('skipped');
      localStorage.setItem(userSkippedKey, 'true');

      // Limpiar claves específicas del usuario
      const tutorialStartedKey = getUserSpecificKey('started');
      localStorage.removeItem(tutorialStartedKey);
    }
  }, [user?.id, getUserSpecificKey]);

  // Función para reiniciar el tutorial
  const restartTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);

    if (user?.id) {
      // Limpiar claves específicas del usuario
      const userCompletedKey = getUserSpecificKey('completed');
      const userSkippedKey = getUserSpecificKey('skipped');
      const tutorialStartedKey = getUserSpecificKey('started');

      localStorage.removeItem(userCompletedKey);
      localStorage.removeItem(userSkippedKey);
      localStorage.removeItem(tutorialStartedKey);
    }
  }, [user?.id, getUserSpecificKey]);

  // Función para verificar si un paso específico está activo
  const isStepActive = useCallback((stepId) => {
    const step = tutorialSteps.find(s => s.id === stepId);
    return step && currentStep === tutorialSteps.indexOf(step);
  }, [currentStep, tutorialSteps]);

  return {
    // Estado
    isActive,
    currentStep,
    isCompleted,
    isSkipped,
    isPaused,
    totalSteps: tutorialSteps.length,

    // Datos del tutorial
    tutorialSteps,
    currentStepData: tutorialSteps[currentStep],

    // Funciones de navegación
    startTutorial,
    nextStep,
    previousStep,
    goToStep,
    completeTutorial,
    skipTutorial,
    restartTutorial,

    // Funciones de utilidad
    isStepActive,

    // Textos traducidos
    texts: {
      next: t('tutorial.navigation.next'),
      previous: t('tutorial.navigation.previous'),
      finish: t('tutorial.navigation.finish'),
      skip: t('tutorial.navigation.skip'),
      step: t('tutorial.navigation.step'),
      start: t('tutorial.welcome.start'),
      skipTutorial: t('tutorial.welcome.skip'),
      clickToContinue: t('tutorial.tooltips.click_to_continue'),
      exploreFeature: t('tutorial.tooltips.explore_feature')
    }
  };
};

export default useTutorial;