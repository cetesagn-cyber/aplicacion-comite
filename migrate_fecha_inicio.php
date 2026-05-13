<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $pdo->exec("ALTER TABLE pendientes ADD COLUMN fecha_inicio DATE NULL AFTER estado");
    
    // Rellenamos las fechas iniciales vacías con su fecha de creación original para que no queden nulas
    $pdo->exec("UPDATE pendientes SET fecha_inicio = DATE(fecha_creacion) WHERE fecha_inicio IS NULL");
    
    echo "Columna fecha_inicio agregada correctamente.\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
        echo "La columna ya existe.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
