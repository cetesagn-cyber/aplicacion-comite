<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';


try {
    $db = Database::getInstance();
    
    // 1. Pendientes: porcentaje_avance y objetivo_id
    $stmt = $db->query("SHOW COLUMNS FROM pendientes LIKE 'porcentaje_avance'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE pendientes ADD COLUMN porcentaje_avance INT NOT NULL DEFAULT 0 AFTER estado_avance");
        echo "Columna 'porcentaje_avance' añadida a 'pendientes'.\n";
    }

    $stmt = $db->query("SHOW COLUMNS FROM pendientes LIKE 'objetivo_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE pendientes ADD COLUMN objetivo_id INT DEFAULT NULL AFTER id");
        $db->exec("ALTER TABLE pendientes ADD FOREIGN KEY (objetivo_id) REFERENCES objetivos(id) ON DELETE SET NULL");
        echo "Columna 'objetivo_id' añadida a 'pendientes'.\n";
    }

    // 2. Objetivos: porcentaje_avance y fecha_ultimo_avance
    $stmt = $db->query("SHOW COLUMNS FROM objetivos LIKE 'porcentaje_avance'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE objetivos ADD COLUMN porcentaje_avance INT NOT NULL DEFAULT 0");
        $db->exec("ALTER TABLE objetivos ADD COLUMN fecha_ultimo_avance TIMESTAMP NULL DEFAULT NULL");
        echo "Columnas de avance añadidas a 'objetivos'.\n";
    }

} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
