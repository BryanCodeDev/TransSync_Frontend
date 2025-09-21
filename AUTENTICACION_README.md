# Sistema de Autenticación Mejorado - TransSync

## 📋 Descripción

Se ha implementado un sistema robusto de detección de sesión en tiempo real para el Navbar y toda la aplicación. El sistema ahora detecta automáticamente cambios en la sesión del usuario y actualiza la interfaz en consecuencia.

## 🚀 Características Implementadas

### ✅ Hook Personalizado `useAuth`
- **Detección en tiempo real** de cambios de sesión
- **Listeners de localStorage** para detectar login/logout desde otras pestañas
- **Verificación periódica** del estado de autenticación
- **Manejo de errores** robusto
- **Estados de carga** para mejor UX

### ✅ Contexto de Autenticación Global
- **AuthProvider** para compartir estado entre componentes
- **useAuthContext** hook para acceso fácil
- **Gestión centralizada** de la autenticación

### ✅ Navbar Mejorado
- **Detección automática** de sesión iniciada/cerrada
- **Indicador de carga** mientras verifica autenticación
- **Actualización en tiempo real** del estado del usuario
- **Transiciones suaves** entre estados

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
- `src/hooks/useAuth.js` - Hook personalizado para autenticación
- `src/context/AuthContext.jsx` - Contexto global de autenticación
- `src/components/AuthStatus.jsx` - Componente de ejemplo de uso

### Archivos Modificados:
- `src/components/Navbar.jsx` - Integración del nuevo sistema de autenticación
- `.env.example` - Variables de entorno actualizadas

## 🔧 Instalación y Configuración

### 1. Variables de Entorno
Asegúrate de tener estas variables en tu `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000
```

### 2. Integración en App.jsx
Para usar el contexto global, envuelve tu aplicación:

```jsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Tu aplicación */}
    </AuthProvider>
  );
}
```

## 💡 Uso Básico

### En cualquier componente:
```jsx
import { useAuthContext } from '../context/AuthContext';

const MiComponente = () => {
  const { isLoggedIn, user, userRole, loading, logout } = useAuthContext();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (isLoggedIn) {
    return <div>Bienvenido, {user.name}</div>;
  }

  return <div>No autenticado</div>;
};
```

### En el Navbar (ya implementado):
```jsx
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isLoggedIn, user, userRole, logout } = useAuth();

  // El navbar se actualiza automáticamente cuando cambia la sesión
};
```

## 🔄 Eventos Detectados

### Eventos de localStorage:
- `authToken` - Detecta cambios en el token de autenticación
- `userData` - Detecta cambios en los datos del usuario

### Eventos Personalizados:
- `auth:login` - Disparado cuando el usuario inicia sesión
- `auth:logout` - Disparado cuando el usuario cierra sesión

### Verificación Periódica:
- Cada 30 segundos verifica el estado de autenticación
- Útil para detectar expiración de tokens

## 🎯 Ejemplos de Uso

### 1. Componente con Estado de Autenticación:
```jsx
const Dashboard = () => {
  const { isLoggedIn, user, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {isLoggedIn ? (
        <DashboardContent user={user} />
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
};
```

### 2. Protección de Rutas:
```jsx
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;

  return isLoggedIn ? children : <Navigate to="/login" />;
};
```

### 3. Botón de Logout Global:
```jsx
const LogoutButton = () => {
  const { logout } = useAuthContext();

  return (
    <button onClick={logout}>
      Cerrar Sesión
    </button>
  );
};
```

## 🔐 Funcionalidades de Seguridad

### ✅ Detección de Sesión Expirada
- Verificación automática de tokens válidos
- Logout automático si el token expira

### ✅ Sincronización Multi-Pestaña
- Logout en una pestaña cierra sesión en todas
- Login en una pestaña actualiza todas las pestañas

### ✅ Manejo de Errores
- Fallback a estado no autenticado en caso de error
- Logging de errores para debugging

## 🐛 Solución de Problemas

### Problema: El navbar no se actualiza al hacer login/logout
**Solución**: Asegúrate de que el evento se dispare correctamente:
```javascript
// Al hacer login
window.dispatchEvent(new CustomEvent('auth:login'));

// Al hacer logout
window.dispatchEvent(new CustomEvent('auth:logout'));
```

### Problema: Estado de carga infinito
**Solución**: Verifica que las funciones de authAPI estén funcionando:
```javascript
import { isAuthenticated } from '../utilidades/authAPI';
console.log(isAuthenticated()); // Debe retornar boolean
```

### Problema: No detecta cambios entre pestañas
**Solución**: Asegúrate de que localStorage se use para el token:
```javascript
localStorage.setItem('authToken', token);
localStorage.setItem('userData', JSON.stringify(userData));
```

## 📊 Estado de Implementación

- ✅ Hook `useAuth` - Completado
- ✅ Contexto `AuthContext` - Completado
- ✅ Navbar actualizado - Completado
- ✅ Variables de entorno - Completado
- ✅ Documentación - Completada

## 🎉 Próximos Pasos

1. **Integrar en otros componentes** que necesiten estado de autenticación
2. **Agregar protección de rutas** usando el contexto
3. **Implementar refresh token** automático
4. **Agregar tests** para el sistema de autenticación

## 📞 Soporte

Si encuentras problemas o necesitas ayuda para integrar el sistema en otros componentes, revisa los ejemplos en `src/components/AuthStatus.jsx` o consulta esta documentación.