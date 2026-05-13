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

    private function rls(): array {
        return [
            'user_id'   => $_SESSION['user_id']   ?? 0,
            'user_rol'  => $_SESSION['user_rol']  ?? '',
            'user_area' => $_SESSION['user_area'] ?? '',
        ];
    }

    public function index() {
        $rls = $this->rls();

        if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'invitado') {
            // Un invitado no ve estadísticas globales
            $stats = null;
            $pendientesVencidos = [];
        } else {
            $stats = $this->pendienteModel->getStats($rls);
            $pendientesVencidos = $this->pendienteModel->getAll(['estado' => 'abierto'], $rls);
        }
        $usuarios = $this->userModel->getAll();

        // Pendientes activos del usuario logueado como responsable
        $misPendientes = $this->pendienteModel->getAll([
            'responsable_id' => $_SESSION['user_id']
        ], $rls);
        $misPendientes = array_filter($misPendientes, fn($p) => $p['estado'] !== 'cerrado');

        require __DIR__ . '/../views/dashboard/index.php';
    }
}
