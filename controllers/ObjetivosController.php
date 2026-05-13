<?php
// controllers/ObjetivosController.php

require_once __DIR__ . '/../models/Objetivo.php';

class ObjetivosController {
    private $objetivoModel;

    public function __construct() {
        $this->objetivoModel = new Objetivo();
    }

    public function index() {
        $objetivosAgrupados = $this->objetivoModel->getAllGroupedByYear();
        require __DIR__ . '/../views/objetivos/index.php';
    }

    public function store() {
        AuthController::checkDirectorOrAdmin();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();
            $data = [
                'anio' => $_POST['anio'] ?? date('Y'),
                'titulo' => $_POST['titulo'] ?? '',
                'descripcion' => $_POST['descripcion'] ?? ''
            ];

            $this->objetivoModel->create($data);
            header('Location: index.php?action=objetivos&status=created');
            exit;
        }
    }

    public function update() {
        AuthController::checkDirectorOrAdmin();
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
            AuthController::verifyCsrf();
            $id = (int)($_POST['id'] ?? 0);
            $data = [
                'anio' => $_POST['anio'] ?? date('Y'),
                'titulo' => $_POST['titulo'] ?? '',
                'descripcion' => $_POST['descripcion'] ?? ''
            ];

            $this->objetivoModel->update($id, $data);
            header('Location: index.php?action=objetivos&status=updated');
            exit;
        }
    }

    public function delete() {
        AuthController::checkDirectorOrAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=objetivos');
            exit;
        }
        AuthController::verifyCsrf();
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $this->objetivoModel->delete($id);
        }
        header('Location: index.php?action=objetivos&status=deleted');
        exit;
    }

    public function updateProgress() {
        AuthController::checkAuth();
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id']) && isset($_POST['porcentaje_avance'])) {
            AuthController::verifyCsrf();
            $id = (int)($_POST['id'] ?? 0);
            $porcentaje = (int)$_POST['porcentaje_avance'];
            $this->objetivoModel->updateProgress($id, $porcentaje);
            header('Location: index.php?action=objetivos&status=updated');
            exit;
        }
    }
}
