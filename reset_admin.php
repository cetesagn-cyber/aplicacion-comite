<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    
    // Mostrar usuarios actuales
    $stmt = $pdo->query("SELECT id, nombre, email, rol, estado FROM usuarios");
    $users = $stmt->fetchAll();
    echo "=== Usuarios en la base de datos ===\n";
    foreach ($users as $u) {
        echo "  [{$u['id']}] {$u['nombre']} | {$u['email']} | {$u['rol']} | {$u['estado']}\n";
    }
    echo "\n";

    // Actualizar contraseña de TODOS los usuarios activos
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ?");
    $stmt->execute([$hash]);
    echo "Contraseña actualizada para todos los usuarios a: admin123\n";

    // Insertar usuario con correo corporativo si no existe
    $check = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ?");
    $check->execute(['admin@cetesa.com']);
    if ($check->fetchColumn() == 0) {
        $ins = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol, area) VALUES (?, ?, ?, 'admin', 'Sistemas')");
        $ins->execute(['Administrador CETESA', 'admin@cetesa.com', $hash]);
        echo "Usuario admin@cetesa.com creado exitosamente.\n";
    } else {
        $upd = $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
        $upd->execute([$hash, 'admin@cetesa.com']);
        echo "Contraseña de admin@cetesa.com actualizada.\n";
    }

    echo "\n=== Listo. Prueba con: admin@cetesa.com / admin123 ===\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
