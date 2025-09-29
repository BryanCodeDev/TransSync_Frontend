#!/usr/bin/env node

/**
 * Script para verificar la configuración de despliegue y detectar problemas comunes
 * Uso: node verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de despliegue...\n');

// Función para verificar archivos críticos
function checkCriticalFiles() {
  console.log('📁 Verificando archivos críticos:');

  const criticalFiles = [
    { path: 'public/index.html', description: 'Archivo HTML principal' },
    { path: 'public/manifest.json', description: 'Manifiesto PWA' },
    { path: 'public/_redirects', description: 'Reglas de redirección' },
    { path: 'netlify.toml', description: 'Configuración de Netlify' },
    { path: 'package.json', description: 'Dependencias del proyecto' },
    { path: 'src/index.jsx', description: 'Punto de entrada de React' },
    { path: 'src/App.jsx', description: 'Componente principal de la aplicación' }
  ];

  let allFilesExist = true;

  criticalFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const stats = fs.statSync(filePath);
      console.log(`  ✅ ${file.description}: ${file.path} (${stats.size} bytes)`);
    } else {
      console.log(`  ❌ ${file.description}: ${file.path} - NO ENCONTRADO`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Función para verificar reglas de redirección
function checkRedirectRules() {
  console.log('\n🔀 Verificando reglas de redirección:');

  const redirectsPath = path.join(process.cwd(), 'public/_redirects');
  if (!fs.existsSync(redirectsPath)) {
    console.log('  ❌ Archivo _redirects no encontrado');
    return false;
  }

  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  const lines = redirectsContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  const issues = [];
  let hasJavaScriptRules = false;
  let hasApiProxy = false;
  let hasSpaFallback = false;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.includes('/static/js/') && trimmedLine.includes('200')) {
      hasJavaScriptRules = true;
    }

    if (trimmedLine.includes('/api/') && trimmedLine.includes('https://transyncbackend-production.up.railway.app')) {
      hasApiProxy = true;
    }

    if (trimmedLine === '/*    /index.html   200') {
      hasSpaFallback = true;
    }
  });

  if (hasJavaScriptRules) {
    console.log('  ✅ Reglas de JavaScript encontradas');
  } else {
    issues.push('Faltan reglas para archivos JavaScript');
  }

  if (hasApiProxy) {
    console.log('  ✅ Proxy API configurado');
  } else {
    issues.push('Falta configuración de proxy API');
  }

  if (hasSpaFallback) {
    console.log('  ✅ SPA fallback configurado');
  } else {
    issues.push('Falta configuración de SPA fallback');
  }

  if (issues.length > 0) {
    console.log('  ⚠️  Problemas encontrados:');
    issues.forEach(issue => console.log(`    - ${issue}`));
    return false;
  }

  return true;
}

// Función para verificar configuración de Netlify
function checkNetlifyConfig() {
  console.log('\n⚙️  Verificando configuración de Netlify:');

  const netlifyPath = path.join(process.cwd(), 'netlify.toml');
  if (!fs.existsSync(netlifyPath)) {
    console.log('  ❌ Archivo netlify.toml no encontrado');
    return false;
  }

  const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');

  const checks = [
    { pattern: 'NODE_VERSION = "20"', description: 'Versión de Node.js' },
    { pattern: 'REACT_APP_API_URL', description: 'Variables de entorno API' },
    { pattern: 'application/javascript', description: 'MIME types JavaScript' },
    { pattern: 'Cache-Control', description: 'Configuración de caché' }
  ];

  let allChecksPass = true;

  checks.forEach(check => {
    if (netlifyContent.includes(check.pattern)) {
      console.log(`  ✅ ${check.description} configurado`);
    } else {
      console.log(`  ⚠️  ${check.description} podría necesitar configuración`);
      allChecksPass = false;
    }
  });

  return allChecksPass;
}

// Función para verificar dependencias críticas
function checkDependencies() {
  console.log('\n📦 Verificando dependencias críticas:');

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log('  ❌ Archivo package.json no encontrado');
    return false;
  }

  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const criticalDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    'socket.io-client'
  ];

  let allDepsPresent = true;

  criticalDeps.forEach(dep => {
    if (packageContent.dependencies && packageContent.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${packageContent.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: NO ENCONTRADO`);
      allDepsPresent = false;
    }
  });

  return allDepsPresent;
}

// Función para generar recomendaciones
function generateRecommendations(results) {
  console.log('\n💡 Recomendaciones:');

  const recommendations = [];

  if (!results.filesOk) {
    recommendations.push('Verificar que todos los archivos críticos estén presentes');
  }

  if (!results.redirectsOk) {
    recommendations.push('Revisar reglas de redirección en public/_redirects');
    recommendations.push('Asegurar que las reglas de JavaScript estén ANTES del SPA fallback');
  }

  if (!results.netlifyOk) {
    recommendations.push('Revisar configuración en netlify.toml');
    recommendations.push('Verificar variables de entorno y headers de seguridad');
  }

  if (!results.depsOk) {
    recommendations.push('Ejecutar npm install para instalar dependencias faltantes');
  }

  recommendations.push('Limpiar caché del navegador después del despliegue');
  recommendations.push('Verificar logs de despliegue en Netlify para errores');
  recommendations.push('Probar la aplicación en modo incógnito para evitar problemas de caché');

  recommendations.forEach(rec => {
    console.log(`  • ${rec}`);
  });
}

// Función principal de verificación
async function runVerification() {
  try {
    console.log('🚀 Iniciando verificación de despliegue...\n');

    const results = {
      filesOk: checkCriticalFiles(),
      redirectsOk: checkRedirectRules(),
      netlifyOk: checkNetlifyConfig(),
      depsOk: checkDependencies()
    };

    console.log('\n📊 Resumen de verificación:');
    console.log(`  Archivos críticos: ${results.filesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`  Reglas de redirección: ${results.redirectsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
    console.log(`  Configuración Netlify: ${results.netlifyOk ? '✅ OK' : '⚠️ REVISAR'}`);
    console.log(`  Dependencias: ${results.depsOk ? '✅ OK' : '❌ PROBLEMAS'}`);

    generateRecommendations(results);

    const allOk = Object.values(results).every(result => result === true);

    if (allOk) {
      console.log('\n🎉 ¡Verificación completada! La configuración parece estar correcta.');
      console.log('✅ Listo para desplegar');
    } else {
      console.log('\n⚠️  Se encontraron algunos problemas que deberían ser revisados.');
      console.log('🔧 Revisa las recomendaciones arriba y corrige los problemas antes de desplegar.');
    }

    return allOk;

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runVerification().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runVerification };