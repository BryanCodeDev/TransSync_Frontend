import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAButton = ({ className = '', variant = 'floating', forceMobile = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Mostrar el botón después de un delay si es móvil o si se fuerza
    const showButtonForMobile = () => {
      const shouldShow = (isMobile || forceMobile) && !deferredPrompt;
      if (shouldShow) {
        setTimeout(() => {
          if (!deferredPrompt) {
            setShowInstallButton(true);
          }
        }, 1000);
      }
    };

    // Ejecutar después de un delay inicial
    const initialTimer = setTimeout(showButtonForMobile, 500);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(initialTimer);
    };
  }, [isMobile, deferredPrompt, forceMobile]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    }
  };

  const handleCloseInstallButton = () => {
    setShowInstallButton(false);
  };

  // Si no debe mostrarse o no es móvil, no renderizar nada
  if (!showInstallButton || !isMobile) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleInstallClick}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 ${className}`}
      >
        <Download className="w-5 h-5" />
        Instalar aplicación
      </button>
    );
  }

  // Variant floating (por defecto)
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            📱 Instalar TransSync
          </h3>
          <button
            onClick={handleCloseInstallButton}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
          Instala la aplicación para acceso rápido desde tu pantalla de inicio
        </p>
        <button
          onClick={handleInstallClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Instalar aplicación
        </button>
      </div>
    </div>
  );
};

export default PWAButton;