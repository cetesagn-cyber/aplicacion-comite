-- Database: comite_seguimiento

CREATE DATABASE IF NOT EXISTS comite_seguimiento;
USE comite_seguimiento;

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'director') NOT NULL DEFAULT 'director',
    area VARCHAR(100),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pendientes
CREATE TABLE IF NOT EXISTS pendientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('rutina', 'estrategico') NOT NULL DEFAULT 'rutina',
    naturaleza ENUM('decision', 'solicitud_info', 'delegacion', 'escalamiento') NOT NULL,
    impacto SET('EBIT', 'Gross', 'Eficiencia', 'Gente', 'Riesgo') NOT NULL,
    prioridad ENUM('alta', 'media', 'baja') NOT NULL DEFAULT 'media',
    estado ENUM('abierto', 'en_progreso', 'bloqueado', 'cerrado') NOT NULL DEFAULT 'abierto',
    estado_avance ENUM('avance', 'sin_avance') DEFAULT NULL,
    porcentaje_avance INT NOT NULL DEFAULT 0,
    fecha_compromiso DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INT,
    responsable_id INT,
    objetivo_id INT DEFAULT NULL,
    proyecto_id INT DEFAULT NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
    FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE SET NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL
);

-- 3. Seguimiento de Pendientes (Historial)
CREATE TABLE IF NOT EXISTS seguimiento_pendientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pendiente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    accion ENUM('comentario', 'decision', 'solicitud', 'delegacion', 'cierre', 'bloqueo') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidencia VARCHAR(255),
    FOREIGN KEY (pendiente_id) REFERENCES pendientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 4. Asignaciones (Para trazabilidad de reasignaciones o múltiples personas involucradas)
CREATE TABLE IF NOT EXISTS asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pendiente_id INT NOT NULL,
    asignado_a INT NOT NULL,
    asignado_por INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pendiente_id) REFERENCES pendientes(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_a) REFERENCES usuarios(id),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id)
);

-- Usuarios iniciales: ejecutar setup_db.php por CLI para insertar con contraseña segura.
-- No se incluyen contraseñas por defecto en el esquema.

-- 5. Objetivos
CREATE TABLE IF NOT EXISTS objetivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    porcentaje_avance INT NOT NULL DEFAULT 0,
    fecha_ultimo_avance TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    objetivo_id_1 INT NULL,
    objetivo_id_2 INT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objetivo_id_1) REFERENCES objetivos(id) ON DELETE SET NULL,
    FOREIGN KEY (objetivo_id_2) REFERENCES objetivos(id) ON DELETE SET NULL
);
