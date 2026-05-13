<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

echo "Iniciando configuración de base de datos...\n";

try {
    // 1. Conectar al servidor sin base de datos para crearla
    $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "Conectado al servidor MySQL.\n";

    // 2. Crear la base de datos
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
    echo "Base de datos '" . DB_NAME . "' verificada/creada.\n";

    // 3. Seleccionar la base de datos
    $pdo->exec("USE " . DB_NAME);

    // 4. Leer el archivo schema.sql
    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    
    // El script tiene 'CREATE DATABASE' y 'USE' al inicio, que ya hicimos, pero lo ejecutamos todo
    // Nota: exec() puede fallar con múltiples sentencias, pero PDO::prepare/execute no soporta múltiples.
    // Usaremos exec para el contenido completo si es posible.
    $pdo->exec($sql);
    
    echo "¡Esquema importado exitosamente!\n";
    echo "Ya puedes cerrar este script.\n";

} catch (PDOException $e) {
    die("ERROR: " . $e->getMessage() . "\n");
}
