<?php
// models/Seguimiento.php
require_once __DIR__ . '/../config/database.php';

class Seguimiento {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function add($data) {
        $sql = "INSERT INTO seguimiento_pendientes (pendiente_id, usuario_id, accion, descripcion, evidencia) 
                VALUES (:pendiente_id, :usuario_id, :accion, :descripcion, :evidencia)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function getByPendiente($pendiente_id) {
        $sql = "SELECT s.*, u.nombre as usuario 
                FROM seguimiento_pendientes s 
                JOIN usuarios u ON s.usuario_id = u.id 
                WHERE s.pendiente_id = ? 
                ORDER BY s.fecha DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$pendiente_id]);
        return $stmt->fetchAll();
    }
}
