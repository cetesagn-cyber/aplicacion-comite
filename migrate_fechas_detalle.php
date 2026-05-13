<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    
    // Añadir fecha_cierre y fecha_actualizacion
    $sql = "ALTER TABLE pendientes 
            ADD COLUMN fecha_cierre DATE NULL AFTER fecha_compromiso,
            ADD COLUMN fecha_actualizacion TIMESTAMP NULL DEFAULT NULL AFTER fecha_cierre";
    
    $db->exec($sql);
    echo "Migración exitosa: Campos fecha_cierre y fecha_actualizacion añadidos.\n";
    
    // Inicializar fecha_actualizacion con la fecha de creación para los existentes
    $db->exec("UPDATE pendientes SET fecha_actualizacion = fecha_creacion WHERE fecha_actualizacion IS NULL");
    echo "Datos inicializados.\n";

} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
