import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, Globe, Download } from 'lucide-react';

const MobileDownload = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Verificar si el navegador soporta instalación PWA
    const checkInstallSupport = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent);

      // Si ya está instalado como PWA
      if (isStandalone) {
        setCanInstall(false);
        return;
      }

      // Si es iOS, siempre mostrar opción (aunque no use beforeinstallprompt)
      if (isIOS) {
        setCanInstall(true);
        return;
      }

      // Para otros navegadores que soporten beforeinstallprompt
      if (isAndroid && isChrome) {
        setCanInstall(false); // Se activará cuando llegue el evento
      } else {
        setCanInstall(false);
      }
    };

    checkInstallSupport();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Detectar si es iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      alert('La aplicación ya está instalada');
      return;
    }

    if (isIOS) {
      // Para iOS, mostrar instrucciones específicas
      alert('Para instalar en iOS: Toca el botón de compartir y selecciona "Agregar a pantalla de inicio"');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } else {
      alert('La instalación no está disponible en este navegador. Prueba con Chrome o Edge en Android.');
    }
  };
  const instructions = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Abre la cámara",
      description: "En tu dispositivo móvil, abre la aplicación de cámara"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Escanea el código",
      description: "Apunta la cámara hacia el código QR que aparece arriba"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Instala la app",
      description: "Toca el banner que aparece y selecciona 'Instalar' o 'Agregar a pantalla de inicio'"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📱 Descarga TransSync Móvil
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Instala nuestra aplicación móvil para acceder rápidamente a todas las funciones de TransSync desde tu dispositivo móvil.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-8 items-center`}>
            {/* Botón de Instalación */}
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Instalar TransSync Móvil
                </h2>
                <div className="mb-6">
                  <button
                    onClick={handleInstallClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105"
                  >
                    <Download className="w-6 h-6" />
                    Instalar aplicación móvil
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Haz clic para instalar la aplicación directamente
                </p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                ¿Cómo instalar la aplicación?
              </h3>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-blue-600 mr-2">{instruction.icon}</span>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {instruction.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Beneficios de la aplicación móvil
                </h4>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li>• Acceso rápido desde tu pantalla de inicio</li>
                  <li>• Funciona sin conexión a internet</li>
                  <li>• Notificaciones push en tiempo real</li>
                  <li>• Interfaz optimizada para móviles</li>
                  <li>• Actualizaciones automáticas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones específicas para iOS */}
        {isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-xl p-6 text-center border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
              📱 Instrucciones para iOS
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              En Safari: Toca el botón de compartir <span className="font-bold">⬜</span> y selecciona "Agregar a pantalla de inicio"
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⬜</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Botón compartir</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Agregar a pantalla de inicio</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Download - Solo para desktop */}
        {!isMobile && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Prefieres acceso directo?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              También puedes acceder directamente desde tu navegador móvil
            </p>
            <a
              href="https://transync1.netlify.app/home"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Globe className="w-5 h-5 mr-2" />
              Abrir TransSync
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            TransSync es una aplicación web progresiva (PWA) que se puede instalar en cualquier dispositivo móvil
          </p>
        </div>
      </div>

    </div>
  );
};

export default MobileDownload;