<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }

require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    
    // Añadir proyecto_id a pendientes
    $sql = "ALTER TABLE pendientes ADD COLUMN proyecto_id INT DEFAULT NULL, ADD FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL;";
    
    $pdo->exec($sql);
    echo "Migración completada con éxito: Columna proyecto_id añadida a pendientes.\n";
    
} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
