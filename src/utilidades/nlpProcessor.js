// src/utilidades/nlpProcessor.js - Procesador básico de lenguaje natural para chatbot
class NLPProcessor {
    constructor() {
        this.keywords = {
            greeting: ['hola', 'buenos', 'saludos', 'hey', 'hi', 'buen', 'dias', 'tardes', 'noches'],
            farewell: ['gracias', 'thanks', 'adios', 'bye', 'chao', 'hasta', 'luego'],
            help: ['ayuda', 'help', 'que', 'puedes', 'hacer', 'opciones', 'menu', 'funciones'],
            status: ['estado', 'estatus', 'situacion', 'condicion', 'disponible', 'activo', 'inactivo'],
            count: ['cuantos', 'cuantas', 'numero', 'cantidad', 'total'],
            list: ['muestra', 'mostrar', 'lista', 'listar', 'ver', 'consulta'],
            driver: ['conductor', 'conductores', 'chofer', 'choferes', 'driver'],
            vehicle: ['vehiculo', 'vehiculos', 'bus', 'buses', 'auto', 'carro', 'flota'],
            route: ['ruta', 'rutas', 'recorrido', 'destino', 'origen'],
            schedule: ['horario', 'horarios', 'programacion', 'viaje', 'salida', 'llegada'],
            license: ['licencia', 'licencias', 'vencimiento', 'caduca', 'expira'],
            maintenance: ['mantenimiento', 'reparacion', 'arreglo', 'averiado']
        };
    }

    /**
     * Procesar mensaje y extraer información básica
     */
    processMessage(message) {
        if (!message || typeof message !== 'string') {
            return this.getFallbackAnalysis();
        }

        const tokens = message.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const intent = this.classifyIntent(tokens);
        const confidence = this.calculateConfidence(tokens, intent);
        const entities = this.extractEntities(message);

        return {
            originalMessage: message,
            tokens: tokens,
            intent: intent,
            confidence: confidence,
            entities: entities,
            complexity: this.assessComplexity(tokens)
        };
    }

    /**
     * Clasificar intención del mensaje
     */
    classifyIntent(tokens) {
        let bestIntent = 'unknown';
        let maxMatches = 0;

        for (const [intent, keywords] of Object.entries(this.keywords)) {
            const matches = tokens.filter(token => keywords.includes(token)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestIntent = intent;
            }
        }

        // Reglas específicas
        if (bestIntent === 'driver' && tokens.some(t => this.keywords.license.includes(t))) {
            return 'license_expiry';
        }
        if (bestIntent === 'vehicle' && tokens.some(t => this.keywords.maintenance.includes(t))) {
            return 'vehicle_maintenance';
        }
        if (bestIntent === 'status' && tokens.includes('general')) {
            return 'system_status';
        }

        return bestIntent;
    }

    /**
     * Calcular confianza de la clasificación
     */
    calculateConfidence(tokens, intent) {
        if (intent === 'unknown') return 0.1;

        let confidence = 0.3;

        // Más tokens = más confianza
        if (tokens.length > 3) confidence += 0.2;
        if (tokens.length > 6) confidence += 0.1;

        // Palabras específicas aumentan confianza
        const specificWords = ['cuantos', 'mostrar', 'estado', 'licencia', 'mantenimiento'];
        const specificMatches = tokens.filter(t => specificWords.includes(t)).length;
        confidence += specificMatches * 0.1;

        return Math.min(confidence, 0.9);
    }

    /**
     * Extraer entidades básicas del mensaje
     */
    extractEntities(message) {
        const entities = {
            numbers: [],
            dates: [],
            temporal: []
        };

        // Extraer números
        const numberMatches = message.match(/\d+/g);
        if (numberMatches) {
            entities.numbers = numberMatches.map(n => parseInt(n));
        }

        // Extraer expresiones temporales básicas
        const temporalWords = ['hoy', 'ayer', 'mañana', 'semana', 'mes', 'año'];
        entities.temporal = tokens.filter(token => temporalWords.includes(token));

        return entities;
    }

    /**
     * Evaluar complejidad del mensaje
     */
    assessComplexity(tokens) {
        if (tokens.length <= 2) return 1;
        if (tokens.length <= 5) return 2;
        return 3;
    }

    /**
     * Análisis fallback para errores
     */
    getFallbackAnalysis() {
        return {
            originalMessage: '',
            tokens: [],
            intent: 'unknown',
            confidence: 0.1,
            entities: { numbers: [], dates: [], temporal: [] },
            complexity: 1
        };
    }
}

module.exports = new NLPProcessor();