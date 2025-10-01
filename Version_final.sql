u-- Usar la base de datos railway proporcionada por Railway
USE railway;

-- =====================================================
-- TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- -----------------------------------------------------
-- Tabla: Roles
-- Tabla #1
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Roles (
    idRol INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nomRol VARCHAR(50) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Tabla: Empresas
-- Tabla #2
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Empresas (
    -- Identificador único de la Empresa.
    idEmpresa INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Nombre de la Empresa.
    nomEmpresa VARCHAR(100) NOT NULL,
    -- NIT de la Empresa (único).
    nitEmpresa VARCHAR(20) NOT NULL UNIQUE,
    -- Dirección de la Empresa.
    dirEmpresa VARCHAR(100) NOT NULL,
    -- Correo electrónico de contacto de la Empresa.
    emaEmpresa VARCHAR(80) NOT NULL,
    -- Teléfono de contacto de la Empresa.
    telEmpresa VARCHAR(15) NOT NULL UNIQUE,
    -- Fecha y hora en que se registra una nueva empresa en el sistema.
    fecRegEmpresa TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: Usuarios
-- Tabla #3
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuarios (
    -- Identificador único del Usuario.
    idUsuario INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Email para el login (debe ser único en todo el sistema).
    email VARCHAR(80) NOT NULL UNIQUE,
    -- Nombre(s) del Usuario.
    nomUsuario VARCHAR(80) NOT NULL,
    -- Apellido(s) del Usuario.
    apeUsuario VARCHAR(80) NOT NULL,
    -- Número de documento del Usuario.
    numDocUsuario VARCHAR(10) NOT NULL,
    telUsuario VARCHAR(15) NOT NULL,
    -- Contraseña cifrada (hash).
    passwordHash VARCHAR(255) NOT NULL,
    -- Rol del usuario que define sus permisos.
    idRol INT NOT NULL,
    -- Empresa a la que pertenece el usuario.
    idEmpresa INT NOT NULL,
    -- Los usuarios inician desactivados en el sistema hasta hacer la validación.
    estActivo BOOLEAN DEFAULT FALSE,
    -- Fecha de creación del usuario.
    fecCreUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación (se actualiza sola).
    fecUltModUsuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Unicidad por Empresa.
    UNIQUE(idEmpresa, email),
    UNIQUE(idEmpresa, numDocUsuario),
    -- Llave foránea: Con la tabla de Roles
    CONSTRAINT Fk_Usuarios_Roles FOREIGN KEY (idRol) REFERENCES Roles(idRol),
    -- Llave foránea: Si se borra una empresa, se borran sus usuarios.
    CONSTRAINT Fk_Usuarios_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: Gestores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS  Gestores(
    -- Identificador único del Gestor.
    idGestor INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo con sus credenciales en la tabla Usuarios.
    idUsuario INT NOT NULL UNIQUE,
    -- Identificador de la Empresa a la que pertenece.
    idEmpresa INT NOT NULL,
    -- Fecha de creación del registro.
    fecCreGestor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Unicidad por Gestor.
    UNIQUE(idEmpresa, idUsuario),
    -- Llave foránea: Si se borra una empresa, se borran sus perfiles de admin.
    CONSTRAINT Fk_Gestores_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra un usuario, se borra su perfil de admin.
    CONSTRAINT Fk_Gestores_Usuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
);
-- -----------------------------------------------------
-- Tabla: Conductores
-- Tabla #4
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Conductores (
    -- Identificador único del Conductor.
    idConductor INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vínculo opcional a Usuarios para el login en la app.
    idUsuario INT NULL UNIQUE,
    -- Tipo de licencia de conducción.
    tipLicConductor ENUM('B1', 'B2', 'B3', 'C1', 'C2', 'C3') NOT NULL,
    -- Fecha de vencimiento de la licencia.
    fecVenLicConductor DATE NOT NULL,
    -- Estado laboral del Conductor.
    estConductor ENUM('ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES') NOT NULL DEFAULT 'INACTIVO',
    -- Empresa a la que pertenece el Conductor.
    idEmpresa INT NOT NULL,
    -- Fecha de creación del registro.
    fecCreConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación.
    fecUltModConductor TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Unicidad Conductores.
    UNIQUE(idEmpresa, idUsuario),
    -- Llave foránea: Si se borra la empresa, se borran sus conductores.
    CONSTRAINT Fk_Conductores_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra el usuario, el conductor no se borra, solo se desvincula (SET NULL).
    CONSTRAINT Fk_Conductores_Usuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: Vehiculos
-- Tabla #5
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehiculos (
    -- Identificador único del Vehículo.
    idVehiculo INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Número interno del Vehículo (único por empresa).
    numVehiculo VARCHAR(10) NOT NULL,
    -- Placa del Vehículo (única a nivel nacional).
    plaVehiculo VARCHAR(10) NOT NULL UNIQUE,
    -- Marca del Vehículo.
    marVehiculo VARCHAR(50) NOT NULL,
    -- Modelo del Vehículo.
    modVehiculo VARCHAR(50) NOT NULL,
    -- Año del Vehículo.
    anioVehiculo YEAR NOT NULL,
    -- Fecha de vencimiento del SOAT.
    fecVenSOAT DATE NOT NULL,
    -- Fecha de vencimiento de la Revisión Técnico-Mecánica.
    fecVenTec DATE NOT NULL,
    -- Estado actual del Vehículo.
    estVehiculo ENUM('DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') NOT NULL DEFAULT 'DISPONIBLE',
    -- Empresa propietaria del Vehículo.
    idEmpresa INT NOT NULL,
    -- Conductor asignado actualmente (puede no tener uno).
    idConductorAsignado INT NULL,
    -- Fecha de creación del registro.
    fecCreVehiculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de última modificación.
    fecUltModVehiculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Restricción de unicidad para el número interno por empresa.
    UNIQUE(idEmpresa, numVehiculo),
    -- Llave foránea: Si se borra la empresa, se borran sus vehículos.
    CONSTRAINT Fk_Vehiculos_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE,
    -- Llave foránea: Si se borra el conductor, el vehículo queda sin conductor asignado.
    CONSTRAINT Fk_Vehiculos_Conductor_Asignado FOREIGN KEY (idConductorAsignado) REFERENCES Conductores(idConductor) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: Rutas
-- Tabla #6
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Rutas (
    -- Identificador único de la Ruta.
    idRuta INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Nombre de la Ruta (único por empresa).
    nomRuta VARCHAR(100) NOT NULL,
    -- Origen de la Ruta.
    oriRuta VARCHAR(100) NOT NULL,
    -- Destino de la Ruta.
    desRuta VARCHAR(100) NOT NULL,
    -- Empresa que opera la ruta.
    idEmpresa INT NOT NULL,
    -- Restricción de unicidad para el nombre de la ruta por empresa.
    UNIQUE(idEmpresa, nomRuta),
    -- Llave foránea: Si se borra la empresa, se borran sus rutas.
    CONSTRAINT Fk_Rutas_Empresas FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: Viajes
-- Tabla #7
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Viajes (
    -- Identificador único del Viaje.
    idViaje INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    -- Vehículo del viaje.
    idVehiculo INT NOT NULL,
    -- Conductor del viaje.
    idConductor INT NOT NULL,
    -- Ruta del viaje.
    idRuta INT NOT NULL,
    -- Fecha y hora de salida.
    fecHorSalViaje DATETIME NOT NULL,
    -- Fecha y hora de llegada.
    fecHorLleViaje DATETIME NULL,
    -- Estado del Viaje.
    estViaje ENUM('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
    -- Observaciones o novedades.
    obsViaje TEXT,
    -- Llave foránea hacia Vehiculos.
    CONSTRAINT Fk_Viajes_Vehiculos FOREIGN KEY (idVehiculo) REFERENCES Vehiculos(idVehiculo),
    -- Llave foránea hacia Conductores.
    CONSTRAINT Fk_Viajes_Conductores FOREIGN KEY (idConductor) REFERENCES Conductores(idConductor),
    -- Llave foránea hacia Rutas.
    CONSTRAINT Fk_Viajes_Rutas FOREIGN KEY (idRuta) REFERENCES Rutas(idRuta)
);

-- INSERCION DE DATOS INICIALES PARA LAS DIFERENTES TABLAS DEL SISTEMA EN ORDEN DE DEPENDENCIA.
-- Tabla #1
-- Insercion de datos en la tabla Roles.
INSERT IGNORE INTO Roles (nomRol) VALUES
-- idRol 1.
('SUPERADMIN'),
-- idRol2.
('GESTOR'),
-- idRol 3.
('CONDUCTOR');

-- Tabla #2
INSERT IGNORE INTO Empresas (nomEmpresa, nitEmpresa, dirEmpresa, emaEmpresa, telEmpresa)
VALUES
    -- idEmpresa = 1.
    ('Expreso La Sabana S.A.S', '901234567', ' Dg. 23 #69 60, Bogotá', 'expresolasabana@gmail.com', '3021234567');

-- Tabla #3
-- Insercion de Usuarios.
INSERT IGNORE INTO Usuarios (email, nomUsuario, apeUsuario, numDocUsuario, telUsuario, passwordHash, idRol, idEmpresa, estActivo)
VALUES
    -- Password: admin123
    -- Email, nombre(s), apellido(s), numero de documento, telefono, contraseña hash, idRol, idEmpresa y estadoActivo (0=False, 1=True) del Usuario.
    -- idUsuario = 1.
    ('admintransync@gmail.com', 'Admin', 'TranSync', '1073155311', '3001234561', '$2b$12$GcePXxkduhLRPWMBrpzaTuzEIfdUAnrxo9.1MWImSHwdQ21IzovLe ', 1, 1, 1),
    -- GESTORES
    -- Password: gestor123
    -- idUsuario = 2.
    ('juan.perez@example.com', 'Juan', 'Pérez', '1098765432', '3101234567', '$2b$12$3RUd9CYsTLw0Lp5J62nZ1.Xc4lMNT0dTkJ.vV2KphE4Ee5bZhv9iC', 2, 1, 1),
    -- Password: gestor123
    -- idUsuario = 3.
    ('maria.lopez@example.com', 'María', 'López', '1122334455', '3102345678', '$2b$12$3RUd9CYsTLw0Lp5J62nZ1.Xc4lMNT0dTkJ.vV2KphE4Ee5bZhv9iC', 2, 1, 1),
    -- Password: gestor123
    -- idUsuario = 4.
    ('carlos.martinez@example.com', 'Carlos', 'Martínez', '1234567890', '3103456789', '$2b$12$3RUd9CYsTLw0Lp5J62nZ1.Xc4lMNT0dTkJ.vV2KphE4Ee5bZhv9iC', 2, 1, 1),
    -- CONDUCTORES
    -- Password: conductor123
    -- idUsuario = 5.
    ('ana.gomez@example.com', 'Ana', 'Gómez', '1010101010', '3201234567', '$2b$12$3eQPBzwtFe5a6KZbpydMEufd7fPBGgAeI7UVJkz9cCHxS07LWlBeC', 3, 1, 1),
    -- Password: conductor123
    -- idUsuario = 6.
    ('luis.fernandez@example.com', 'Luis', 'Fernández', '2020202020', '3202345678', '$2b$12$3eQPBzwtFe5a6KZbpydMEufd7fPBGgAeI7UVJkz9cCHxS07LWlBeC', 3, 1, 1),
    -- Password: conductor123
    -- idUsuario = 7.
    ('maria.rios@example.com', 'María', 'Ríos', '3030303030', '3203456789', '$2b$12$3eQPBzwtFe5a6KZbpydMEufd7fPBGgAeI7UVJkz9cCHxS07LWlBeC', 3, 1, 1),
    -- Password: conductor123
    -- idUsuario = 8.
    ('jorge.sanchez@example.com', 'Jorge', 'Sánchez', '4040404040', '3204567890', '$2b$12$3eQPBzwtFe5a6KZbpydMEufd7fPBGgAeI7UVJkz9cCHxS07LWlBeC', 3, 1, 1),
    -- Password: conductor123
    -- idUsuario = 9.
    ('isabel.moreno@example.com', 'Isabel', 'Moreno', '5050505050', '3205678901', '$2b$12$3eQPBzwtFe5a6KZbpydMEufd7fPBGgAeI7UVJkz9cCHxS07LWlBeC', 3, 1, 1);

-- Tabla #4
-- Insertar conductores de ejemplo
INSERT IGNORE INTO Conductores (idUsuario, tipLicConductor, fecVenLicConductor, estConductor, idEmpresa)
VALUES
        -- idUsuario, tipo de licencia, fecha de vencimiento de la licencia, estado del Conductor y Empresa a la que pertencece de momento solo existe una empresa 1.
        (5,'B1','2026-05-15', 'ACTIVO', 1),
        (6,'C1','2025-09-23', 'INACTIVO', 1),
        (7,'B3','2028-06-10', 'DIA_DESCANSO', 1),
        (8,'C2','2027-01-08', 'INCAPACITADO', 1),
        (9,'B1','2025-09-15', 'DE_VACACIONES', 1);

-- Tabla #5
-- Insertar rutas de ejemplo
INSERT IGNORE INTO Rutas (nomRuta, oriRuta, desRuta, idEmpresa)
VALUES
    ('Ruta Norte-Centro', 'Terminal Norte Bogotá', 'Centro Internacional Bogotá', 1),
    ('Expreso Medellín-Rionegro', 'Terminal Sur Medellín', 'Aeropuerto José María Córdova', 1),
    ('Ruta Sur-Chapinero', 'Terminal Sur Bogotá', 'Zona Rosa Chapinero', 1),
    ('Ruta Envigado-Centro', 'Envigado', 'Centro Medellín', 1),
    ('Ruta Centro-Occidente', 'Centro Bogotá', 'Terminal de Transportes', 1),
    ('Ruta Norte-Sur', 'Portal Norte', 'Portal Sur', 1);

-- Insertar vehículos de ejemplo
INSERT IGNORE INTO Vehiculos (numVehiculo, plaVehiculo, marVehiculo, modVehiculo, anioVehiculo, fecVenSOAT, fecVenTec, estVehiculo, idEmpresa)
VALUES
    -- idVehiculo = 1.
    ('BUS001', 'TSX123', 'Chevrolet', 'NPR Busetón', 2021, '2025-12-10', '2026-01-15', 'EN_RUTA', 1),
    -- idVehiculo = 2.
    ('BUS002', 'YHG456', 'Mercedes-Benz', 'OF 1721', 2020, '2025-10-05', '2025-12-12', 'EN_MANTENIMIENTO', 1),
    -- idVehiculo = 3.
    ('BUS003', 'PLM789', 'Hino', 'FC9J', 2022, '2025-11-25', '2026-01-30', 'FUERA_DE_SERVICIO', 1),
    -- idVehiculo = 4.
    ('BUS004', 'QWE012', 'Volkswagen', '9.160 OD Minibús', 2019, '2025-09-18', '2025-11-22', 'DISPONIBLE', 1),
    -- idVehiculo = 5.
    ('BUS005', 'RTY345', 'International', '4700 Serie', 2023, '2026-02-01', '2026-04-05', 'DISPONIBLE', 1);


-- Insertar viajes de ejemplo
INSERT IGNORE INTO Viajes (idVehiculo, idConductor, idRuta, fecHorSalViaje, fecHorLleViaje, estViaje, obsViaje)
VALUES
    -- Viaje 1
(1, 5, 1, '2025-09-22 08:00:00', '2025-09-22 09:00:00', 'EN_CURSO', 'Viaje de prueba con conductor activo'),

-- Viaje 2
(5, 1, 2, '2025-09-22 06:30:00', '2025-09-22 08:00:00', 'PROGRAMADO', 'Programado para mañana temprano'),

-- Viaje 3
(4, 5, 3, '2025-09-22 10:00:00', '2025-09-22 11:30:00', 'PROGRAMADO', 'Ruta Chapinero - revisión necesaria'),

-- Viaje 4
(1, 1, 4, '2025-09-21 15:00:00', '2025-09-21 16:30:00', 'FINALIZADO', 'Viaje completado sin novedades'),

-- Viaje 5
(5, 5, 5, '2025-09-23 07:00:00', '2025-09-23 08:30:00', 'PROGRAMADO', 'Asignado al BUS005 con licencia activa'),

-- Viaje 6
(4, 1, 6, '2025-09-23 14:00:00', '2025-09-23 15:45:00', 'PROGRAMADO', 'Ruta completa Norte-Sur');


-- =====================================================
-- TABLAS PARA GESTIÓN DE PERFIL DE USUARIO
-- =====================================================

-- -----------------------------------------------------
-- Tabla: UserPreferences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS UserPreferences (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    preferences JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (idUsuario)
);

-- -----------------------------------------------------
-- Tabla: NotificationSettings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS NotificationSettings (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    notificationSettings JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notifications (idUsuario)
);

-- -----------------------------------------------------
-- Tabla: UserActivity
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS UserActivity (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idUsuario INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    INDEX idx_user_timestamp (idUsuario, timestamp),
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
);

-- =====================================================
-- DATOS DE PRUEBA PARA PERFIL DE USUARIO
-- =====================================================

-- Insertar preferencias de usuario para algunos usuarios
INSERT IGNORE INTO UserPreferences (idUsuario, preferences) VALUES
(1, '{"theme": "dark", "language": "es", "notifications": {"email": true, "push": false, "sms": true}, "dashboard": {"defaultView": "overview", "itemsPerPage": 15, "autoRefresh": true}}'),
(2, '{"theme": "light", "language": "es", "notifications": {"email": true, "push": true, "sms": false}, "dashboard": {"defaultView": "analytics", "itemsPerPage": 20, "autoRefresh": false}}'),
(3, '{"theme": "dark", "language": "es", "notifications": {"email": true, "push": true, "sms": true}, "dashboard": {"defaultView": "overview", "itemsPerPage": 10, "autoRefresh": true}}');

-- Insertar configuración de notificaciones para algunos usuarios
INSERT IGNORE INTO NotificationSettings (idUsuario, notificationSettings) VALUES
(1, '{"newMessages": true, "systemUpdates": true, "securityAlerts": true, "maintenanceReminders": false, "reportNotifications": true, "emailFrequency": "immediate"}'),
(2, '{"newMessages": true, "systemUpdates": false, "securityAlerts": true, "maintenanceReminders": true, "reportNotifications": false, "emailFrequency": "daily"}'),
(3, '{"newMessages": true, "systemUpdates": true, "securityAlerts": false, "maintenanceReminders": true, "reportNotifications": true, "emailFrequency": "weekly"}');

-- =====================================================
-- TABLA PARA TOKENS DE RESTABLECIMIENTO DE CONTRASEÑA
-- =====================================================

-- -----------------------------------------------------
-- Tabla: PasswordResets
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS PasswordResets (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (userId),
    INDEX idx_token (token),
    INDEX idx_expires_at (expiresAt),
    INDEX idx_used (used),
    FOREIGN KEY (userId) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE
);

-- =====================================================
-- DATOS DE PRUEBA PARA PERFIL DE USUARIO
-- =====================================================

-- =====================================================
-- TABLAS PARA DASHBOARD Y REPORTES
-- =====================================================

-- -----------------------------------------------------
-- Tabla: ResumenOperacional
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ResumenOperacional (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idEmpresa INT NOT NULL,
    conductoresActivos INT DEFAULT 0,
    vehiculosDisponibles INT DEFAULT 0,
    viajesEnCurso INT DEFAULT 0,
    viajesCompletados INT DEFAULT 0,
    alertasPendientes INT DEFAULT 0,
    fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_empresa (idEmpresa),
    INDEX idx_fecha (fechaActualizacion),
    FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: AlertasVencimientos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS AlertasVencimientos (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    idEmpresa INT NOT NULL,
    tipoDocumento ENUM('LICENCIA_CONDUCCION', 'SOAT', 'TECNICO_MECANICA', 'SEGURO') NOT NULL,
    idReferencia INT NOT NULL COMMENT 'ID del conductor o vehículo relacionado',
    descripcion VARCHAR(255) NOT NULL,
    fechaVencimiento DATE NOT NULL,
    diasParaVencer INT NOT NULL,
    estado ENUM('PENDIENTE', 'VENCIDA', 'RESUELTA') DEFAULT 'PENDIENTE',
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaResolucion TIMESTAMP NULL,
    INDEX idx_empresa (idEmpresa),
    INDEX idx_tipo (tipoDocumento),
    INDEX idx_estado (estado),
    INDEX idx_vencimiento (fechaVencimiento),
    FOREIGN KEY (idEmpresa) REFERENCES Empresas(idEmpresa) ON DELETE CASCADE
);

-- =====================================================
-- DATOS DE PRUEBA PARA DASHBOARD
-- =====================================================

-- Insertar datos iniciales para ResumenOperacional
INSERT IGNORE INTO ResumenOperacional (idEmpresa, conductoresActivos, vehiculosDisponibles, viajesEnCurso, viajesCompletados, alertasPendientes) VALUES
(1, 3, 2, 1, 4, 2);

-- Insertar alertas de vencimientos de ejemplo
INSERT IGNORE INTO AlertasVencimientos (idEmpresa, tipoDocumento, idReferencia, descripcion, fechaVencimiento, diasParaVencer, estado) VALUES
(1, 'LICENCIA_CONDUCCION', 5, 'Licencia de conducción próxima a vencer', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 15, 'PENDIENTE'),
(1, 'SOAT', 1, 'SOAT del vehículo TSX123 próximo a vencer', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 20, 'PENDIENTE'),
(1, 'TECNICO_MECANICA', 2, 'Revisión técnico-mecánica próxima a vencer', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 10, 'PENDIENTE');

-- =====================================================
-- DATOS DE PRUEBA PARA PERFIL DE USUARIO
-- =====================================================

-- Insertar actividad de usuario para algunos usuarios
INSERT IGNORE INTO UserActivity (idUsuario, type, description, ipAddress, userAgent) VALUES
(1, 'login', 'Inicio de sesión exitoso', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'profile_update', 'Actualización de perfil personal', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'password_change', 'Cambio de contraseña exitoso', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'login', 'Inicio de sesión exitoso', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(2, 'preferences_update', 'Actualización de preferencias', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'login', 'Inicio de sesión exitoso', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(3, 'notifications_update', 'Actualización de configuración de notificaciones', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

