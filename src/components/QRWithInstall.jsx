import React from 'react';
import InstallQR from './InstallQR';
import PWAButton from './PWAButton';

const QRWithInstall = ({
  size = 200,
  qrClassName = '',
  showInstallButton = true,
  title = 'Escanea este código QR',
  description = 'Código QR para instalación móvil'
}) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h2>
        <div className="flex justify-center">
          <InstallQR
            size={size}
            className={`mb-4 ${qrClassName}`}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            https://transync1.netlify.app/install
          </p>
        </div>
      </div>

      {/* Botón de instalación automática */}
      {showInstallButton && <PWAButton />}
    </div>
  );
};

export default QRWithInstall;