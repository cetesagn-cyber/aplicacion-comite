<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();
    $pass = password_hash('admin123', PASSWORD_BCRYPT);

    // 1. Corregir el administrador: quitar área "Sistemas"
    $pdo->exec("UPDATE usuarios SET area = '' WHERE email = 'admin@empresa.com' OR email = 'admin@cetesa.com'");
    echo "Admin corregido (área removida).\n";

    // 2. Insertar los responsables directivos
    $directivos = [
        ['Presidente',                              'Presidente',                                   'presidente@cetesa.com',       'director'],
        ['Vicepresidente de Operaciones',           'Vicepresidencia de Operaciones',               'vp.operaciones@cetesa.com',   'director'],
        ['Vicepresidente Comercial',                'Vicepresidencia Comercial',                    'vp.comercial@cetesa.com',     'director'],
        ['Vicepresidenta Financiera',               'Vicepresidencia Financiera',                   'vp.financiera@cetesa.com',    'director'],
        ['Director de Planeación y Abastecimiento', 'Dirección de Planeación y Abastecimiento',     'dir.planeacion@cetesa.com',   'director'],
        ['Directora Jurídica',                      'Dirección Jurídica',                           'dir.juridica@cetesa.com',     'director'],
        ['Director de Desarrollo Humano',           'Dirección de Desarrollo Humano y Organizacional', 'dir.rrhh@cetesa.com',      'director'],
        ['Líder de Gestión Social',                 'Gestión Social',                               'gestion.social@cetesa.com',   'director'],
        ['Líder de Proyectos Estratégicos',         'Proyectos Estratégicos',                       'proy.estrategicos@cetesa.com','director'],
    ];

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ?");
    $ins  = $pdo->prepare("INSERT INTO usuarios (nombre, area, email, password, rol) VALUES (?, ?, ?, ?, ?)");

    foreach ($directivos as [$nombre, $area, $email, $rol]) {
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() == 0) {
            $ins->execute([$nombre, $area, $email, $pass, $rol]);
            echo "  Creado: $nombre\n";
        } else {
            $pdo->prepare("UPDATE usuarios SET nombre=?, area=? WHERE email=?")->execute([$nombre, $area, $email]);
            echo "  Actualizado: $nombre\n";
        }
    }

    echo "\n¡Listo! Usuarios directivos configurados.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
