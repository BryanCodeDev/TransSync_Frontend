// src/utilidades/cacheService.js - Sistema básico de cache para chatbot
class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutos por defecto
    }

    /**
     * Obtener dato del cache
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Guardar dato en cache
     */
    set(key, data, customTtl = null) {
        const ttl = customTtl || this.ttl;
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + ttl,
            created: Date.now()
        });
    }

    /**
     * Verificar si existe en cache
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Eliminar del cache
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Limpiar todo el cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Obtener estadísticas del cache
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: 1000 // Límite arbitrario
        };
    }

    /**
     * Limpiar entradas expiradas
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

module.exports = new CacheService();