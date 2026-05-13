<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    
    // Añadir delegado_a (el email de la persona a quien se comparte)
    $sql = "ALTER TABLE pendientes 
            ADD COLUMN delegado_a VARCHAR(255) NULL AFTER responsable_id";
    
    $db->exec($sql);
    echo "Migración exitosa: Campo delegado_a añadido.\n";

} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
