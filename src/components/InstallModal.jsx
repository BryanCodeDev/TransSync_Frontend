import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, ArrowRight, Zap, Bell, HardDrive } from 'lucide-react';

const InstallModal = ({ isOpen, onClose, onInstall }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall();
    } catch (error) {
      console.error('Error durante instalación:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const userAgent = navigator.userAgent;
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      title: '¿Por qué instalar TransSync?',
      description: 'Descubre los beneficios de tener la aplicación en tu dispositivo',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">Acceso rápido desde tu pantalla de inicio</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <HardDrive className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Funciona sin conexión a internet</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Bell className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-purple-700 dark:text-purple-300">Notificaciones push en tiempo real</span>
          </div>
        </div>
      )
    },
    {
      title: isIOS ? 'Instrucciones para iOS' : 'Instrucciones para Android',
      description: isIOS ? 'Sigue estos pasos para instalar en tu iPhone o iPad' : 'Sigue estos pasos para instalar en tu dispositivo Android',
      content: (
        <div className="space-y-4">
          {isIOS ? (
            <>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Abre el menú compartir</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Toca el botón cuadrado con flecha hacia arriba</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Selecciona "Agregar a pantalla de inicio"</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Desplázate hacia abajo y toca esta opción</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Confirma la instalación</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Toca "Agregar" en la esquina superior derecha</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Toca el menú del navegador</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Busca los tres puntos o menú de opciones</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Selecciona "Instalar aplicación"</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">O "Agregar a pantalla de inicio"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Confirma la instalación</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Sigue las instrucciones que aparecen</p>
                </div>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: '¡Listo para instalar!',
      description: 'Haz clic en instalar y sigue las instrucciones',
      content: (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Se abrirá automáticamente el proceso de instalación de tu dispositivo
          </p>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 mx-auto transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isInstalling ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {isIOS ? 'Ver instrucciones' : 'Instalar aplicación'}
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                Instalar TransSync
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Paso {currentStep + 1} de {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="min-h-[150px] sm:min-h-[200px]">
              {steps[currentStep].content}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1"
          >
            Anterior
          </button>

          <div className="flex items-center justify-center gap-1 sm:gap-2 order-1 sm:order-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base rounded-lg transition-colors order-3"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 order-3"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallModal;