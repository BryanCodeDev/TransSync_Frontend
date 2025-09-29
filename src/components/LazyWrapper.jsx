import React, { useState, useEffect } from 'react';

/**
 * Wrapper personalizado para lazy loading con reintentos
 */
const LazyWrapper = ({ importFunc, fallback, maxRetries = 3, ...props }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setError(null);
        const module = await importFunc();
        if (mounted) {
          setComponent(() => module.default);
          setRetryCount(0);
        }
      } catch (err) {
        console.error(`Error loading component (attempt ${retryCount + 1}):`, err);
        if (mounted) {
          setError(err);

          // Reintentar si no hemos excedido el máximo
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000 * (retryCount + 1)); // Backoff exponencial
          }
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [importFunc, retryCount, maxRetries]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setComponent(null);
  };

  // Si hay un componente cargado, renderizarlo
  if (Component) {
    return <Component {...props} />;
  }

  // Si hay error y hemos excedido reintentos, mostrar error
  if (error && retryCount >= maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar la página
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
          No se pudo cargar esta página después de varios intentos. Esto puede deberse a problemas de conexión o cache.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/home'}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left max-w-lg">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
              Detalles del error (desarrollo)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
              {error?.message || 'Error desconocido'}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Mostrar fallback de carga o error
  return fallback || (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-4 border-primary-100 dark:border-primary-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-3"></div>
      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
        {error ? `Reintentando... (${retryCount}/${maxRetries})` : 'Cargando...'}
      </p>
    </div>
  );
};

export default LazyWrapper;