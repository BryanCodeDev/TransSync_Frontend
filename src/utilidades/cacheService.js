const cacheService = {
  // Cache en memoria usando Map para mejor rendimiento
  memoryCache: new Map(),

  // Configuración del cache optimizada
  config: {
    defaultTTL: 10 * 60 * 1000, // 10 minutos (aumentado)
    maxSize: 200, // Máximo 200 entradas (aumentado)
    cleanupInterval: 2 * 60 * 1000, // Limpieza cada 2 minutos
    compressionEnabled: true,
    enableMetrics: true,
    enableAutoCleanup: true
  },

  // Estadísticas del cache mejoradas
  stats: {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    size: 0,
    lastCleanup: Date.now(),
    totalRequests: 0
  },

  /**
   * Inicializar el servicio de cache
   */
  init: function() {
    const self = this;
    // Iniciar limpieza automática
    setInterval(() => {
      self.cleanup();
    }, self.config.cleanupInterval);

    
  },

  /**
   * Generar clave de cache inteligente
   */
  generateCacheKey: function(query, params = [], userContext = {}) {
    const keyData = {
      query: query.toLowerCase().trim(),
      params: params,
      userId: userContext.idUsuario,
      empresaId: userContext.idEmpresa,
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // Agrupar por intervalos de 5 minutos
    };

    // Crear hash simple para la clave
    const keyString = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }

    return `query_${Math.abs(hash)}`;
  },

  /**
   * Obtener datos del cache
   */
  get: function(key) {
    const cached = this.memoryCache.get(key);

    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Verificar si expiró
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cached.data;
  },

  /**
   * Almacenar datos en cache
   */
  set: function(key, data, ttl = this.config.defaultTTL) {
    // Verificar límite de tamaño
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const cacheEntry = {
      data: data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      accessCount: 0,
      lastAccess: Date.now()
    };

    this.memoryCache.set(key, cacheEntry);
    this.stats.sets++;
    this.stats.size = this.memoryCache.size;
  },

  /**
   * Eliminar entrada del cache
   */
  delete: function(key) {
    const deleted = this.memoryCache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.memoryCache.size;
    }
    return deleted;
  },

  /**
   * Limpiar cache completo
   */
  clear: function() {
    const size = this.memoryCache.size;
    this.memoryCache.clear();
    this.stats.size = 0;
    
  },

  /**
   * Invalidar cache por patrón
   */
  invalidateByPattern: function(pattern) {
    let invalidated = 0;
    for (const [key] of this.memoryCache) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }
    this.stats.deletes += invalidated;
    this.stats.size = this.memoryCache.size;
    
  },

  /**
   * Invalidar cache por tabla
   */
  invalidateByTable: function(tableName) {
    this.invalidateByPattern(tableName.toLowerCase());
  },

  /**
   * Invalidar cache por empresa
   */
  invalidateByEmpresa: function(empresaId) {
    this.invalidateByPattern(`empresa_${empresaId}`);
  },

  /**
   * Obtener datos con cache inteligente
   */
  getWithCache: async function(query, params = [], userContext = {}, fetchFunction, options = {}) {
    const cacheKey = this.generateCacheKey(query, params, userContext);
    const ttl = options.ttl || this.config.defaultTTL;

    // Intentar obtener del cache
    let data = this.get(cacheKey);

    if (data !== null) {
      
      return data;
    }

    // Si no está en cache, ejecutar la función
    
    try {
      data = await fetchFunction();

      // Almacenar en cache si la consulta es cacheable
      if (this.isCacheable(query, params)) {
        this.set(cacheKey, data, ttl);
      }

      return data;
    } catch (error) {
      console.error('Error fetching data for cache:', error);
      throw error;
    }
  },

  /**
   * Determinar si una consulta es cacheable
   */
  isCacheable: function(query, params = []) {
    const lowerQuery = query.toLowerCase();

    // No cachear consultas de escritura
    if (lowerQuery.includes('insert') ||
        lowerQuery.includes('update') ||
        lowerQuery.includes('delete')) {
      return false;
    }

    // No cachear consultas con parámetros de tiempo actuales
    if (params.some(param =>
      param instanceof Date ||
      (typeof param === 'string' && param.match(/\d{4}-\d{2}-\d{2}/))
    )) {
      return false;
    }

    // Cachear consultas SELECT con límites
    if (lowerQuery.includes('select') && lowerQuery.includes('limit')) {
      return true;
    }

    // Cachear consultas de estadísticas
    if (lowerQuery.includes('count') || lowerQuery.includes('sum') || lowerQuery.includes('avg')) {
      return true;
    }

    return false;
  },

  /**
   * Evitar entrada más antigua (LRU)
   */
  evictOldest: function() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.stats.deletes++;
      
    }
  },

  /**
   * Limpiar entradas expiradas y datos corruptos
   */
  cleanup: function() {
    const now = Date.now();
    let cleaned = 0;
    let corrupted = 0;

    try {
      for (const [key, entry] of this.memoryCache) {
        // Verificar si expiró
        if (now > entry.expiry) {
          this.memoryCache.delete(key);
          cleaned++;
          continue;
        }

        // Verificar si los datos están corruptos
        if (this.isCorruptedData(entry.data)) {
          this.memoryCache.delete(key);
          corrupted++;
          continue;
        }

        // Verificar tamaño de entrada (evitar memory leaks)
        const entrySize = JSON.stringify(entry.data).length;
        if (entrySize > 1024 * 1024) { // 1MB límite
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0 || corrupted > 0) {
        this.stats.deletes += (cleaned + corrupted);
        this.stats.size = this.memoryCache.size;
        this.stats.lastCleanup = now;

        if (corrupted > 0) {
          console.log(`🧹 Cache limpiado: ${cleaned} expirados, ${corrupted} corruptos`);
        }
      }
    } catch (error) {
      console.error('❌ Error durante limpieza de cache:', error);
      this.stats.errors++;
    }
  },

  /**
   * Verificar si los datos están corruptos
   */
  isCorruptedData: function(data) {
    try {
      // Verificar si es null o undefined
      if (data === null || data === undefined) {
        return true;
      }

      // Verificar si es un objeto/array válido
      if (typeof data === 'object') {
        const jsonString = JSON.stringify(data);
        if (jsonString === '{}' || jsonString === '[]') {
          return true;
        }
      }

      // Verificar si es un string vacío o con solo espacios
      if (typeof data === 'string' && data.trim() === '') {
        return true;
      }

      return false;
    } catch (error) {
      return true; // Si no se puede verificar, asumir corrupto
    }
  },

  /**
   * Obtener estadísticas del cache
   */
  getStats: function() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      size: this.memoryCache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        key: key,
        size: JSON.stringify(entry.data).length,
        age: Date.now() - entry.timestamp,
        expiry: entry.expiry - Date.now(),
        accessCount: entry.accessCount
      }))
    };
  },

  /**
   * Optimizar cache basado en patrones de uso
   */
  optimize: function() {
    const stats = this.getStats();

    // Si el hit rate es bajo, aumentar TTL
    if (stats.hitRate < 50) {
      this.config.defaultTTL *= 1.5;
      
    }

    // Si el cache está muy lleno, reducir TTL
    if (stats.size > this.config.maxSize * 0.8) {
      this.config.defaultTTL *= 0.8;
      
    }

    // Limpiar entradas poco accedidas
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache) {
      // Si no se accede en más de 2 horas, considerar para limpieza
      if (now - entry.lastAccess > 2 * 60 * 60 * 1000) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      
    }
  },

  /**
   * Pre-cargar datos comunes
   */
  preloadCommonQueries: async function(userContext, apiClient) {
    // Solo pre-cargar si tenemos contexto de usuario válido
    if (!userContext || !userContext.idEmpresa) {
      
      return;
    }

    const commonQueries = [
      {
        name: 'active_drivers',
        query: 'SELECT COUNT(*) as count FROM Conductores WHERE estConductor = ? AND idEmpresa = ?',
        params: ['ACTIVO', userContext.idEmpresa]
      },
      {
        name: 'available_vehicles',
        query: 'SELECT COUNT(*) as count FROM Vehiculos WHERE estVehiculo = ? AND idEmpresa = ?',
        params: ['DISPONIBLE', userContext.idEmpresa]
      },
      {
        name: 'today_trips',
        query: 'SELECT COUNT(*) as count FROM Viajes WHERE DATE(fecHorSalViaje) = CURDATE() AND idEmpresa = ?',
        params: [userContext.idEmpresa]
      }
    ];

    for (const query of commonQueries) {
      try {
        const cacheKey = this.generateCacheKey(query.query, query.params, userContext);
        const data = await apiClient.post('/api/chatbot/query', {
          sql: query.query,
          params: query.params
        });

        this.set(cacheKey, data.data, this.config.defaultTTL * 2); // TTL más largo para datos comunes
        
      } catch (error) {
        
        // No propagar el error para evitar romper la inicialización
      }
    }
  },

  /**
   * Actualizar acceso a entrada del cache
   */
  touch: function(key) {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      entry.accessCount++;
    }
  }
};

// Inicializar el servicio
cacheService.init();

export default cacheService;