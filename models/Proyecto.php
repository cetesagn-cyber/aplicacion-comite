<?php
// models/Proyecto.php

require_once __DIR__ . '/../config/database.php';

class Proyecto {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getAll(array $rls = []) {
        $where  = '';
        $params = [];
        if (!empty($rls) && ($rls['user_rol'] ?? '') === 'director') {
            $where  = " WHERE p.responsable_id = ?";
            $params = [(int)$rls['user_id']];
        }

        $sql = "SELECT p.*,
                       o1.titulo as objetivo_1_titulo,
                       o2.titulo as objetivo_2_titulo,
                       u.nombre as responsable_nombre
                FROM proyectos p
                LEFT JOIN objetivos o1 ON p.objetivo_id_1 = o1.id
                LEFT JOIN objetivos o2 ON p.objetivo_id_2 = o2.id
                LEFT JOIN usuarios u ON p.responsable_id = u.id
                {$where}
                ORDER BY p.id DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById($id, array $rls = []) {
        $extra  = '';
        $params = [$id];
        if (!empty($rls) && ($rls['user_rol'] ?? '') === 'director') {
            $extra    = " AND p.responsable_id = ?";
            $params[] = (int)$rls['user_id'];
        }

        $sql = "SELECT p.*,
                       o1.titulo as objetivo_1_titulo,
                       o2.titulo as objetivo_2_titulo,
                       u.nombre as responsable_nombre
                FROM proyectos p
                LEFT JOIN objetivos o1 ON p.objetivo_id_1 = o1.id
                LEFT JOIN objetivos o2 ON p.objetivo_id_2 = o2.id
                LEFT JOIN usuarios u ON p.responsable_id = u.id
                WHERE p.id = ?{$extra}";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("INSERT INTO proyectos (titulo, descripcion, fecha_cumplimiento, objetivo_id_1, objetivo_id_2, responsable_id) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['titulo'], 
            $data['descripcion'],
            !empty($data['fecha_cumplimiento']) ? $data['fecha_cumplimiento'] : null,
            !empty($data['objetivo_id_1']) ? $data['objetivo_id_1'] : null, 
            !empty($data['objetivo_id_2']) ? $data['objetivo_id_2'] : null,
            !empty($data['responsable_id']) ? $data['responsable_id'] : null
        ]);
    }

    public function update($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE proyectos SET titulo = ?, descripcion = ?, fecha_cumplimiento = ?, objetivo_id_1 = ?, objetivo_id_2 = ?, responsable_id = ? WHERE id = ?");
        return $stmt->execute([
            $data['titulo'], 
            $data['descripcion'],
            !empty($data['fecha_cumplimiento']) ? $data['fecha_cumplimiento'] : null,
            !empty($data['objetivo_id_1']) ? $data['objetivo_id_1'] : null, 
            !empty($data['objetivo_id_2']) ? $data['objetivo_id_2'] : null, 
            !empty($data['responsable_id']) ? $data['responsable_id'] : null,
            $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM proyectos WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
