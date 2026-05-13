<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();

    // Mostrar todos los usuarios con sus correos exactos
    $stmt = $pdo->query("SELECT id, nombre, email, rol, estado FROM usuarios ORDER BY id");
    echo "=== USUARIOS REGISTRADOS ===\n";
    foreach ($stmt->fetchAll() as $u) {
        echo "  [{$u['id']}] {$u['nombre']} | {$u['email']} | {$u['rol']} | {$u['estado']}\n";
    }

    // Resetear contraseña de TODOS a admin123
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt2 = $pdo->prepare("UPDATE usuarios SET password = ?");
    $stmt2->execute([$hash]);
    echo "\n Contraseña de todos los usuarios reseteada.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
