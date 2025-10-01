import React, { useState, useEffect } from 'react';
import QRCode from './QRCode';

const InstallQR = ({ size = 200, className = '' }) => {
  const [installUrl, setInstallUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Crear URL de instalación directa
    const baseUrl = window.location.origin;
    const installUrl = `${baseUrl}/install`;
    setInstallUrl(installUrl);
    setIsGenerating(false);
  }, []);

  const handleQRGenerated = () => {
    console.log('Código QR de instalación generado correctamente');
  };

  if (isGenerating) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QRCode
      url={installUrl}
      size={size}
      className={className}
      onGenerated={handleQRGenerated}
    />
  );
};

export default InstallQR;