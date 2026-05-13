<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    
    // Añadir fecha_compromiso_original
    $sql = "ALTER TABLE pendientes 
            ADD COLUMN fecha_compromiso_original DATE NULL AFTER fecha_compromiso";
    
    $db->exec($sql);
    echo "Migración exitosa: Campo fecha_compromiso_original añadido.\n";
    
    // Para los registros actuales, la fecha original es la misma que tenían de compromiso
    $db->exec("UPDATE pendientes SET fecha_compromiso_original = fecha_compromiso WHERE fecha_compromiso_original IS NULL");
    echo "Datos inicializados con éxito.\n";

} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
