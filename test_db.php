<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    $count = $stmt->fetchColumn();
    echo "Usuarios en la base de datos: $count\n";

    if ($count == 0) {
        echo "Insertando usuarios iniciales...\n";
        $pass = password_hash('password', PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol, area) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['Administrador', 'admin@empresa.com', $pass, 'admin', 'Sistemas']);
        $stmt->execute(['Director General', 'director@empresa.com', $pass, 'director', 'Gerencia']);
        echo "¡Usuarios insertados!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
