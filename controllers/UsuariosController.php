<?php
// controllers/UsuariosController.php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../controllers/AuthController.php';

class UsuariosController {
    private $userModel;

    private const ALLOWED_ROLES  = ['invitado', 'director', 'admin'];
    private const ALLOWED_STATES = ['activo', 'inactivo'];

    public function __construct() {
        $action = $_GET['action'] ?? 'usuarios';
        if ($action !== 'profile') {
            AuthController::checkAdmin();
        } else {
            AuthController::checkAuth();
        }
        $this->userModel = new User();
    }

    public function index() {
        $usuarios = $this->userModel->getAll(true);
        require __DIR__ . '/../views/usuarios/index.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();

            $nombre   = trim($_POST['nombre'] ?? '');
            $email    = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
            $password = $_POST['password'] ?? '';
            $rol      = $_POST['rol'] ?? '';
            $area     = trim($_POST['area'] ?? '');

            if (empty($nombre) || strlen($nombre) > 255) {
                $error = "Nombre inválido (máximo 255 caracteres).";
                require __DIR__ . '/../views/usuarios/create.php';
                return;
            }
            if (!$email) {
                $error = "Correo electrónico inválido.";
                require __DIR__ . '/../views/usuarios/create.php';
                return;
            }
            if (strlen($password) < 8 ||
                !preg_match('/[A-Z]/', $password) ||
                !preg_match('/[0-9]/', $password) ||
                !preg_match('/[\W_]/', $password)) {
                $error = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
                require __DIR__ . '/../views/usuarios/create.php';
                return;
            }
            if (!in_array($rol, self::ALLOWED_ROLES, true)) {
                http_response_code(400);
                die('Rol inválido.');
            }
            if (empty($area) || strlen($area) > 255) {
                $error = "Área inválida (máximo 255 caracteres).";
                require __DIR__ . '/../views/usuarios/create.php';
                return;
            }

            $data = [
                'nombre'   => $nombre,
                'email'    => $email,
                'password' => $password,
                'rol'      => $rol,
                'area'     => $area,
            ];

            if ($this->userModel->create($data)) {
                AuthController::logSecurity('USER_CREATED', "email=$email rol=$rol");
                header('Location: index.php?action=usuarios');
                exit();
            }
        }
        require __DIR__ . '/../views/usuarios/create.php';
    }

    public function edit() {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            header('Location: index.php?action=usuarios');
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();

            $nombre = trim($_POST['nombre'] ?? '');
            $email  = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
            $rol    = $_POST['rol'] ?? '';
            $area   = trim($_POST['area'] ?? '');
            $estado = $_POST['estado'] ?? '';

            if (empty($nombre) || strlen($nombre) > 255) { http_response_code(400); die('Nombre inválido.'); }
            if (!$email)                                  { http_response_code(400); die('Email inválido.'); }
            if (!in_array($rol, self::ALLOWED_ROLES, true))  { http_response_code(400); die('Rol inválido.'); }
            if (!in_array($estado, self::ALLOWED_STATES, true)) { http_response_code(400); die('Estado inválido.'); }
            if (empty($area) || strlen($area) > 255)      { http_response_code(400); die('Área inválida.'); }

            $data = [
                'nombre' => $nombre,
                'email'  => $email,
                'rol'    => $rol,
                'area'   => $area,
                'estado' => $estado,
            ];

            if (!empty($_POST['password'])) {
                $pw = $_POST['password'];
                if (strlen($pw) < 8 ||
                    !preg_match('/[A-Z]/', $pw) ||
                    !preg_match('/[0-9]/', $pw) ||
                    !preg_match('/[\W_]/', $pw)) {
                    http_response_code(400);
                    die('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
                }
                $data['password'] = $pw;
            }

            if ($this->userModel->update($id, $data)) {
                AuthController::logSecurity('USER_UPDATED', "id=$id");
                header('Location: index.php?action=usuarios');
                exit();
            }
        }

        $usuario = $this->userModel->findById($id);
        if (!$usuario) {
            header('Location: index.php?action=usuarios');
            exit();
        }
        require __DIR__ . '/../views/usuarios/edit.php';
    }

    public function delete() {
        // Las operaciones destructivas deben ser POST con CSRF
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=usuarios');
            exit();
        }
        AuthController::verifyCsrf();

        $id = (int)($_POST['id'] ?? 0);
        // No permitir que el admin se elimine a sí mismo
        if ($id > 0 && $id !== (int)$_SESSION['user_id']) {
            $this->userModel->delete($id);
            AuthController::logSecurity('USER_DEACTIVATED', "id=$id");
        }
        header('Location: index.php?action=usuarios');
        exit();
    }

    public function profile() {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)$_SESSION['user_id'];

        // Comparación estricta para evitar type-juggling
        if ($_SESSION['user_rol'] !== 'admin' && $id !== (int)$_SESSION['user_id']) {
            header('Location: index.php?action=profile');
            exit();
        }

        $usuario = $this->userModel->findById($id);

        if (!$usuario) {
            header('Location: index.php?action=usuarios');
            exit();
        }

        require_once __DIR__ . '/../models/Pendiente.php';
        $pendienteModel = new Pendiente();

        $todos = $pendienteModel->getAll(['responsable_id' => $id]);

        $hoy    = date('Y-m-d');
        $proximo = date('Y-m-d', strtotime('+7 days'));

        $clasificados = [
            'vencidos'  => [],
            'proximos'  => [],
            'al_dia'    => [],
            'cerrados'  => []
        ];

        foreach ($todos as $p) {
            if ($p['estado'] === 'cerrado') {
                $clasificados['cerrados'][] = $p;
            } elseif ($p['fecha_compromiso'] < $hoy) {
                $clasificados['vencidos'][] = $p;
            } elseif ($p['fecha_compromiso'] <= $proximo) {
                $clasificados['proximos'][] = $p;
            } else {
                $clasificados['al_dia'][] = $p;
            }
        }

        require __DIR__ . '/../views/usuarios/perfil.php';
    }
}
