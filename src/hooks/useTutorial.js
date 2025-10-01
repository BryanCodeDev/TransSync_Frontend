import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const STORAGE_KEY = 'transsync_tutorial_completed';
const STORAGE_SKIP_KEY = 'transsync_tutorial_skipped';

export const useTutorial = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuthContext();
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
          description: 'Como SuperAdministrador, tienes acceso completo al sistema. Haz clic en "Administración" para gestionar usuarios, asignar roles y controlar el acceso al sistema.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/admin-dashboard'
        },
        {
          id: 'explain-admin-dashboard',
          title: 'Gestión Completa de Usuarios',
          description: 'Aquí puedes crear nuevos usuarios, editar información existente, asignar roles específicos (Gestor, Conductor), activar/desactivar cuentas y gestionar permisos de acceso al sistema completo.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'bottom',
          page: '/admin-dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-dashboard',
          title: 'Dashboard General del Sistema',
          description: 'Accede al panel principal para monitorear métricas globales, rendimiento de todas las empresas registradas y estadísticas generales del sistema.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: '/admin-dashboard',
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Panel de Control Global',
          description: 'Visualiza métricas en tiempo real de todas las empresas, rendimiento general de la plataforma, estadísticas de uso del sistema y alertas importantes que requieren tu atención.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-reports',
          title: 'Informes y Analytics Avanzados',
          description: 'Como SuperAdmin, accede a informes detallados sobre el uso del sistema, métricas de rendimiento y análisis avanzados de toda la plataforma.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/informes'
        },
        {
          id: 'explain-reports',
          title: 'Centro de Inteligencia de Negocios',
          description: 'Genera reportes personalizados, analiza tendencias del sistema, monitorea KPIs críticos y obtén insights valiosos para la toma de decisiones estratégicas.',
          target: '[data-tutorial="reports"]',
          placement: 'bottom',
          page: '/informes',
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
          description: 'Como Gestor, haz clic en "Dashboard" para acceder al centro de operaciones de tu empresa y monitorear métricas clave en tiempo real.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Centro de Operaciones',
          description: 'Visualiza métricas críticas de tu empresa: vehículos en operación, conductores activos, rutas en ejecución, alertas del sistema y estadísticas de rendimiento general.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-drivers',
          title: 'Gestión Integral de Conductores',
          description: 'Haz clic en "Conductores" para administrar todo tu personal: crear perfiles, asignar vehículos, gestionar licencias y horarios de trabajo.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/drivers'
        },
        {
          id: 'explain-drivers',
          title: 'Centro de Gestión de Personal',
          description: 'Administra eficientemente tu equipo: registra nuevos conductores, actualiza información personal, verifica vencimientos de licencias, asigna vehículos y gestiona turnos de trabajo.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: false
        },
        {
          id: 'navigate-vehicles',
          title: 'Control Total de tu Flota',
          description: 'Haz clic en "Vehículos" para gestionar todos los vehículos de tu empresa: mantenimiento, asignaciones y estado operativo.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: true,
          navigateTo: '/vehiculos'
        },
        {
          id: 'explain-vehicles',
          title: 'Gestión Avanzada de Flota',
          description: 'Controla el estado operativo de cada vehículo: programa mantenimientos preventivos, monitorea vencimientos de documentos (SOAT, técnico-mecánica), asigna conductores y gestiona disponibilidad.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: false
        },
        {
          id: 'navigate-routes',
          title: 'Sistema Inteligente de Rutas',
          description: 'Haz clic en "Rutas" para diseñar y optimizar los recorridos de tu empresa con herramientas avanzadas de geolocalización.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: true,
          navigateTo: '/rutas'
        },
        {
          id: 'explain-routes',
          title: 'Centro de Diseño de Rutas',
          description: 'Crea rutas optimizadas con geolocalización precisa, define paradas estratégicas, calcula tiempos estimados y administra recorridos eficientes para maximizar la productividad.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Planificación Estratégica de Horarios',
          description: 'Haz clic en "Horarios" para organizar toda la operación: crear viajes, asignar recursos y optimizar la programación diaria.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Centro de Programación Operativa',
          description: 'Crea y gestiona horarios de manera inteligente: asigna vehículos y conductores a rutas específicas, programa viajes recurrentes y optimiza la distribución de recursos para máxima eficiencia.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-reports',
          title: 'Centro de Inteligencia Empresarial',
          description: 'Haz clic en "Informes" para acceder a análisis detallados del rendimiento de tu operación y tomar decisiones basadas en datos.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/informes'
        },
        {
          id: 'explain-reports',
          title: 'Sistema Avanzado de Analytics',
          description: 'Genera reportes personalizados sobre eficiencia operativa, analiza patrones de uso, identifica áreas de mejora y obtén métricas detalladas para optimizar tu negocio.',
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
          title: 'Tu Centro de Operaciones Personal',
          description: 'Como Conductor, haz clic en "Dashboard" para acceder a tu panel personal donde encontrarás información específica sobre tus viajes, horarios y rendimiento.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Panel Personalizado para Conductores',
          description: 'Visualiza información específica para ti: viajes asignados para hoy, estadísticas de tu rendimiento, alertas importantes y resumen de tu actividad diaria como conductor.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Consulta tus Horarios de Trabajo',
          description: 'Haz clic en "Horarios" para revisar tu programación semanal, rutas asignadas y detalles específicos de cada viaje que tienes programado.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Centro de Información de Viajes',
          description: 'Aquí encontrarás toda tu programación: horarios de salida y llegada, rutas específicas asignadas, vehículos que utilizarás y cualquier instrucción especial para cada viaje.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-routes',
          title: 'Explora el Sistema de Rutas',
          description: 'Como conductor, puedes consultar las rutas disponibles y familiarizarte con los recorridos que realizarás en tu jornada laboral.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/rutas'
        },
        {
          id: 'explain-routes',
          title: 'Información Detallada de Rutas',
          description: 'Visualiza mapas interactivos con las rutas asignadas, puntos de referencia importantes, paradas establecidas y detalles específicos de cada recorrido que realizarás.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'navigate-profile',
          title: 'Gestiona tu Información Personal',
          description: 'Haz clic en tu avatar para acceder a tu perfil personal donde puedes actualizar tu información y configurar tus preferencias.',
          target: '[data-tutorial="user-menu"]',
          placement: 'bottom',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'show-profile-menu',
          title: 'Menú de Configuración Personal',
          description: 'Aquí puedes acceder a tu información personal, cambiar tu contraseña, actualizar datos de contacto y personalizar la experiencia de la aplicación.',
          target: '[data-tutorial="profile-menu-item"]',
          placement: 'left',
          page: '/rutas',
          isNavigation: true,
          navigateTo: '/profile'
        },
        {
          id: 'explain-profile',
          title: 'Centro de Gestión Personal',
          description: 'Mantén actualizada tu información: datos personales, documentos importantes, información de contacto y configuraciones de seguridad para un mejor uso del sistema.',
          target: '[data-tutorial="profile"]',
          placement: 'bottom',
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

  // Función para verificar si un elemento existe en el DOM
  const elementExists = useCallback((selector) => {
    if (!selector) return true; // Para pasos sin target (como welcome)
    return document.querySelector(selector) !== null;
  }, []);

  // Función para obtener el siguiente paso disponible
  const getNextAvailableStep = useCallback((startIndex = 0) => {
    for (let i = startIndex; i < tutorialSteps.length; i++) {
      const step = tutorialSteps[i];
      // Si el paso no tiene página específica o coincide con la página actual
      if (!step.page || location.pathname === step.page) {
        // Verificar si el elemento existe
        if (elementExists(step.target)) {
          return i;
        }
      }
    }
    return -1; // No hay más pasos disponibles
  }, [tutorialSteps, location.pathname, elementExists]);

  // Función mejorada para verificar elementos con reintentos
  const waitForElement = useCallback((selector, maxAttempts = 10, interval = 500) => {
    return new Promise((resolve) => {
      let attempts = 0;

      const checkElement = () => {
        attempts++;
        const element = document.querySelector(selector);

        if (element) {
          resolve(element);
        } else if (attempts < maxAttempts) {
          setTimeout(checkElement, interval);
        } else {
          console.warn(`Elemento no encontrado después de ${maxAttempts} intentos: ${selector}`);
          resolve(null);
        }
      };

      checkElement();
    });
  }, []);

  // Verificar si el usuario ya completó o saltó el tutorial
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    const skipped = localStorage.getItem(STORAGE_SKIP_KEY) === 'true';

    setIsCompleted(completed);
    setIsSkipped(skipped);

    // Solo activar el tutorial automáticamente una vez cuando el usuario inicia sesión por primera vez
    // y está en una página protegida
    if (!completed && !skipped && !isActive && location.pathname !== '/home' && location.pathname !== '/login' && location.pathname !== '/register') {
      // Verificar si es la primera vez que se activa el tutorial para este usuario
      const tutorialStarted = localStorage.getItem('tutorial_started') === 'true';
      if (!tutorialStarted) {
        // Pequeño delay para que la UI se cargue completamente
        const timer = setTimeout(() => {
          const firstStep = getNextAvailableStep(0);
          if (firstStep !== -1) {
            localStorage.setItem('tutorial_started', 'true');
            setIsActive(true);
            setCurrentStep(firstStep);
          }
        }, 2000); // Más delay para mejor UX
        return () => clearTimeout(timer);
      }
    }
  }, [getNextAvailableStep, isActive, location.pathname]);

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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
    localStorage.removeItem('tutorial_started');

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
  }, [getNextAvailableStep, navigate]);

  // Función para completar el tutorial
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.removeItem('tutorial_started');
  }, []);

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
    localStorage.setItem(STORAGE_SKIP_KEY, 'true');
    localStorage.removeItem('tutorial_started');
  }, []);

  // Función para reiniciar el tutorial
  const restartTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
    localStorage.removeItem('tutorial_started');
  }, []);

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