import React, { useState } from 'react';
import QRWithInstall from '../components/QRWithInstall';
import { Smartphone, CheckCircle, Globe, Download } from 'lucide-react';

const MobileDownload = () => {
  const appUrl = 'https://transync1.netlify.app/install';
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
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
            {/* QR Code Section */}
            <QRWithInstall
              url={appUrl}
              size={isMobile ? 180 : 200}
              title="Escanea este código QR"
              description="Código QR para instalación móvil"
            />

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
              href={appUrl}
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