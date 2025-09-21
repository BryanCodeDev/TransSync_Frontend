// src/utilidades/realTimeServiceExample.js - Ejemplos de uso del RealTimeService

import realTimeService from './realTimeService';

/**
 * Ejemplo de uso del RealTimeService en un componente React
 */
const RealTimeServiceExample = () => {
  // Ejemplo 1: Conexión básica con contexto de usuario
  const connectToRealTime = (userContext) => {
    realTimeService.connect(userContext);

    // Escuchar eventos de conexión
    realTimeService.on('connection:established', (data) => {
      console.log('✅ Conexión establecida:', data);
    });

    realTimeService.on('connection:error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    realTimeService.on('auth:success', (data) => {
      console.log('✅ Autenticación exitosa:', data);
    });

    realTimeService.on('auth:error', (error) => {
      console.error('❌ Error de autenticación:', error);
    });
  };

  // Ejemplo 2: Escuchar notificaciones específicas
  const setupNotificationListeners = () => {
    // Nuevos conductores
    realTimeService.on('notification:new_conductor', (notification) => {
      showNotification(notification);
      updateConductoresList();
    });

    // Actualizaciones de vehículos
    realTimeService.on('notification:vehicle_updated', (notification) => {
      showNotification(notification);
      updateVehiculosList();
    });

    // Alertas de vencimientos
    realTimeService.on('notification:expiration_alert', (notification) => {
      showHighPriorityNotification(notification);
      updateExpirationAlerts();
    });

    // Notificaciones del chatbot
    realTimeService.on('notification:chatbot', (notification) => {
      showChatbotNotification(notification);
    });
  };

  // Ejemplo 3: Enviar notificaciones manuales
  const sendCustomNotification = () => {
    realTimeService.sendNotification(
      'custom_notification',
      '🚨 Alerta del Sistema',
      'Se detectó una actividad inusual en el sistema',
      {
        tipo: 'seguridad',
        severidad: 'alta',
        timestamp: new Date()
      },
      'high' // prioridad alta
    );
  };

  // Ejemplo 4: Usar API REST para notificaciones
  const sendNotificationViaAPI = async () => {
    const result = await realTimeService.sendNotificationViaAPI(
      'empresa',           // targetType
      '123',              // targetId (empresaId)
      'system:alert',     // event
      {                   // data
        message: 'Mantenimiento programado',
        duration: '2 horas',
        affectedSystems: ['sistema1', 'sistema2']
      },
      'medium'            // priority
    );

    if (result) {
      console.log('✅ Notificación enviada via API:', result);
    }
  };

  // Ejemplo 5: Obtener estadísticas del servicio
  const getServiceStats = async () => {
    const stats = await realTimeService.getServiceStats();
    if (stats) {
      console.log('📊 Estadísticas del servicio:', stats);
      updateStatsDisplay(stats);
    }
  };

  // Ejemplo 6: Obtener clientes conectados
  const getConnectedClients = async () => {
    const clients = await realTimeService.getConnectedClients();
    if (clients) {
      console.log('👥 Clientes conectados:', clients);
      updateClientsDisplay(clients);
    }
  };

  // Ejemplo 7: Solicitar permisos para notificaciones del navegador
  const requestNotificationPermission = async () => {
    const granted = await realTimeService.requestNotificationPermission();
    if (granted) {
      console.log('✅ Permisos de notificación concedidos');
    } else {
      console.log('❌ Permisos de notificación denegados');
    }
  };

  // Ejemplo 8: Cleanup al desmontar componente
  const cleanup = () => {
    realTimeService.off('notification:new_conductor');
    realTimeService.off('notification:vehicle_updated');
    realTimeService.off('notification:expiration_alert');
    realTimeService.off('notification:chatbot');
  };

  // Funciones auxiliares para manejar las notificaciones
  const showNotification = (notification) => {
    // Implementar lógica para mostrar notificación en UI
    console.log('🔔 Notificación:', notification.title, notification.message);

    // Ejemplo: mostrar toast notification
    // toast(notification.title, { description: notification.message });
  };

  const showHighPriorityNotification = (notification) => {
    // Implementar lógica para notificaciones de alta prioridad
    console.log('🚨 Notificación de alta prioridad:', notification.title);

    // Ejemplo: mostrar modal o alerta
    // alert(`${notification.title}\n${notification.message}`);
  };

  const showChatbotNotification = (notification) => {
    // Implementar lógica específica para notificaciones del chatbot
    console.log('🤖 Notificación del chatbot:', notification.message);
  };

  const updateConductoresList = () => {
    // Actualizar lista de conductores en la UI
    console.log('🔄 Actualizando lista de conductores...');
  };

  const updateVehiculosList = () => {
    // Actualizar lista de vehículos en la UI
    console.log('🔄 Actualizando lista de vehículos...');
  };

  const updateExpirationAlerts = () => {
    // Actualizar alertas de vencimientos en la UI
    console.log('🔄 Actualizando alertas de vencimientos...');
  };

  const updateStatsDisplay = (stats) => {
    // Actualizar display de estadísticas en la UI
    console.log('📊 Actualizando estadísticas:', stats);
  };

  const updateClientsDisplay = (clients) => {
    // Actualizar display de clientes conectados en la UI
    console.log('👥 Actualizando clientes conectados:', clients);
  };

  return {
    connectToRealTime,
    setupNotificationListeners,
    sendCustomNotification,
    sendNotificationViaAPI,
    getServiceStats,
    getConnectedClients,
    requestNotificationPermission,
    cleanup
  };
};

export default RealTimeServiceExample;