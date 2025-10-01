import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, CheckCircle, Globe, Download, Share2, Plus, Monitor } from 'lucide-react';

const MobileDownload = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

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
        return;
      }

      // Si es iOS, siempre mostrar opción (aunque no use beforeinstallprompt)
      if (isIOS) {
        return;
      }

      // Para otros navegadores que soporten beforeinstallprompt
      if (isAndroid && isChrome) {
        // Se activará cuando llegue el evento
      } else {
        // No mostrar botón para navegadores no soportados
      }
    };

    checkInstallSupport();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
      }
    } else {
      alert('La instalación no está disponible en este navegador. Prueba con Chrome o Edge en Android.');
    }
  };
  const instructions = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: t('mobileDownload.instructions.steps.0.title'),
      description: t('mobileDownload.instructions.steps.0.description')
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('mobileDownload.instructions.steps.1.title'),
      description: t('mobileDownload.instructions.steps.1.description')
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: t('mobileDownload.instructions.steps.2.title'),
      description: t('mobileDownload.instructions.steps.2.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {t('mobileDownload.title')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('mobileDownload.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-8 items-center`}>
            {/* Botón de Instalación */}
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  {t('mobileDownload.instructions.title')}
                </h2>
                <div className="mb-6">
                  <button
                    onClick={handleInstallClick}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto transition-all duration-200 hover:scale-105 border border-blue-400/20 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-95"
                    aria-label="Install TransSync mobile app"
                  >
                    <Download className="w-6 h-6" />
                    {t('mobileDownload.instructions.steps.2.title')}
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {t('mobileDownload.subtitle')}
                </p>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                {t('mobileDownload.instructions.title')}
              </h3>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl border border-blue-100 dark:border-slate-600">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-slate-700 dark:text-slate-300 mr-3">{instruction.icon}</span>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                          {instruction.title}
                        </h4>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t('mobileDownload.features.title')}
                </h4>
                <ul className="space-y-3 text-sm text-emerald-700 dark:text-emerald-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    {t('mobileDownload.features.list.0')}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    {t('mobileDownload.features.list.1')}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    {t('mobileDownload.features.list.2')}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    {t('mobileDownload.features.list.3')}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    {t('mobileDownload.features.list.4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones específicas para iOS */}
        {isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl shadow-xl p-6 text-center border border-blue-100 dark:border-slate-600">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              {t('mobileDownload.iosGuide')}
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              In Safari: Tap the share button <Share2 className="inline w-5 h-5 mx-1" /> and select "Add to Home Screen"
            </p>
            <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl p-4 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Share button</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Add to Home Screen</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Download - Solo para desktop */}
        {!isMobile && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl mb-4 shadow-md">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              {t('mobileDownload.alternative.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {t('mobileDownload.alternative.description')}
            </p>
            <a
              href="https://transync1.netlify.app/home"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/30 active:scale-95"
              aria-label="Access TransSync web version"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="w-5 h-5 mr-2" />
              {t('mobileDownload.alternative.button')}
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <p className="text-sm">
              {t('mobileDownload.footer')}
            </p>
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MobileDownload;