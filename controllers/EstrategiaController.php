<?php
// controllers/EstrategiaController.php
require_once __DIR__ . '/../models/Pendiente.php';
require_once __DIR__ . '/../controllers/AuthController.php';

class EstrategiaController {
    private $pendienteModel;

    public function __construct() {
        AuthController::checkAuth();
        $this->pendienteModel = new Pendiente();
    }

    public function index() {
        // Vista principal con las 4 miniaturas
        require __DIR__ . '/../views/estrategia/index.php';
    }

    public function kanban() {
        $pendientes = $this->pendienteModel->getAll(['estado' => 'activos']);
        
        // Agrupar por estado para el Kanban
        $columnas = [
            'abierto' => [],
            'en_progreso' => [],
            'bloqueado' => [],
            'cerrado' => []
        ];

        foreach ($pendientes as $p) {
            $columnas[$p['estado']][] = $p;
        }

        require __DIR__ . '/../views/estrategia/kanban.php';
    }

    public function matriz() {
        // Prioridad vs Impacto
        $pendientes = $this->pendienteModel->getAll(['estado' => 'activos']);
        require __DIR__ . '/../views/estrategia/matriz.php';
    }

    public function gantt() {
        // Obtener TODOS los compromisos para que la línea de tiempo esté completa
        $pendientes = $this->pendienteModel->getAll();
        require __DIR__ . '/../views/estrategia/gantt.php';
    }

    public function salud() {
        // Obtener estadísticas por responsable
        $stats = $this->pendienteModel->getStatsByResponsable();
        require __DIR__ . '/../views/estrategia/salud.php';
    }
}
