<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';


try {
    $db = Database::getInstance();
    $db->exec("ALTER TABLE proyectos ADD COLUMN fecha_cumplimiento DATE DEFAULT NULL AFTER descripcion");
    echo "Columna fecha_cumplimiento añadida a la tabla proyectos exitosamente.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
