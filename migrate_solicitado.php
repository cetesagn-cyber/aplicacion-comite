<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $pdo->exec("ALTER TABLE pendientes ADD COLUMN solicitado_por_id INT NULL AFTER responsable_id, ADD FOREIGN KEY fk_solicitado(solicitado_por_id) REFERENCES usuarios(id)");
    echo "Columna 'solicitado_por_id' agregada exitosamente.\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
        echo "La columna ya existe, no se requieren cambios.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
