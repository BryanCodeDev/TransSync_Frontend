// src/utilidades/conversationMemory.js - Sistema básico de memoria de conversación
class ConversationMemory {
    constructor() {
        this.memories = new Map();
        this.maxMessages = 50;
    }

    /**
     * Agregar mensaje a la memoria
     */
    addMessage(userId, message, companyId) {
        if (!userId) return;

        const key = `${userId}_${companyId || 'default'}`;
        let userMemory = this.memories.get(key);

        if (!userMemory) {
            userMemory = {
                messages: [],
                patterns: {},
                lastActivity: new Date()
            };
        }

        userMemory.messages.push({
            ...message,
            timestamp: new Date(),
            id: Date.now() + Math.random()
        });

        // Limitar mensajes
        if (userMemory.messages.length > this.maxMessages) {
            userMemory.messages = userMemory.messages.slice(-this.maxMessages);
        }

        userMemory.lastActivity = new Date();
        this.memories.set(key, userMemory);
    }

    /**
     * Obtener contexto relevante
     */
    getRelevantContext(userId, currentMessage, companyId) {
        const key = `${userId}_${companyId || 'default'}`;
        const userMemory = this.memories.get(key);

        if (!userMemory || !userMemory.messages.length) {
            return {
                recentMessages: [],
                patterns: {}
            };
        }

        return {
            recentMessages: userMemory.messages.slice(-5),
            patterns: userMemory.patterns,
            lastActivity: userMemory.lastActivity
        };
    }

    /**
     * Obtener sugerencias basadas en historial
     */
    getSuggestions(userId, companyId) {
        const key = `${userId}_${companyId || 'default'}`;
        const userMemory = this.memories.get(key);

        if (!userMemory) {
            return this.getDefaultSuggestions();
        }

        // Generar sugerencias básicas
        return this.getDefaultSuggestions();
    }

    /**
     * Obtener sugerencias por defecto
     */
    getDefaultSuggestions() {
        return [
            { text: '¿Cuántos conductores están activos?', relevance: 0.8 },
            { text: '¿Qué vehículos están disponibles?', relevance: 0.8 },
            { text: '¿Cuál es el estado del sistema?', relevance: 0.7 },
            { text: '¿Hay licencias próximas a vencer?', relevance: 0.7 }
        ];
    }

    /**
     * Limpiar memoria de usuario
     */
    clearUserMemory(userId, companyId) {
        const key = `${userId}_${companyId || 'default'}`;
        this.memories.delete(key);
    }
}

module.exports = new ConversationMemory();