import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'transsync_tutorial_completed';
const STORAGE_SKIP_KEY = 'transsync_tutorial_skipped';

export const useTutorial = () => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  // Definir los pasos del tutorial
  const tutorialSteps = useMemo(() => [
    {
      id: 'welcome',
      title: t('tutorial.welcome.title'),
      description: t('tutorial.welcome.description'),
      target: null, // Pantalla completa para bienvenida
      placement: 'center'
    },
    {
      id: 'dashboard',
      title: t('tutorial.step1.title'),
      description: t('tutorial.step1.description'),
      target: '[data-tutorial="dashboard"]',
      placement: 'bottom'
    },
    {
      id: 'drivers',
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.description'),
      target: '[data-tutorial="drivers"]',
      placement: 'right'
    },
    {
      id: 'routes',
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.description'),
      target: '[data-tutorial="routes"]',
      placement: 'right'
    },
    {
      id: 'vehicles',
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.description'),
      target: '[data-tutorial="vehicles"]',
      placement: 'right'
    },
    {
      id: 'schedules',
      title: t('tutorial.step5.title'),
      description: t('tutorial.step5.description'),
      target: '[data-tutorial="schedules"]',
      placement: 'right'
    },
    {
      id: 'reports',
      title: t('tutorial.step6.title'),
      description: t('tutorial.step6.description'),
      target: '[data-tutorial="reports"]',
      placement: 'right'
    },
    {
      id: 'profile',
      title: t('tutorial.step7.title'),
      description: t('tutorial.step7.description'),
      target: '[data-tutorial="profile"]',
      placement: 'bottom'
    },
    {
      id: 'chatbot',
      title: 'ChatBot Inteligente',
      description: 'Utiliza nuestro asistente virtual con IA para obtener respuestas rápidas sobre cualquier consulta del sistema.',
      target: '[data-tutorial="chatbot"]',
      placement: 'left'
    },
    {
      id: 'notifications',
      title: 'Notificaciones en Tiempo Real',
      description: 'Recibe alertas instantáneas sobre eventos importantes como retrasos, emergencias o cambios en rutas.',
      target: '[data-tutorial="notifications"]',
      placement: 'top'
    },
    {
      id: 'theme',
      title: 'Configuración de Tema',
      description: 'Personaliza la apariencia del sistema con temas claros u oscuros según tu preferencia.',
      target: '[data-tutorial="theme"]',
      placement: 'bottom'
    },
    {
      id: 'emergency',
      title: 'Centro de Emergencias',
      description: 'Accede rápidamente al panel de emergencias para reportar y gestionar situaciones críticas.',
      target: '[data-tutorial="emergency"]',
      placement: 'right'
    }
  ], [t]);

  // Verificar si el usuario ya completó o saltó el tutorial
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    const skipped = localStorage.getItem(STORAGE_SKIP_KEY) === 'true';

    setIsCompleted(completed);
    setIsSkipped(skipped);

    // Si no está completado ni saltado, mostrar tutorial para usuarios nuevos
    if (!completed && !skipped) {
      // Pequeño delay para que la UI se cargue completamente
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Función para iniciar el tutorial
  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
  }, []);

  // Función para completar el tutorial
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // Función para ir al siguiente paso
  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep, tutorialSteps.length, completeTutorial]);

  // Función para ir al paso anterior
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

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
  }, []);

  // Función para reiniciar el tutorial
  const restartTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
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