<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    
    // Ensure only one admin exists
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE rol = 'admin' AND email != ?");
    $stmt->execute(['admin@cetesa.com']);

    // Set exactly this password
    $hash = password_hash('Cetesa2020*', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
    $stmt->execute([$hash, 'admin@cetesa.com']);

    echo "Clave de admin@cetesa.com actualizada.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
