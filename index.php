<?php
// index.php

// Hardening de sesión: configurar antes de session_start()
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 1800);
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}

session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AuthController.php';

// Inicializar token CSRF para sesiones autenticadas
AuthController::initCsrf();

$action = $_GET['action'] ?? 'dashboard';

// Simple Router
switch ($action) {
    case 'login':
        $auth = new AuthController();
        $auth->login();
        break;

    case 'logout':
        $auth = new AuthController();
        $auth->logout();
        break;

    case 'dashboard':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/DashboardController.php';
        (new DashboardController())->index();
        break;

    case 'pendientes_list':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->index();
        break;

    case 'pendiente_create':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->create();
        break;

    case 'pendiente_detail':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->detail();
        break;

    case 'pendiente_add_seguimiento':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->addSeguimiento();
        break;

    case 'pendiente_delegar':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->delegar();
        break;

    case 'pendiente_edit':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->edit();
        break;

    case 'pendiente_update':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->update();
        break;

    case 'pendiente_inline_update':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->inlineUpdate();
        break;

    case 'pendiente_matrix_update':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->matrixUpdate();
        break;
    
    case 'pendiente_delete':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->delete();
        break;

    case 'comite_view':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->comite();
        break;

    case 'estrategia':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/EstrategiaController.php';
        (new EstrategiaController())->index();
        break;

    case 'estrategia_kanban':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/EstrategiaController.php';
        (new EstrategiaController())->kanban();
        break;

    case 'bsc':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->index();
        break;

    case 'bsc_metrica_create':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->create_metrica();
        break;

    case 'bsc_metrica_update':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->update_metrica();
        break;

    case 'bsc_metrica_delete':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->delete_metrica();
        break;

    case 'bsc_upload':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->upload_archivo();
        break;

    case 'bsc_archivo_delete':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/BscController.php';
        (new BscController())->delete_archivo();
        break;

    case 'estrategia_matriz':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/EstrategiaController.php';
        (new EstrategiaController())->matriz();
        break;

    case 'estrategia_gantt':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/EstrategiaController.php';
        (new EstrategiaController())->gantt();
        break;

    case 'estrategia_salud':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/EstrategiaController.php';
        (new EstrategiaController())->salud();
        break;

    case 'usuarios':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/UsuariosController.php';
        (new UsuariosController())->index();
        break;
    
    case 'profile':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/UsuariosController.php';
        (new UsuariosController())->profile();
        break;

    case 'export_csv':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/PendientesController.php';
        (new PendientesController())->export();
        break;

    case 'usuario_create':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/UsuariosController.php';
        (new UsuariosController())->create();
        break;

    case 'usuario_edit':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/UsuariosController.php';
        (new UsuariosController())->edit();
        break;

    case 'usuario_delete':
        AuthController::checkAdmin();
        require_once __DIR__ . '/controllers/UsuariosController.php';
        (new UsuariosController())->delete();
        break;

    case 'objetivos':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/ObjetivosController.php';
        (new ObjetivosController())->index();
        break;

    case 'objetivo_store':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ObjetivosController.php';
        (new ObjetivosController())->store();
        break;
        
    case 'objetivo_update':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ObjetivosController.php';
        (new ObjetivosController())->update();
        break;
        
    case 'objetivo_progress':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/ObjetivosController.php';
        (new ObjetivosController())->updateProgress();
        break;
        
    case 'objetivo_delete':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ObjetivosController.php';
        (new ObjetivosController())->delete();
        break;

    case 'proyectos':
        AuthController::checkAuth();
        require_once __DIR__ . '/controllers/ProyectosController.php';
        (new ProyectosController())->index();
        break;

    case 'proyecto_store':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ProyectosController.php';
        (new ProyectosController())->store();
        break;

    case 'proyecto_update':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ProyectosController.php';
        (new ProyectosController())->update();
        break;

    case 'proyecto_delete':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ProyectosController.php';
        (new ProyectosController())->delete();
        break;

    case 'proyecto_vincular_pendientes':
        AuthController::checkDirectorOrAdmin();
        require_once __DIR__ . '/controllers/ProyectosController.php';
        (new ProyectosController())->vincularPendientes();
        break;

    default:
        header('Location: index.php?action=dashboard');
        break;
}
