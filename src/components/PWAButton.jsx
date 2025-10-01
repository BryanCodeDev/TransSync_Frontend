import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import InstallModal from './InstallModal';

const PWAButton = ({ className = '', variant = 'floating', forceMobile = false }) => {
  const { t } = useTranslation();
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
    const message = `${t('installModal.steps.ios.description')}\n\n1. ${t('installModal.steps.ios.steps.0')}\n2. ${t('installModal.steps.ios.steps.2')}\n3. ${t('installModal.steps.ios.steps.4')}`;

    if (window.confirm(message + '\n\n¿Quieres que te mostremos cómo hacerlo?')) {
      window.open('https://support.apple.com/guide/iphone/bookmark-favorite-webpages-iph42ab2f3a7/ios', '_blank');
    }
  };

  const showAndroidInstructions = () => {
    const message = `${t('installModal.steps.android.description')}\n\n1. ${t('installModal.steps.android.steps.0')}\n2. ${t('installModal.steps.android.steps.2')}\n3. ${t('installModal.steps.android.steps.4')}`;

    alert(message);
  };

  const showBrowserNotSupported = () => {
    const message = `${t('installModal.steps.desktop.description')}\n\n• Chrome o Edge en Android\n• Safari en iOS\n\n¿Quieres abrir la página en tu navegador predeterminado?`;

    if (window.confirm(message)) {
      window.location.reload();
    }
  };

  const showSuccessMessage = () => {
    // Mostrar mensaje de éxito
    const event = new CustomEvent('showNotification', {
      detail: {
        type: 'success',
        title: t('installModal.success.title'),
        message: t('installModal.success.description')
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
              {t('installModal.steps.desktop.steps.1')}
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              {t('installModal.steps.desktop.steps.3')}
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
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-sm w-full animate-bounce-gentle">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                  {t('installModal.title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t('installModal.steps.benefits.features.0')}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseInstallButton}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0 ml-2"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
            {t('installModal.steps.benefits.description')}
          </p>

          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isIOS ? t('installModal.steps.ios.title') : isAndroid ? t('installModal.steps.android.title') : t('installModal.steps.benefits.features.1')}
            </span>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isInstalling ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="truncate">{t('installModal.steps.desktop.steps.1')}</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{isIOS ? t('installModal.steps.desktop.steps.2') : t('installModal.steps.desktop.steps.3')}</span>
              </>
            )}
          </button>

          <div className="mt-2 sm:mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isIOS ? t('installModal.steps.desktop.steps.2') : t('installModal.steps.desktop.steps.3')}
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