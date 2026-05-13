<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $sql = "ALTER TABLE pendientes MODIFY COLUMN naturaleza ENUM('decision', 'solicitud_info', 'delegacion', 'escalamiento', 'negociacion', 'averiguacion', 'aprobacion', 'compra', 'capacitacion', 'analisis', 'plan_accion', 'otra') NOT NULL";
    $pdo->exec($sql);
    echo "Columna naturaleza modificada exitosamente.\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
