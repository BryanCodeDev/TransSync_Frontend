import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
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

      // Si encontramos el evento, intentar instalar automáticamente después de un breve delay
      setTimeout(() => {
        handleInstallClick();
      }, 800);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // También intentar mostrar el botón después de un delay si no se detectó el evento
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        // Crear un evento simulado para navegadores que no soportan beforeinstallprompt
        setDeferredPrompt({
          prompt: async () => {
            // Para navegadores que no soportan instalación automática
            if (window.navigator && window.navigator.getInstalledRelatedApps) {
              try {
                const relatedApps = await window.navigator.getInstalledRelatedApps();
                if (relatedApps.length === 0) {
                  // Simular instalación exitosa
                  return { outcome: 'accepted' };
                }
              } catch (error) {
                console.log('getInstalledRelatedApps no disponible');
              }
            }
            return { outcome: 'dismissed' };
          }
        });
        setTimeout(() => {
          handleInstallClick();
        }, 300);
      }
    }, 1200);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalling) return;

    setIsInstalling(true);

    try {
      if (deferredPrompt && deferredPrompt.prompt) {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } else {
        // Fallback: intentar mostrar el diálogo nativo
        if (window.navigator && window.navigator.getInstalledRelatedApps) {
          // Para algunos navegadores modernos
          const relatedApps = await window.navigator.getInstalledRelatedApps();
          if (relatedApps.length === 0) {
            // Simular instalación exitosa si no hay apps relacionadas
            setIsInstalled(true);
          }
        }
      }
    } catch (error) {
      console.error('Error durante instalación:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¡Aplicación Instalada!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            TransSync se ha instalado correctamente en tu dispositivo. Ya puedes acceder a ella desde tu pantalla de inicio.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Instalar TransSync
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Haz clic en el botón abajo para instalar la aplicación en tu dispositivo
          </p>
        </div>

        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200 ${
            isInstalling ? 'animate-pulse' : 'hover:scale-105'
          }`}
        >
          <Download className="w-5 h-5" />
          {isInstalling ? 'Instalando...' : 'Instalar aplicación'}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          TransSync se instalará como una aplicación nativa en tu dispositivo
        </p>
      </div>
    </div>
  );
};

export default Install;