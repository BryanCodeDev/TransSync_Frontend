// Script para limpiar cache y hacer rebuild limpio
const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando cache y preparando rebuild...');

// Eliminar directorio build si existe
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  fs.rmSync(buildPath, { recursive: true, force: true });
  console.log('✅ Directorio build eliminado');
}

// Eliminar directorio node_modules/.cache si existe
const cachePath = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cachePath)) {
  fs.rmSync(cachePath, { recursive: true, force: true });
  console.log('✅ Cache de node_modules eliminado');
}

// Limpiar package-lock.json para forzar reinstalación limpia
const packageLockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath);
  console.log('✅ package-lock.json eliminado');
}

console.log('🎯 Listo para rebuild limpio');
console.log('💡 Ejecuta: npm install --legacy-peer-deps && npm run build');