<?php
// controllers/DashboardController.php
require_once __DIR__ . '/../models/Pendiente.php';
require_once __DIR__ . '/../models/User.php';

class DashboardController {
    private $pendienteModel;
    private $userModel;

    public function __construct() {
        $this->pendienteModel = new Pendiente();
        $this->userModel = new User();
    }

    public function index() {
        if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'invitado') {
            // Un invitado no ve estadísticas globales
            $stats = null;
            $pendientesVencidos = [];
        } else {
            $stats = $this->pendienteModel->getStats();
            $pendientesVencidos = $this->pendienteModel->getAll(['estado' => 'abierto']);
        }
        $usuarios = $this->userModel->getAll();
        
        // Pendientes activos del usuario logueado como responsable
        $misPendientes = $this->pendienteModel->getAll([
            'responsable_id' => $_SESSION['user_id']
        ]);
        $misPendientes = array_filter($misPendientes, fn($p) => $p['estado'] !== 'cerrado');

        require __DIR__ . '/../views/dashboard/index.php';
    }
}
