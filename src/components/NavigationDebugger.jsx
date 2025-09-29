import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, getUserRole, isAuthenticated } from '../utilidades/authAPI';

/**
 * Componente de debugging para problemas de navegación
 * Solo visible en desarrollo
 */
const NavigationDebugger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, userRole, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  // Solo mostrar en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const updateDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        location: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          state: location.state
        },
        auth: {
          isLoggedIn,
          userRole,
          loading,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null
        },
        localStorage: {
          hasToken: !!localStorage.getItem('authToken'),
          hasUserData: !!localStorage.getItem('userData'),
          isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
          userRole: localStorage.getItem('userRole'),
          userName: localStorage.getItem('userName'),
          userEmail: localStorage.getItem('userEmail')
        },
        navigation: {
          canGoBack: window.history.length > 1,
          currentIndex: window.history.state?.idx || 0
        }
      };

      setDebugInfo(info);
    };

    updateDebugInfo();

    // Actualizar cada 2 segundos
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, [location, isLoggedIn, user, userRole, loading]);

  // No mostrar en producción
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testNavigation = (path) => {
    console.log(`🧭 Testing navigation to: ${path}`);
    navigate(path);
  };

  const clearAuthData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const refreshAuth = () => {
    // Disparar evento personalizado para refrescar auth
    window.dispatchEvent(new Event('auth:login'));
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg hover:bg-gray-800 transition-colors"
      >
        🐛 Debug
      </button>

      {showDebug && (
        <div className="mt-2 bg-black/90 text-green-400 p-4 rounded-lg text-xs font-mono max-h-96 overflow-auto shadow-xl">
          <div className="space-y-2">
            <div>
              <div className="text-yellow-400 font-bold">📍 Location:</div>
              <div>Path: {debugInfo.location?.pathname}</div>
              <div>Search: {debugInfo.location?.search}</div>
              <div>State: {JSON.stringify(debugInfo.location?.state)}</div>
            </div>

            <div>
              <div className="text-yellow-400 font-bold">🔐 Auth Status:</div>
              <div>Logged In: {debugInfo.auth?.isLoggedIn ? '✅' : '❌'}</div>
              <div>Role: {debugInfo.auth?.userRole || 'N/A'}</div>
              <div>Loading: {debugInfo.auth?.loading ? '⏳' : '✅'}</div>
            </div>

            <div>
              <div className="text-yellow-400 font-bold">💾 LocalStorage:</div>
              <div>Token: {debugInfo.localStorage?.hasToken ? '✅' : '❌'}</div>
              <div>UserData: {debugInfo.localStorage?.hasUserData ? '✅' : '❌'}</div>
              <div>Auth: {debugInfo.localStorage?.isAuthenticated ? '✅' : '❌'}</div>
            </div>

            <div>
              <div className="text-yellow-400 font-bold">🧭 Navigation:</div>
              <div>Can Go Back: {debugInfo.navigation?.canGoBack ? '✅' : '❌'}</div>
              <div>History Index: {debugInfo.navigation?.currentIndex}</div>
            </div>

            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="text-yellow-400 font-bold mb-2">🧪 Test Navigation:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <button
                  onClick={() => testNavigation('/home')}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                >
                  /home
                </button>
                <button
                  onClick={() => testNavigation('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                >
                  /dashboard
                </button>
                <button
                  onClick={() => testNavigation('/login')}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                >
                  /login
                </button>
                <button
                  onClick={() => testNavigation('/profile')}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                >
                  /profile
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <button
                  onClick={refreshAuth}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded w-full text-xs"
                >
                  🔄 Refresh Auth
                </button>
                <button
                  onClick={clearAuthData}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded w-full text-xs"
                >
                  🗑️ Clear Auth Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationDebugger;