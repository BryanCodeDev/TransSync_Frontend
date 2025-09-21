# 🚀 TransSync - Sistema Integral de Gestión de Transporte

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Sistema completo de gestión y optimización del transporte público moderno con IA integrada**

TransSync es una plataforma integral diseñada para empresas de transporte que combina gestión operativa avanzada con un **chatbot inteligente** impulsado por IA, proporcionando una experiencia de usuario excepcional y eficiencia operativa máxima.

## ✨ Características Principales

### 🤖 ChatBot Inteligente con IA
- **Procesamiento Avanzado de Lenguaje Natural** - Entiende consultas complejas en español
- **Memoria Conversacional** - Recuerda contexto y preferencias del usuario
- **Respuestas Inteligentes** - Genera consultas SQL automáticamente desde lenguaje natural
- **Sistema de Cache Inteligente** - Optimización automática de rendimiento
- **Analytics Avanzados** - Métricas detalladas de uso y rendimiento

### 🚗 Gestión Integral de Flota
- **Control de Vehículos** - Seguimiento en tiempo real del estado de la flota
- **Gestión de Conductores** - Administración completa de personal y licencias
- **Programación de Rutas** - Optimización de recorridos y horarios
- **Mantenimiento Preventivo** - Alertas automáticas de vencimientos

### 📊 Dashboard Ejecutivo
- **Métricas en Tiempo Real** - KPIs actualizados constantemente
- **Reportes Personalizados** - Análisis detallado de operaciones
- **Visualización Interactiva** - Gráficos y mapas dinámicos
- **Alertas Inteligentes** - Notificaciones proactivas del sistema

### 🔐 Seguridad y Control
- **Autenticación Multi-nivel** - Roles y permisos granulares
- **Encriptación de Datos** - Protección completa de información sensible
- **Auditoría Completa** - Registro detallado de todas las operaciones
- **Backup Automático** - Recuperación de datos garantizada

### 🎨 Interfaz de Usuario
- **Diseño Responsivo** - Compatible con todos los dispositivos
- **Tema Oscuro/Claro** - Adaptable a preferencias del usuario
- **Navegación Intuitiva** - Sidebar y navbar optimizados
- **Notificaciones en Tiempo Real** - Alertas y actualizaciones automáticas
- **Internacionalización** - Soporte para múltiples idiomas

### 🎓 Tutorial Interactivo para Nuevos Usuarios
- **Detección Automática** - Se muestra solo para usuarios nuevos
- **Guía Paso a Paso** - Recorrido completo por las funciones principales
- **Botón de Omisión** - Los usuarios pueden saltar el tutorial en cualquier momento
- **Persistencia** - Una vez completado, no se muestra nuevamente
- **Responsive** - Funciona en dispositivos móviles y de escritorio
- **Multi-idioma** - Soporte completo para español e inglés

#### Pasos del Tutorial
1. **Bienvenida** - Introducción al sistema TransSync
2. **Panel de Control** - Vista general de operaciones
3. **Gestión de Conductores** - Administración de personal
4. **Gestión de Rutas** - Control de trayectos
5. **Gestión de Vehículos** - Control de flota
6. **Horarios y Programación** - Organización de tiempos
7. **Informes y Analytics** - Reportes y estadísticas
8. **Configuración de Perfil** - Personalización de usuario

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React +       │◄──►│   Node.js +     │◄──►│   MySQL 8.0+    │
│   Tailwind CSS  │    │   Express       │    │                 │
│                 │    │                 │    │                 │
│ • ChatBot IA    │    │ • API RESTful   │    │ • 15+ Tablas    │
│ • Dashboard     │    │ • Autenticación │    │ • Vistas        │
│ • Mapas         │    │ • WebSocket     │    │ • Procedimientos│
│ • Responsive    │    │ • Cache         │    │ • Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** 16.0 o superior
- **MySQL** 8.0 o superior
- **npm** o **yarn**
- **Git**

### Tecnologías del Frontend
- **React** 18.2.0 - Framework principal
- **React Router** - Enrutamiento SPA
- **Tailwind CSS** - Framework de estilos
- **React Icons** - Iconografía
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos adicionales

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/transsync.git
   cd transsync
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   # Crear base de datos
   mysql -u root -p < database/schema.sql

   # Ejecutar mejoras del chatbot
   mysql -u root -p transync < database_chatbot_improvements.sql
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Iniciar el servidor backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

6. **Iniciar el frontend**
   ```bash
   npm start
   ```

7. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## 📁 Estructura del Proyecto

### Frontend (React)
```
src/
├── components/              # Componentes React reutilizables
│   ├── AuthStatus.jsx      # Estado de autenticación
│   ├── BreadcrumbNav.jsx   # Navegación breadcrumb
│   ├── Button.jsx          # Componente botón personalizado
│   ├── ChatBot.jsx         # ChatBot inteligente con IA
│   ├── DashboardSkeleton.jsx # Esqueleto de carga del dashboard
│   ├── LanguageSwitcher.jsx # Selector de idioma
│   ├── Navbar.jsx          # Barra de navegación principal
│   ├── Sidebar.jsx         # Navegación lateral
│   ├── Tooltip.jsx         # Componente tooltip
│   └── Tutorial.jsx        # Tutorial interactivo para nuevos usuarios
├── pages/                  # Páginas principales
│   ├── AdminDashboard.jsx  # Dashboard de administrador
│   ├── Dashboard.jsx       # Dashboard principal
│   ├── Drivers.jsx         # Gestión de conductores
│   ├── Emergency.jsx       # Panel de emergencias
│   ├── Home.jsx            # Página de inicio
│   ├── Horarios.jsx        # Gestión de horarios
│   ├── Informes.jsx        # Reportes y análisis
│   ├── Login.jsx           # Página de inicio de sesión
│   ├── Register.jsx        # Página de registro
│   ├── Rutas.jsx           # Gestión de rutas
│   └── Vehiculos.jsx       # Gestión de vehículos
├── context/                # Contextos React
│   ├── AuthContext.jsx     # Contexto de autenticación
│   └── ThemeContext.jsx    # Contexto de tema
├── hooks/                  # Hooks personalizados
│   ├── useAuth.js          # Hook de autenticación
│   └── useTutorial.js      # Hook para el tutorial interactivo
├── utilidades/             # Utilidades y servicios
│   ├── adminAPI.js         # API de administración
│   ├── authAPI.js          # API de autenticación
│   ├── chatbotAPI.js       # API del chatbot
│   ├── dashboardAPI.js     # API del dashboard
│   ├── driversAPI.js       # API de conductores
│   ├── emergencyAPI.js     # API de emergencias
│   ├── informesAPI.js      # API de reportes
│   ├── rutasAPI.js         # API de rutas
│   ├── vehiculosAPI.js     # API de vehículos
│   └── viajesAPI.js        # API de viajes
├── locales/                # Archivos de internacionalización
│   ├── en/                 # Traducciones en inglés
│   └── es/                 # Traducciones en español
├── routes/                 # Configuración de rutas
│   └── ProtectedRoute.jsx  # Ruta protegida
├── api/                    # Configuración de API
│   ├── baseAPI.js          # Cliente API base
│   └── index.js            # Exportaciones de API
├── i18n.js                 # Configuración de internacionalización
├── App.jsx                 # Componente principal
├── App.css                 # Estilos globales
└── index.jsx               # Punto de entrada
```

### Backend y Base de Datos
```
├── backend/                # Servidor backend
│   ├── controllers/        # Controladores de la API
│   ├── routes/            # Definición de rutas
│   ├── middleware/        # Middlewares personalizados
│   ├── config/            # Configuraciones
│   └── utils/             # Utilidades del backend
├── database/              # Scripts de base de datos
│   ├── schema.sql         # Esquema principal
│   └── chatbot_improvements.sql # Mejoras del chatbot
├── public/                # Archivos estáticos
├── docs/                  # Documentación
├── tests/                 # Pruebas automatizadas
└── CHATBOT_IMPROVEMENTS_README.md # Documentación detallada del chatbot
```

## 🎯 Uso del ChatBot Inteligente

### Consultas Básicas
```
👤 Usuario: ¿Cuántos conductores están activos?
🤖 ChatBot: 📊 Estado de Conductores:
            • Total: 25 conductores
            • Activos: 22
            • Inactivos: 3
```

### Consultas Avanzadas
```
👤 Usuario: Muéstrame conductores activos con licencias que vencen pronto
🤖 ChatBot: 📋 Conductores con licencias próximas a vencer:
            • Carlos González - Vence: 2025-02-15
            • Ana López - Vence: 2025-03-20
```

### Consultas Complejas
```
👤 Usuario: ¿Qué vehículos están en mantenimiento con SOAT vencido?
🤖 ChatBot: 🚨 Alertas Críticas:
            • BUS-001 (ABC123) - SOAT vencido
            • VAN-005 (XYZ789) - En mantenimiento + SOAT vencido
```

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)
```env
# Base de datos
DB_HOST=localhost
DB_USER=transsync_user
DB_PASSWORD=your_password
DB_NAME=transync

# API
API_URL=http://localhost:5000
API_TIMEOUT=10000

# ChatBot IA
NLP_CONFIDENCE_THRESHOLD=0.6
CACHE_TTL=300000
CONVERSATION_MAX_MESSAGES=50

# Autenticación
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Correo electrónico
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Configuración del ChatBot
```javascript
const chatbotConfig = {
  nlpActivo: true,              // Procesamiento de lenguaje natural
  cacheActivo: true,            // Sistema de cache inteligente
  memoriaConversacional: true,  // Memoria de conversaciones
  sugerenciasProactivas: true,  // Sugerencias inteligentes
  umbralConfianza: 0.6,         // Confianza mínima para respuestas
  tiempoMaximoRespuesta: 5000   // Timeout en milisegundos
};
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### ChatBot Inteligente
- `POST /api/chatbot/consulta` - Consulta básica
- `POST /api/chatbot/procesar-inteligente` - Procesamiento con IA
- `POST /api/chatbot/query` - Consulta SQL directa
- `GET /api/chatbot/analytics` - Estadísticas del chatbot

### Gestión de Flota
- `GET /api/vehiculos` - Listar vehículos
- `POST /api/vehiculos` - Crear vehículo
- `PUT /api/vehiculos/:id` - Actualizar vehículo
- `DELETE /api/vehiculos/:id` - Eliminar vehículo

### Gestión de Conductores
- `GET /api/conductores` - Listar conductores
- `POST /api/conductores` - Crear conductor
- `PUT /api/conductores/:id` - Actualizar conductor
- `PATCH /api/conductores/:id/estado` - Cambiar estado

### Rutas y Viajes
- `GET /api/rutas` - Listar rutas
- `POST /api/rutas` - Crear ruta
- `GET /api/viajes` - Listar viajes
- `POST /api/viajes` - Programar viaje

## 🧪 Pruebas

### Ejecutar Pruebas
```bash
# Pruebas del frontend
npm test

# Pruebas del backend
cd backend
npm test

# Pruebas end-to-end
npm run test:e2e
```

### Cobertura de Pruebas
```bash
npm run test:coverage
```

## 📈 Rendimiento y Métricas

### KPIs del Sistema
- **Tiempo de Respuesta**: < 500ms promedio
- **Disponibilidad**: 99.9% uptime
- **Precisión del ChatBot**: > 90%
- **Satisfacción del Usuario**: 4.5/5 promedio

### Monitoreo
- **Logs en tiempo real** con Winston
- **Métricas de rendimiento** con Prometheus
- **Alertas automáticas** con configuración personalizable
- **Dashboard de monitoreo** integrado

## 🚀 Despliegue

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

### Docker
```bash
# Construir imagen
docker build -t transsync .

# Ejecutar contenedor
docker run -p 3000:3000 -p 5000:5000 transsync
```

### Kubernetes
```bash
# Desplegar en Kubernetes
kubectl apply -f k8s/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución
- [Guía de Estilo de Código](docs/CONTRIBUTING.md)
- [Configuración de Desarrollo](docs/DEVELOPMENT.md)
- [Proceso de Testing](docs/TESTING.md)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Arquitecto de Sistemas**: [Nombre]
- **Diseñador UX/UI**: [Nombre]
- **Especialista en IA**: [Nombre]

## 🙏 Agradecimientos

- React Community por el excelente framework
- OpenAI por inspiración en procesamiento de lenguaje natural
- MySQL Community por la robusta base de datos
- Todas las librerías de código abierto utilizadas

## 📞 Contacto

- **Email**: info@transsync.com
- **Sitio Web**: https://transsync.com
- **Documentación**: https://docs.transsync.com
- **Soporte**: support@transsync.com

## 🔄 Versiones

### v2.1.0 - ChatBot con IA (Actual)
- ✅ ChatBot inteligente con procesamiento de lenguaje natural
- ✅ Memoria conversacional avanzada
- ✅ Sistema de cache inteligente
- ✅ Analytics y métricas avanzadas
- ✅ Interfaz mejorada con indicadores visuales

### v2.0.0 - Sistema Completo
- ✅ Gestión integral de flota
- ✅ Dashboard ejecutivo
- ✅ API RESTful completa
- ✅ Autenticación y autorización
- ✅ Base de datos optimizada

### v1.0.0 - MVP
- ✅ Gestión básica de conductores y vehículos
- ✅ Interfaz responsive
- ✅ Autenticación básica
- ✅ Reportes simples

---

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] **Aplicación Móvil Nativa** - iOS y Android
- [ ] **Integración con GPS** - Seguimiento en tiempo real
- [ ] **Machine Learning Avanzado** - Predicciones automáticas
- [ ] **Integración con APIs Externas** - Clima, tráfico, etc.
- [ ] **Soporte Multi-idioma** - Inglés, portugués, etc.
- [ ] **Voice-to-text** para consultas por voz

---

<div align="center">

**TransSync - Revolucionando la gestión de transporte con IA** 🚀

⭐ Si te gusta este proyecto, ¡dale una estrella!

[📖 Documentación Completa](docs/) • [🐛 Reportar Bug](issues) • [💡 Solicitar Feature](issues)

</div>