import React, { useEffect, useState } from 'react';
import { useTutorial } from '../hooks/useTutorial';
import Button from './Button';

const Tutorial = () => {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    previousStep,
    skipTutorial,
    texts
  } = useTutorial();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Mostrar pantalla de bienvenida en el primer paso
    setShowWelcome(currentStep === 0);
  }, [currentStep]);

  // No renderizar si el tutorial no está activo
  if (!isActive) {
    return null;
  }

  // Pantalla de bienvenida
  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
              {currentStepData?.title}
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6 leading-relaxed">
              {currentStepData?.description}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShowWelcome(false);
                  nextStep();
                }}
                variant="primary"
                size="large"
                fullWidth
              >
                {texts.start}
              </Button>
              <Button
                onClick={skipTutorial}
                variant="ghost"
                size="medium"
                fullWidth
              >
                {texts.skipTutorial}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overlay para los pasos del tutorial
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" />

      {/* Tutorial Card */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border-light dark:border-border-dark">
          <div className="p-6">
            {/* Header con progreso */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{currentStep}</span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {texts.step.replace('{{current}}', currentStep).replace('{{total}}', totalSteps)}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTutorial}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-sm underline"
              >
                {texts.skip}
              </button>
            </div>

            {/* Contenido del paso */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                {currentStepData?.title}
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                {currentStepData?.description}
              </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between items-center">
              <Button
                onClick={previousStep}
                variant="ghost"
                size="medium"
                disabled={currentStep === 1}
                className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {texts.previous}
              </Button>

              <div className="flex space-x-2">
                {/* Indicadores de pasos */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index + 1 === currentStep
                          ? 'bg-primary-600'
                          : index + 1 < currentStep
                          ? 'bg-primary-300'
                          : 'bg-border-light dark:bg-border-dark'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                size="medium"
              >
                {currentStep === totalSteps ? texts.finish : texts.next}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip para elementos específicos */}
      {currentStepData?.target && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm shadow-lg animate-pulse">
            {texts.clickToContinue}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;