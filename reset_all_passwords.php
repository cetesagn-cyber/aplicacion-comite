<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    $newPassword = password_hash('123456', PASSWORD_BCRYPT);
    
    $stmt = $db->prepare("UPDATE usuarios SET password = ?");
    $stmt->execute([$newPassword]);
    
    $count = $stmt->rowCount();
    echo "Éxito: Se han actualizado las contraseñas de $count usuarios a '123456'.\n";

} catch (PDOException $e) {
    echo "Error al actualizar contraseñas: " . $e->getMessage() . "\n";
}
