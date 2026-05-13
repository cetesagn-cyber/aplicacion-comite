<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $pdo->exec("ALTER TABLE seguimiento_pendientes MODIFY accion ENUM('comentario','decision','solicitud','delegacion','cierre','bloqueo','en_proceso','postergada') NOT NULL");
    echo "ENUM actualizado correctamente.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
