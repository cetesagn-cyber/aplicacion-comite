<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $sql = "ALTER TABLE pendientes ADD COLUMN contribucion VARCHAR(100) DEFAULT NULL";
    $pdo->exec($sql);
    echo "Columna contribucion agregada.\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
