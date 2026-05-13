<?php
// models/Bsc.php
require_once __DIR__ . '/../config/database.php';

class Bsc {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Métricas
    public function getMetricas($anio, $tipo = null) {
        $sql = "SELECT * FROM bsc_metricas WHERE anio = :anio";
        if ($tipo) {
            $sql .= " AND tipo = :tipo";
        }
        $sql .= " ORDER BY tipo ASC, mes ASC, nombre ASC";
        
        $stmt = $this->db->prepare($sql);
        $params = ['anio' => $anio];
        if ($tipo) $params['tipo'] = $tipo;
        
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function createMetrica($data) {
        $sql = "INSERT INTO bsc_metricas (nombre, tipo, anio, mes, meta, actual, unidad) 
                VALUES (:nombre, :tipo, :anio, :mes, :meta, :actual, :unidad)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function updateMetrica($id, $data) {
        // Whitelist de campos permitidos para evitar inyección de nombres de columna
        $allowedFields = ['nombre', 'tipo', 'anio', 'mes', 'meta', 'actual', 'unidad'];

        $fields       = [];
        $filteredData = [];
        foreach ($data as $key => $value) {
            if (!in_array($key, $allowedFields, true)) continue;
            $fields[]            = "$key = :$key";
            $filteredData[$key]  = $value;
        }

        if (empty($fields)) return false;

        $sql                = "UPDATE bsc_metricas SET " . implode(', ', $fields) . " WHERE id = :id";
        $filteredData['id'] = $id;
        $stmt               = $this->db->prepare($sql);
        return $stmt->execute($filteredData);
    }

    public function deleteMetrica($id) {
        $stmt = $this->db->prepare("DELETE FROM bsc_metricas WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // Archivos
    public function getArchivos() {
        $stmt = $this->db->query("SELECT * FROM bsc_archivos ORDER BY fecha_subida DESC");
        return $stmt->fetchAll();
    }

    public function addArchivo($titulo, $ruta) {
        $stmt = $this->db->prepare("INSERT INTO bsc_archivos (titulo, ruta) VALUES (?, ?)");
        return $stmt->execute([$titulo, $ruta]);
    }

    public function deleteArchivo($id) {
        // Primero obtener la ruta para borrar el archivo físico si fuera necesario (opcional por ahora)
        $stmt = $this->db->prepare("DELETE FROM bsc_archivos WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
