<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }

require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    
    // Create proyectos table
    $sql = "
    CREATE TABLE IF NOT EXISTS proyectos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        objetivo_id_1 INT NULL,
        objetivo_id_2 INT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (objetivo_id_1) REFERENCES objetivos(id) ON DELETE SET NULL,
        FOREIGN KEY (objetivo_id_2) REFERENCES objetivos(id) ON DELETE SET NULL
    );";
    
    $pdo->exec($sql);
    echo "Migración completada con éxito: Tabla proyectos creada.\n";
    
} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
