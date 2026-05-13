<?php
// models/Pendiente.php
require_once __DIR__ . '/../config/database.php';

class Pendiente {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO pendientes (titulo, descripcion, tipo, naturaleza, contribucion, impacto, prioridad, estado, estado_avance, porcentaje_avance, objetivo_id, proyecto_id, fecha_inicio, fecha_compromiso, fecha_compromiso_original, creado_por, responsable_id, solicitado_por_id) 
                VALUES (:titulo, :descripcion, :tipo, :naturaleza, :contribucion, :impacto, :prioridad, :estado, :estado_avance, :porcentaje_avance, :objetivo_id, :proyecto_id, :fecha_inicio, :fecha_compromiso, :fecha_compromiso_original, :creado_por, :responsable_id, :solicitado_por_id)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function update($id, $data) {
        // Whitelist de campos permitidos para evitar inyección de nombres de columna
        $allowedFields = [
            'titulo', 'descripcion', 'tipo', 'naturaleza', 'contribucion', 'impacto',
            'prioridad', 'estado', 'estado_avance', 'porcentaje_avance', 'objetivo_id',
            'proyecto_id', 'fecha_inicio', 'fecha_compromiso', 'responsable_id',
            'solicitado_por_id', 'delegado_a', 'fecha_cierre', 'fecha_actualizacion'
        ];

        $fields       = [];
        $filteredData = [];
        foreach ($data as $key => $value) {
            if (!in_array($key, $allowedFields, true)) continue;
            $fields[]            = "$key = :$key";
            $filteredData[$key]  = $value;
        }

        if (empty($fields)) return false;

        $sql              = "UPDATE pendientes SET " . implode(', ', $fields) . " WHERE id = :id";
        $filteredData['id'] = $id;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($filteredData);
    }

    public function findById($id) {
        $sql = "SELECT p.*, u1.nombre as creador, u2.nombre as responsable, u2.area as responsable_area,
                        u3.nombre as solicitado_por_nombre,
                        o.titulo as objetivo_titulo, o.porcentaje_avance as objetivo_porcentaje, o.fecha_ultimo_avance as objetivo_fecha,
                        pr.titulo as proyecto_titulo
                FROM pendientes p 
                JOIN usuarios u1 ON p.creado_por = u1.id 
                JOIN usuarios u2 ON p.responsable_id = u2.id
                LEFT JOIN usuarios u3 ON p.solicitado_por_id = u3.id
                LEFT JOIN objetivos o ON p.objetivo_id = o.id
                LEFT JOIN proyectos pr ON p.proyecto_id = pr.id
                WHERE p.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getAll($filters = []) {
        $sql = "SELECT p.*, u.nombre as responsable, u.area as responsable_area,
                        us.nombre as solicitado_por_nombre
                FROM pendientes p 
                JOIN usuarios u ON p.responsable_id = u.id
                LEFT JOIN usuarios us ON p.solicitado_por_id = us.id";
        
        $where = [];
        $params = [];

        if (isset($filters['estado']) && $filters['estado'] != '') {
            if ($filters['estado'] === 'activos') {
                $where[] = "p.estado IN ('abierto', 'en_progreso')";
            } else {
                $where[] = "p.estado = ?";
                $params[] = $filters['estado'];
            }
        }
        if (isset($filters['tipo']) && $filters['tipo'] != '') {
            $where[] = "p.tipo = ?";
            $params[] = $filters['tipo'];
        }
        if (isset($filters['prioridad']) && $filters['prioridad'] != '') {
            $where[] = "p.prioridad = ?";
            $params[] = $filters['prioridad'];
        }
        if (isset($filters['responsable_id']) && $filters['responsable_id'] != '') {
            $where[] = "p.responsable_id = ?";
            $params[] = $filters['responsable_id'];
        }
        if (isset($filters['proyecto_id'])) {
            if ($filters['proyecto_id'] === 'NULL') {
                $where[] = "p.proyecto_id IS NULL";
            } else {
                $where[] = "p.proyecto_id = ?";
                $params[] = $filters['proyecto_id'];
            }
        }

        if (count($where) > 0) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " ORDER BY p.fecha_creacion DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getStats() {
        $stats = [
            'estados' => [],
            'impactos' => [
                'EBIT' => 0,
                'Gross' => 0,
                'Eficiencia' => 0,
                'Gente' => 0,
                'Riesgo' => 0
            ],
            'responsables' => [],
            'cumplimiento' => 0
        ];

        // Por estado
        $stmt = $this->db->query("SELECT estado, COUNT(*) as total FROM pendientes GROUP BY estado");
        $stats['estados'] = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Por impacto (SET)
        $stmt = $this->db->query("SELECT impacto FROM pendientes");
        while ($row = $stmt->fetch()) {
            $impacts = explode(',', $row['impacto']);
            foreach ($impacts as $imp) {
                if ($imp && isset($stats['impactos'][$imp])) {
                    $stats['impactos'][$imp]++;
                }
            }
        }

        // Pendientes activos por responsable (excluye cerrados)
        $stmt = $this->db->query(
            "SELECT u.nombre, COUNT(*) as total 
             FROM pendientes p 
             JOIN usuarios u ON p.responsable_id = u.id 
             WHERE p.estado != 'cerrado'
             GROUP BY u.nombre 
             ORDER BY total DESC"
        );
        $stats['responsables'] = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Calcular cumplimiento %
        $total = array_sum($stats['estados']);
        if ($total > 0) {
            $cerrados = $stats['estados']['cerrado'] ?? 0;
            $stats['cumplimiento'] = round(($cerrados / $total) * 100);
        }

        return $stats;
    }

    public function getByProyecto($proyecto_id) {
        $sql = "SELECT p.*, u.nombre as responsable 
                FROM pendientes p 
                JOIN usuarios u ON p.responsable_id = u.id 
                WHERE p.proyecto_id = ?
                ORDER BY p.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$proyecto_id]);
        return $stmt->fetchAll();
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM pendientes WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getStatsByResponsable() {
        $sql = "SELECT u.id as responsable_id, u.nombre as responsable, 
                       COUNT(p.id) as total,
                       SUM(CASE WHEN p.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
                       SUM(CASE WHEN p.estado != 'cerrado' AND p.fecha_compromiso < CURRENT_DATE THEN 1 ELSE 0 END) as vencidos,
                       AVG(p.porcentaje_avance) as avance_promedio
                FROM usuarios u
                LEFT JOIN pendientes p ON u.id = p.responsable_id
                GROUP BY u.id, u.nombre
                ORDER BY vencidos DESC, total DESC";
        return $this->db->query($sql)->fetchAll();
    }
}
