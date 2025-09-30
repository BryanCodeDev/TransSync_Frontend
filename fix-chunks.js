#!/usr/bin/env node

/**
 * Script específico para corregir problemas de chunks JavaScript
 * Uso: node fix-chunks.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo problemas de chunks JavaScript...\n');

// Función para limpiar archivos de build antiguos
function clearBuildFiles() {
  console.log('🗑️  Limpiando archivos de build antiguos...');

  const buildDir = path.join(process.cwd(), 'build');
  const nodeModulesDir = path.join(process.cwd(), 'node_modules');

  // Eliminar directorio build si existe
  if (fs.existsSync(buildDir)) {
    console.log('  - Eliminando directorio build/');
    fs.rmSync(buildDir, { recursive: true, force: true });
  }

  // Limpiar caché de node_modules si existe
  const nmCacheDir = path.join(nodeModulesDir, '.cache');
  if (fs.existsSync(nmCacheDir)) {
    console.log('  - Eliminando caché de node_modules');
    fs.rmSync(nmCacheDir, { recursive: true, force: true });
  }

  // Limpiar archivos temporales comunes que pueden causar problemas de chunks
  const tempFiles = ['.env.local', '.env.development.local', '.env.test.local'];
  tempFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`  - Eliminando archivo temporal: ${file}`);
      fs.unlinkSync(filePath);
    }
  });

  console.log('  ✅ Archivos de build limpiados');
}

// Función para verificar configuración de desarrollo
function checkDevConfig() {
  console.log('\n🔍 Verificando configuración de desarrollo...');

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('  ❌ package.json no encontrado');
    return false;
  }

  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Verificar scripts de desarrollo
  const devScript = packageContent.scripts?.start;
  if (devScript && devScript.includes('react-scripts start')) {
    console.log('  ✅ Script de desarrollo configurado correctamente');
  } else {
    console.log('  ⚠️  Script de desarrollo podría necesitar revisión');
  }

  // Verificar dependencias críticas
  const criticalDeps = ['react', 'react-dom', 'react-scripts'];
  let depsOk = true;

  criticalDeps.forEach(dep => {
    if (packageContent.dependencies?.[dep]) {
      console.log(`  ✅ ${dep}: ${packageContent.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: NO ENCONTRADO`);
      depsOk = false;
    }
  });

  return depsOk;
}

// Función para generar configuración de desarrollo optimizada
function generateDevConfig() {
  console.log('\n⚙️  Generando configuración de desarrollo optimizada...');

  const devConfig = {
    // Configuración para desarrollo
    devServer: {
      port: 3000,
      host: 'localhost',
      https: false,
      open: false,
      hot: true,
      liveReload: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      },
      static: {
        directory: path.join(process.cwd(), 'public'),
        serveIndex: true,
        watch: true
      },
      historyApiFallback: {
        disableDotRule: true,
        index: '/index.html'
      }
    },

    // Headers para desarrollo
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    },

    // Configuración específica para prevenir problemas de chunks
    webpackConfig: {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 5
            }
          }
        },
        runtimeChunk: {
          name: 'runtime'
        }
      },
      resolve: {
        fallback: {
          "fs": false,
          "path": false,
          "os": false
        }
      }
    }
  };

  try {
    fs.writeFileSync('dev-config.json', JSON.stringify(devConfig, null, 2));
    console.log('  ✅ Configuración de desarrollo generada');
  } catch (error) {
    console.log('  ❌ Error generando configuración de desarrollo:', error.message);
  }
}

// Función para crear configuración específica para producción
function createProductionConfig() {
  console.log('\n🏭 Creando configuración de producción optimizada...');

  const prodConfig = {
    // Configuración específica para producción
    build: {
      optimization: {
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // ~244KB para evitar problemas de carga
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
              enforce: true
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 10
            }
          }
        },
        runtimeChunk: {
          name: 'runtime'
        }
      },
      performance: {
        hints: 'warning',
        maxEntrypointSize: 512000, // 512KB
        maxAssetSize: 512000 // 512KB
      }
    },

    // Configuración de service worker para mejor cacheo
    serviceWorker: {
      enabled: true,
      registrationScope: '/',
      updateStrategy: 'cache-first'
    }
  };

  try {
    fs.writeFileSync('prod-config.json', JSON.stringify(prodConfig, null, 2));
    console.log('  ✅ Configuración de producción creada');
  } catch (error) {
    console.log('  ❌ Error creando configuración de producción:', error.message);
  }
}

// Función para crear script de limpieza de navegador
function createBrowserCleanupScript() {
  console.log('\n🌐 Creando script de limpieza de navegador...');

  const browserScript = `
// Script para limpiar caché del navegador y datos problemáticos
// Ejecutar en consola del navegador (F12 -> Console)

console.log('🧹 Iniciando limpieza de datos del navegador...');

// Limpiar localStorage
const keysToRemove = [
  'authToken', 'userToken', 'token', 'userData', 'isAuthenticated',
  'userName', 'userRole', 'userEmail', 'userId', 'empresaId',
  'rememberedEmail', 'rememberMe'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies relacionadas
document.cookie.split(";").forEach(cookie => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

  // Solo eliminar cookies relacionadas con la aplicación
  if (name.includes('transsync') || name.includes('auth') || name.includes('user')) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    console.log('✅ Cookie eliminada:', name);
  }
});

// Forzar recarga de la página
console.log('🔄 Recargando página...');
window.location.reload(true);

console.log('🎉 ¡Limpieza completada!');
`;

  try {
    fs.writeFileSync('browser-cleanup.js', browserScript);
    console.log('  ✅ Script de limpieza de navegador creado');
    console.log('  📋 Para usar: Copiar y pegar el contenido en la consola del navegador');
  } catch (error) {
    console.log('  ❌ Error creando script de limpieza:', error.message);
  }
}

// Función principal
async function fixChunks() {
  try {
    console.log('🚀 Iniciando corrección de problemas de chunks...\n');

    clearBuildFiles();
    console.log('');

    const devConfigOk = checkDevConfig();
    console.log('');

    generateDevConfig();
    console.log('');

    createProductionConfig();
    console.log('');

    createBrowserCleanupScript();
    console.log('');

    console.log('📋 Pasos para completar la corrección:');
    console.log('  1. Ejecutar: npm install');
    console.log('  2. Ejecutar: npm start');
    console.log('  3. Abrir consola del navegador (F12)');
    console.log('  4. Copiar contenido de browser-cleanup.js y ejecutar');
    console.log('  5. Recargar la página');

    if (devConfigOk) {
      console.log('\n✅ Configuración de desarrollo verificada');
    } else {
      console.log('\n⚠️  Revisa la configuración de desarrollo');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixChunks();
}

module.exports = { fixChunks };