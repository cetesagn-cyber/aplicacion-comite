<?php
// models/Objetivo.php

require_once __DIR__ . '/../config/database.php';

class Objetivo {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getAllGroupedByYear() {
        $stmt = $this->pdo->query("SELECT * FROM objetivos ORDER BY anio DESC, id ASC");
        $objetivos = $stmt->fetchAll();
        
        $grouped = [];
        foreach ($objetivos as $obj) {
            $grouped[$obj['anio']][] = $obj;
        }
        
        return $grouped;
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM objetivos WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("INSERT INTO objetivos (anio, titulo, descripcion) VALUES (?, ?, ?)");
        return $stmt->execute([$data['anio'], $data['titulo'], $data['descripcion']]);
    }

    public function update($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE objetivos SET anio = ?, titulo = ?, descripcion = ? WHERE id = ?");
        return $stmt->execute([$data['anio'], $data['titulo'], $data['descripcion'], $id]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM objetivos WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function updateProgress($id, $porcentaje) {
        $stmt = $this->pdo->prepare("UPDATE objetivos SET porcentaje_avance = ?, fecha_ultimo_avance = CURRENT_TIMESTAMP WHERE id = ?");
        return $stmt->execute([$porcentaje, $id]);
    }
}
