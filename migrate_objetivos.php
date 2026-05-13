<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';


try {
    $pdo = Database::getInstance();
    
    $sql = "CREATE TABLE IF NOT EXISTS objetivos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        anio INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    echo "Tabla 'objetivos' creada exitosamente.\n";
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
