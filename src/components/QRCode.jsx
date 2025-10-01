import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

const QRCode = ({ url, size = 256, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#1a237e',  // Color primario de TransSync
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('Error generando código QR:', err);
      });
    }
  }, [url, size]);

  return (
    <div className={`inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="border-2 border-gray-200 rounded-lg shadow-lg"
      />
    </div>
  );
};

export default QRCode;