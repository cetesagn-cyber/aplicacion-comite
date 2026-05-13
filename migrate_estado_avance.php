<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';


try {
    $db = Database::getInstance();
    
    // Check if column already exists
    $stmt = $db->query("SHOW COLUMNS FROM pendientes LIKE 'estado_avance'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE pendientes ADD COLUMN estado_avance ENUM('avance', 'sin_avance') DEFAULT NULL AFTER estado");
        echo "Columna 'estado_avance' añadida exitosamente a la tabla 'pendientes'.\n";
    } else {
        $db->exec("ALTER TABLE pendientes MODIFY COLUMN estado_avance ENUM('avance', 'sin_avance') DEFAULT NULL");
        echo "La columna 'estado_avance' ya existía, se actualizó la definición del ENUM a ('avance', 'sin_avance').\n";
    }

} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
