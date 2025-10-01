import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import InstallModal from './InstallModal';

const PWAButton = ({ className = '', variant = 'floating', forceMobile = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Detectar tipo de dispositivo y si está instalado
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const iosCheck = /iPad|iPhone|iPod/.test(userAgent);
      const androidCheck = /Android/.test(userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      setIsIOS(iosCheck);
      setIsAndroid(androidCheck);
      setIsInstalled(isStandalone);

      // Retornar si es móvil para usar en la lógica de mostrar botón
      return window.innerWidth <= 768;
    };

    const mobile = checkDevice();
    window.addEventListener('resize', checkDevice);

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Mostrar el botón después de un delay si es móvil o si se fuerza
    const showButtonForMobile = () => {
      const shouldShow = (mobile || forceMobile) && !isInstalled;
      if (shouldShow) {
        setTimeout(() => {
          if (!deferredPrompt && !isInstalled) {
            setShowInstallButton(true);
          }
        }, 1500);
      }
    };

    // Ejecutar después de un delay inicial
    const initialTimer = setTimeout(showButtonForMobile, 1000);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(initialTimer);
    };
  }, [forceMobile, deferredPrompt, isInstalled]);

  const handleInstallClick = () => {
    // Abrir el modal de instalación en lugar de proceder directamente
    setShowModal(true);
  };

  const handleModalInstall = async () => {
    setIsInstalling(true);

    try {
      if (isIOS) {
        // Para iOS, mostrar instrucciones específicas
        showIOSInstructions();
        setShowModal(false);
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowInstallButton(false);
          setIsInstalled(true);
          setShowModal(false);
          showSuccessMessage();
        } else {
          showCancelMessage();
        }
      } else if (isAndroid) {
        showAndroidInstructions();
        setShowModal(false);
      } else {
        showBrowserNotSupported();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error durante instalación:', error);
      showErrorMessage();
    } finally {
      setIsInstalling(false);
    }
  };

  const showIOSInstructions = () => {
    // Crear modal o alerta con instrucciones específicas para iOS
    const message = 'Para instalar en iOS:\n\n1. Toca el botón compartir (⬜)\n2. Selecciona "Agregar a pantalla de inicio"\n3. Toca "Agregar" en la esquina superior derecha';

    if (window.confirm(message + '\n\n¿Quieres que te mostremos cómo hacerlo?')) {
      window.open('https://support.apple.com/guide/iphone/bookmark-favorite-webpages-iph42ab2f3a7/ios', '_blank');
    }
  };

  const showAndroidInstructions = () => {
    const message = 'Para instalar en Android:\n\n1. Toca el menú de opciones (⋮)\n2. Selecciona "Instalar aplicación" o "Agregar a pantalla de inicio"\n3. Sigue las instrucciones';

    alert(message);
  };

  const showBrowserNotSupported = () => {
    const message = 'Para instalar la aplicación, usa:\n\n• Chrome o Edge en Android\n• Safari en iOS\n\n¿Quieres abrir la página en tu navegador predeterminado?';

    if (window.confirm(message)) {
      window.location.reload();
    }
  };

  const showSuccessMessage = () => {
    // Mostrar mensaje de éxito
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        title: '¡Aplicación instalada!',
        message: 'TransSync se ha instalado correctamente en tu dispositivo.'
      }
    });
    window.dispatchEvent(event);
  };

  const showCancelMessage = () => {
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'info',
        title: 'Instalación cancelada',
        message: 'Puedes instalar la aplicación en cualquier momento usando el botón de instalación.'
      }
    });
    window.dispatchEvent(event);
  };

  const showErrorMessage = () => {
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'error',
        title: 'Error en instalación',
        message: 'Hubo un problema durante la instalación. Inténtalo de nuevo.'
      }
    });
    window.dispatchEvent(event);
  };

  const handleCloseInstallButton = () => {
    setShowInstallButton(false);
  };

  // Si no debe mostrarse, no renderizar nada
  if (!showInstallButton || isInstalled) {
    return (
      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInstall={handleModalInstall}
      />
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {isInstalling ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Instalando...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              Instalar aplicación
            </>
          )}
        </button>
        <InstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onInstall={handleModalInstall}
        />
      </>
    );
  }

  // Variant floating (por defecto) - Mejorado
  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm animate-bounce-gentle">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  📱 Instalar TransSync
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Acceso rápido desde tu pantalla
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseInstallButton}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            Instala la aplicación para acceso rápido desde tu pantalla de inicio y funciones offline.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isIOS ? 'Compatible con iOS' : isAndroid ? 'Compatible con Android' : 'Funciona sin conexión'}
            </span>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {isIOS ? 'Ver instrucciones' : 'Instalar aplicación'}
              </>
            )}
          </button>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isIOS ? 'Toca arriba para ver cómo instalar' : 'Se instalará automáticamente'}
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-gentle {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-3px);
            }
            60% {
              transform: translateY(-2px);
            }
          }
          .animate-bounce-gentle {
            animation: bounce-gentle 2s infinite;
          }
        `}</style>
      </div>

      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInstall={handleModalInstall}
      />
    </>
  );
};

export default PWAButton;