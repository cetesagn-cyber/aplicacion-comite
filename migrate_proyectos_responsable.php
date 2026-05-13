<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';
try {
    $pdo = Database::getInstance();
    $pdo->exec("ALTER TABLE proyectos ADD COLUMN responsable_id INT NULL, ADD FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL;");
    echo "Migración completada: columna responsable_id añadida a proyectos.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
