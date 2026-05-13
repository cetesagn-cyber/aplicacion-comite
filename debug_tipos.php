<?php
// Bloquear acceso web - solo ejecución por CLI
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
require_once __DIR__ . '/config/database.php';
$pdo = Database::getInstance();
$rows = $pdo->query("SELECT id, titulo, tipo, estado FROM pendientes ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
echo "Todos los pendientes:\n";
foreach($rows as $r) {
    $flag = (!in_array($r['tipo'], ['rutina','estrategico'])) ? ' <--- TIPO INVALIDO' : '';
    printf("ID %d | tipo=%-15s | estado=%-10s | %s%s\n", $r['id'], $r['tipo'] ?? 'NULL', $r['estado'], $r['titulo'], $flag);
}
