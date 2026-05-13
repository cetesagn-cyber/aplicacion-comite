<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';
try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query("SELECT * FROM usuarios WHERE email LIKE '%admin%' OR nombre LIKE '%admin%' OR rol = 'admin'");
    echo "=== ADMIN USERS IN DB ===\n";
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $u) {
        print_r($u);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
