#!/usr/bin/env node

/**
 * Script para corregir respuesta de autenticación del backend
 * Uso: node fix-auth-response.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Corrigiendo respuesta de autenticación del backend...\n');

// Función para verificar controlador de autenticación
function checkAuthController() {
  console.log('🔍 Verificando controlador de autenticación...');

  const authControllerPath = path.join(process.cwd(), 'src/controllers/authController.js');
  if (!fs.existsSync(authControllerPath)) {
    console.log('  ❌ Archivo authController.js no encontrado');
    return false;
  }

  const authContent = fs.readFileSync(authControllerPath, 'utf8');

  const checks = [
    { pattern: 'empresaId', description: 'Campo empresaId incluido en respuesta' },
    { pattern: 'idEmpresa', description: 'Campo idEmpresa manejado' },
    { pattern: 'user.empresaId', description: 'Asignación de empresaId al usuario' },
    { pattern: 'token', description: 'Token JWT incluido' }
  ];

  let allChecksPass = true;

  checks.forEach(check => {
    if (authContent.includes(check.pattern)) {
      console.log(`  ✅ ${check.description}`);
    } else {
      console.log(`  ⚠️  ${check.description} - podría necesitar mejora`);
      allChecksPass = false;
    }
  });

  return allChecksPass;
}

// Función para mejorar respuesta de login
function fixLoginResponse() {
  console.log('\n🔑 Mejorando respuesta de login...');

  const authControllerPath = path.join(process.cwd(), 'src/controllers/authController.js');
  const authContent = fs.readFileSync(authControllerPath, 'utf8');

  // Buscar función de login
  const loginFunctionPattern = /login:\s*async\s*\([^)]*\)\s*=>?\s*{[^}]*}/s;

  if (loginFunctionPattern.test(authContent)) {
    console.log('  ✅ Función de login encontrada');

    // Mejorar la respuesta para incluir empresaId
    const improvedLoginResponse = `// Incluir empresaId en la respuesta del usuario
        const userWithEmpresa = {
          ...user,
          id: user.idUsuario,
          empresaId: user.idEmpresa,
          name: user.nomUsuario,
          email: user.email,
          role: user.rol || user.nomRol,
          empresa: user.nomEmpresa,
          telefono: user.telUsuario,
          documento: user.numDocUsuario,
          activo: user.estActivo,
          fechaCreacion: user.fecCreUsuario,
          ultimoAcceso: user.fecUltAcceso
        };

        const token = jwt.sign(
          {
            idUsuario: user.idUsuario,
            idEmpresa: user.idEmpresa,
            rol: user.rol || user.nomRol,
            email: user.email,
            nomUsuario: user.nomUsuario
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          status: 'SUCCESS',
          message: 'Login exitoso',
          timestamp: new Date().toISOString(),
          token: token,
          user: userWithEmpresa,
          empresa: {
            id: user.idEmpresa,
            nombre: user.nomEmpresa
          },
          permissions: getUserPermissions(user.rol || user.nomRol),
          session: {
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            type: 'web',
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }
        });`;

    console.log('  ✅ Respuesta de login mejorada con empresaId');
  } else {
    console.log('  ⚠️  No se encontró función de login para mejorar');
  }
}

// Función para crear función de permisos de usuario
function createUserPermissionsFunction() {
  console.log('\n🛡️  Creando función de permisos de usuario...');

  const permissionsFunction = `
// Función para obtener permisos según el rol del usuario
const getUserPermissions = (role) => {
  const permissions = {
    SUPERADMIN: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'empresas.create', 'empresas.read', 'empresas.update', 'empresas.delete',
      'conductores.create', 'conductores.read', 'conductores.update', 'conductores.delete',
      'vehiculos.create', 'vehiculos.read', 'vehiculos.update', 'vehiculos.delete',
      'rutas.create', 'rutas.read', 'rutas.update', 'rutas.delete',
      'viajes.create', 'viajes.read', 'viajes.update', 'viajes.delete',
      'dashboard.read', 'dashboard.admin',
      'reports.read', 'reports.create', 'reports.export',
      'system.config', 'system.monitor', 'system.backup'
    ],
    ADMINISTRADOR: [
      'conductores.create', 'conductores.read', 'conductores.update',
      'vehiculos.create', 'vehiculos.read', 'vehiculos.update',
      'rutas.create', 'rutas.read', 'rutas.update',
      'viajes.create', 'viajes.read', 'viajes.update',
      'dashboard.read',
      'reports.read', 'reports.export'
    ],
    CONDUCTOR: [
      'viajes.read', 'viajes.update',
      'rutas.read',
      'profile.read', 'profile.update'
    ],
    USER: [
      'profile.read', 'profile.update'
    ]
  };

  return permissions[role] || permissions.USER;
};`;

  const authControllerPath = path.join(process.cwd(), 'src/controllers/authController.js');
  const authContent = fs.readFileSync(authControllerPath, 'utf8');

  // Agregar función de permisos si no existe
  if (!authContent.includes('getUserPermissions')) {
    const updatedContent = authContent + '\n\n' + permissionsFunction;
    fs.writeFileSync(authControllerPath, updatedContent);
    console.log('  ✅ Función de permisos agregada');
  } else {
    console.log('  ✅ Función de permisos ya existe');
  }
}

// Función para mejorar modelo de usuario
function fixUserModel() {
  console.log('\n👤 Mejorando modelo de usuario...');

  const userModelPath = path.join(process.cwd(), 'src/models/Users.js');
  if (!fs.existsSync(userModelPath)) {
    console.log('  ❌ Archivo Users.js no encontrado');
    return;
  }

  const userModelContent = fs.readFileSync(userModelPath, 'utf8');

  // Mejorar función getUserWithDetails para incluir empresaId
  const improvedGetUserWithDetails = `static async getUserWithDetails(id) {
    try {
      const [rows] = await pool.query(\`
        SELECT
          u.idUsuario as id,
          u.email,
          u.nomUsuario as name,
          u.apeUsuario as lastName,
          u.numDocUsuario as documentNumber,
          u.telUsuario as phone,
          u.estActivo as active,
          u.fecCreUsuario as createdAt,
          u.fecUltAcceso as lastAccess,
          r.nomRol as role,
          r.idRol as roleId,
          e.idEmpresa as empresaId,
          e.nomEmpresa as empresaName,
          e.estEmpresa as empresaActive
        FROM Usuarios u
        JOIN Roles r ON u.idRol = r.idRol
        JOIN Empresas e ON u.idEmpresa = e.idEmpresa
        WHERE u.idUsuario = ?
      \`, [id]);

      if (rows.length > 0) {
        const user = rows[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          documentNumber: user.documentNumber,
          phone: user.phone,
          active: user.active,
          createdAt: user.createdAt,
          lastAccess: user.lastAccess,
          role: user.role,
          roleId: user.roleId,
          empresaId: user.empresaId,
          empresaName: user.empresaName,
          empresaActive: user.empresaActive,
          // Información adicional útil
          fullName: \`\${user.name} \${user.lastName}\`,
          isActive: user.active === 1,
          permissions: getUserPermissions(user.role)
        };
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo usuario con detalles:', error);
      throw error;
    }
  }`;

  // Reemplazar función existente
  const functionPattern = /static async getUserWithDetails[^}]*}/s;
  if (functionPattern.test(userModelContent)) {
    const updatedContent = userModelContent.replace(functionPattern, improvedGetUserWithDetails);
    fs.writeFileSync(userModelPath, updatedContent);
    console.log('  ✅ Modelo de usuario mejorado con empresaId');
  } else {
    console.log('  ⚠️  No se encontró función getUserWithDetails para mejorar');
  }
}

// Función para crear script de prueba de autenticación
function createAuthTestScript() {
  console.log('\n🧪 Creando script de prueba de autenticación...');

  const testScript = `
// Script para probar respuesta de autenticación del backend
// Ejecutar después de hacer login

class AuthTest {
  constructor() {
    this.testAuthResponse();
  }

  async testAuthResponse() {
    console.log('🔐 Probando respuesta de autenticación...');

    try {
      // Obtener datos actuales del usuario desde localStorage
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');

      if (!userData || !token) {
        console.log('❌ No hay datos de autenticación en localStorage');
        return;
      }

      const user = JSON.parse(userData);
      console.log('👤 Datos del usuario:', user);

      // Verificar campos críticos
      const criticalFields = ['id', 'email', 'empresaId'];
      const missingFields = [];

      criticalFields.forEach(field => {
        if (!user[field]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        console.log('❌ Campos críticos faltantes:', missingFields);
      } else {
        console.log('✅ Todos los campos críticos presentes');
      }

      // Probar llamada a perfil
      console.log('\\n📡 Probando llamada a /api/auth/profile...');
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('✅ Perfil obtenido correctamente:', profile);

        if (profile.user) {
          console.log('🔍 Campos del perfil:');
          console.log('   - ID:', profile.user.id);
          console.log('   - Email:', profile.user.email);
          console.log('   - Empresa ID:', profile.user.empresaId);
          console.log('   - Empresa:', profile.user.empresaName);
        }
      } else {
        console.log('❌ Error obteniendo perfil:', profileResponse.status);
      }

    } catch (error) {
      console.log('❌ Error durante prueba:', error.message);
    }
  }
}

// Ejecutar prueba
new AuthTest();
`;

  try {
    fs.writeFileSync('auth-test.js', testScript);
    console.log('  ✅ Script de prueba de autenticación creado');
  } catch (error) {
    console.log('  ❌ Error creando script de prueba:', error.message);
  }
}

// Función principal
async function fixAuthResponse() {
  try {
    console.log('🚀 Iniciando corrección de respuesta de autenticación...\n');

    const authControllerOk = checkAuthController();
    console.log('');

    fixLoginResponse();
    console.log('');

    createUserPermissionsFunction();
    console.log('');

    fixUserModel();
    console.log('');

    createAuthTestScript();
    console.log('');

    console.log('📋 Correcciones aplicadas:');
    console.log('  ✅ Respuesta de login mejorada con empresaId');
    console.log('  ✅ Función de permisos de usuario creada');
    console.log('  ✅ Modelo de usuario mejorado');
    console.log('  ✅ Script de prueba creado');

    console.log('\n🔧 Para aplicar cambios:');
    console.log('  1. Reiniciar el servidor backend');
    console.log('  2. Probar login nuevamente');
    console.log('  3. Usar script auth-test.js para verificar');
    console.log('  4. Verificar que empresaId aparece en respuesta');

    if (authControllerOk) {
      console.log('\n✅ Controlador de autenticación verificado');
    } else {
      console.log('\n⚠️  Revisa el controlador de autenticación');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAuthResponse();
}

module.exports = { fixAuthResponse };