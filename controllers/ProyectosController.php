<?php
// controllers/ProyectosController.php

require_once __DIR__ . '/../models/Proyecto.php';
require_once __DIR__ . '/../models/Objetivo.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/AuthController.php';

class ProyectosController {
    private $proyectoModel;
    private $objetivoModel;
    private $userModel;

    public function __construct() {
        $this->proyectoModel = new Proyecto();
        $this->objetivoModel = new Objetivo();
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
        $rls      = $this->rls();
        $proyectos = $this->proyectoModel->getAll($rls);
        $objetivosAgrupados = $this->objetivoModel->getAllGroupedByYear();

        // Cargar pendientes de cada proyecto
        require_once __DIR__ . '/../models/Pendiente.php';
        $pendienteModel = new Pendiente();
        foreach ($proyectos as &$p) {
            $p['pendientes'] = $pendienteModel->getByProyecto($p['id']);
        }
        unset($p);

        $isAdmin = isset($_SESSION['user_rol']) && ($_SESSION['user_rol'] === 'admin' || $_SESSION['user_rol'] === 'director');
        $pageTitle = 'Gestión de Proyectos';
        $usuarios = $this->userModel->getAll();
        $directivos = array_filter($usuarios, fn($u) => $u['rol'] === 'director');

        // Pendientes sin proyecto (para vincular)
        $pendientesSinProyecto = $pendienteModel->getAll(['proyecto_id' => 'NULL'], $rls);

        require __DIR__ . '/../views/proyectos/index.php';
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=proyectos');
            exit();
        }
        AuthController::verifyCsrf();
        $objId1 = !empty($_POST['objetivo_id_1']) ? (int)$_POST['objetivo_id_1'] : null;
        $objId2 = !empty($_POST['objetivo_id_2']) ? (int)$_POST['objetivo_id_2'] : null;
        $respId = !empty($_POST['responsable_id']) ? (int)$_POST['responsable_id'] : null;
        $data = [
            'titulo' => trim($_POST['titulo']),
            'descripcion' => trim($_POST['descripcion']),
            'fecha_cumplimiento' => !empty($_POST['fecha_cumplimiento']) ? $_POST['fecha_cumplimiento'] : null,
            'objetivo_id_1' => $objId1 > 0 ? $objId1 : null,
            'objetivo_id_2' => $objId2 > 0 ? $objId2 : null,
            'responsable_id' => $respId > 0 ? $respId : null,
        ];

        if (!empty($data['titulo'])) {
            $this->proyectoModel->create($data);
        }
        header('Location: index.php?action=proyectos');
        exit();
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=proyectos');
            exit();
        }
        AuthController::verifyCsrf();
        $id = (int)($_POST['id'] ?? 0);
        $objId1 = !empty($_POST['objetivo_id_1']) ? (int)$_POST['objetivo_id_1'] : null;
        $objId2 = !empty($_POST['objetivo_id_2']) ? (int)$_POST['objetivo_id_2'] : null;
        $respId = !empty($_POST['responsable_id']) ? (int)$_POST['responsable_id'] : null;
        $data = [
            'titulo' => trim($_POST['titulo']),
            'descripcion' => trim($_POST['descripcion']),
            'fecha_cumplimiento' => !empty($_POST['fecha_cumplimiento']) ? $_POST['fecha_cumplimiento'] : null,
            'objetivo_id_1' => $objId1 > 0 ? $objId1 : null,
            'objetivo_id_2' => $objId2 > 0 ? $objId2 : null,
            'responsable_id' => $respId > 0 ? $respId : null,
        ];

        if ($id > 0 && !empty($data['titulo'])) {
            $this->proyectoModel->update($id, $data);
        }
        header('Location: index.php?action=proyectos');
        exit();
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=proyectos');
            exit();
        }
        AuthController::verifyCsrf();
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $this->proyectoModel->delete($id);
        }
        header('Location: index.php?action=proyectos');
        exit();
    }

    public function vincularPendientes() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=proyectos');
            exit();
        }
        AuthController::verifyCsrf();
        $proyecto_id = (int)($_POST['proyecto_id'] ?? 0);
        $pendientes_ids = $_POST['pendientes_ids'] ?? [];

        if ($proyecto_id > 0) {
            require_once __DIR__ . '/../models/Pendiente.php';
            $pendienteModel = new Pendiente();
            foreach ($pendientes_ids as $p_id) {
                $pendienteModel->update((int)$p_id, ['proyecto_id' => $proyecto_id]);
            }
        }
        header('Location: index.php?action=proyectos');
        exit();
    }
}
