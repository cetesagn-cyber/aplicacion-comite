<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
    $stmt->execute([$hash, 'admin@cetesa.com']);
    echo "Contraseña de admin restaurada.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
