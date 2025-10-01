// src/utilidades/queryEngine.js - Motor de generación de consultas SQL para chatbot
const pool = require('../config/db');

class QueryEngine {
    constructor() {
        this.intentPatterns = {
            count_driver: {
                sql: 'SELECT COUNT(*) as total FROM Conductores WHERE idEmpresa = ? AND estConductor = ?',
                params: (entities, context) => ['ACTIVO'],
                complexity: 1
            },
            count_vehicle: {
                sql: 'SELECT COUNT(*) as total FROM Vehiculos WHERE idEmpresa = ? AND estVehiculo = ?',
                params: (entities, context) => ['DISPONIBLE'],
                complexity: 1
            },
            list_vehicle: {
                sql: 'SELECT plaVehiculo, modVehiculo, marVehiculo, estVehiculo FROM Vehiculos WHERE idEmpresa = ? ORDER BY plaVehiculo LIMIT 10',
                params: (entities, context) => [],
                complexity: 1
            },
            list_route: {
                sql: 'SELECT nomRuta, oriRuta, desRuta FROM Rutas WHERE idEmpresa = ? ORDER BY nomRuta LIMIT 10',
                params: (entities, context) => [],
                complexity: 1
            },
            list_schedule: {
                sql: 'SELECT v.fecHorSalViaje, v.estViaje, r.nomRuta FROM Viajes v JOIN Rutas r ON v.idRuta = r.idRuta WHERE r.idEmpresa = ? ORDER BY v.fecHorSalViaje LIMIT 10',
                params: (entities, context) => [],
                complexity: 2
            },
            license_expiry: {
                sql: 'SELECT nomConductor, apeConductor, numLicConductor, fecVenLicConductor FROM Conductores WHERE idEmpresa = ? AND fecVenLicConductor BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY fecVenLicConductor',
                params: (entities, context) => [],
                complexity: 2
            },
            vehicle_maintenance: {
                sql: 'SELECT plaVehiculo, modVehiculo, fecVenSOAT, fecVenTec FROM Vehiculos WHERE idEmpresa = ? AND (fecVenSOAT BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) OR fecVenTec BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) ORDER BY fecVenSOAT',
                params: (entities, context) => [],
                complexity: 2
            },
            system_status: {
                sql: 'SELECT COUNT(DISTINCT CASE WHEN c.estConductor = ? THEN c.idConductor END) as conductoresActivos, COUNT(DISTINCT CASE WHEN v.estVehiculo = ? THEN v.idVehiculo END) as vehiculosDisponibles, COUNT(DISTINCT CASE WHEN v.estVehiculo = ? THEN v.idVehiculo END) as vehiculosEnRuta FROM Conductores c, Vehiculos v WHERE c.idEmpresa = ? AND v.idEmpresa = ?',
                params: (entities, context) => ['ACTIVO', 'DISPONIBLE', 'EN_RUTA'],
                complexity: 3
            },
            alerts: {
                sql: 'SELECT COUNT(*) as total FROM (SELECT idConductor FROM Conductores WHERE idEmpresa = ? AND fecVenLicConductor BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) UNION ALL SELECT idVehiculo FROM Vehiculos WHERE idEmpresa = ? AND (fecVenSOAT BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) OR fecVenTec BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))) as alertas',
                params: (entities, context) => [],
                complexity: 3
            }
        };
    }

    /**
     * Generar consulta SQL basada en intención y entidades
     */
    generateQuery(intent, entities, context, userContext) {
        try {
            const pattern = this.intentPatterns[intent];

            if (!pattern) {
                return {
                    sql: null,
                    params: [],
                    complexity: 1,
                    explanation: 'Intención no reconocida'
                };
            }

            // Construir parámetros
            let params = [];
            if (typeof pattern.params === 'function') {
                params = pattern.params(entities, userContext);
            } else {
                params = pattern.params || [];
            }

            // Agregar parámetros de contexto si es necesario
            if (userContext && userContext.idEmpresa) {
                // Insertar idEmpresa al principio de los parámetros para consultas que lo requieren
                if (pattern.sql.includes('idEmpresa = ?')) {
                    params.unshift(userContext.idEmpresa);
                }
            }

            return {
                sql: pattern.sql,
                params: params,
                complexity: pattern.complexity,
                explanation: this.getExplanation(intent)
            };

        } catch (error) {
            console.error('Error generando consulta:', error);
            return {
                sql: null,
                params: [],
                complexity: 1,
                explanation: 'Error generando consulta'
            };
        }
    }

    /**
     * Obtener explicación de la consulta generada
     */
    getExplanation(intent) {
        const explanations = {
            count_driver: 'Cuenta el número de conductores activos',
            count_vehicle: 'Cuenta el número de vehículos disponibles',
            list_vehicle: 'Lista los vehículos registrados',
            list_route: 'Lista las rutas disponibles',
            list_schedule: 'Lista los viajes programados',
            license_expiry: 'Consulta licencias próximas a vencer',
            vehicle_maintenance: 'Consulta vehículos que requieren mantenimiento',
            system_status: 'Obtiene estadísticas generales del sistema',
            alerts: 'Cuenta el número de alertas pendientes'
        };

        return explanations[intent] || 'Consulta generada automáticamente';
    }

    /**
     * Ejecutar consulta generada
     */
    async executeQuery(queryData, userContext) {
        try {
            if (!queryData.sql) {
                return null;
            }

            const [rows] = await pool.query(queryData.sql, queryData.params);
            return rows;

        } catch (error) {
            console.error('Error ejecutando consulta generada:', error);
            throw error;
        }
    }

    /**
     * Obtener intenciones disponibles
     */
    getAvailableIntents() {
        return Object.keys(this.intentPatterns);
    }

    /**
     * Validar si una intención es soportada
     */
    isIntentSupported(intent) {
        return intent in this.intentPatterns;
    }

    /**
     * Obtener complejidad de una intención
     */
    getIntentComplexity(intent) {
        const pattern = this.intentPatterns[intent];
        return pattern ? pattern.complexity : 1;
    }
}

module.exports = new QueryEngine();