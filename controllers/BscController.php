<?php
// controllers/BscController.php
require_once __DIR__ . '/../models/Bsc.php';
require_once __DIR__ . '/../controllers/AuthController.php';

class BscController {
    private $bscModel;

    public function __construct() {
        AuthController::checkAuth();
        $this->bscModel = new Bsc();
    }

    public function index() {
        $anio     = (int)($_GET['anio'] ?? date('Y'));
        $metricas = $this->bscModel->getMetricas($anio);
        $archivos = $this->bscModel->getArchivos();

        $anuales  = array_filter($metricas, fn($m) => $m['tipo'] === 'anual');
        $mensuales = array_filter($metricas, fn($m) => $m['tipo'] === 'mensual');

        require __DIR__ . '/../views/bsc/index.php';
    }

    public function create_metrica() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=bsc'); exit();
        }
        AuthController::verifyCsrf();

        $allowedTipos = ['anual', 'mensual'];
        $tipo         = $_POST['tipo'] ?? '';
        if (!in_array($tipo, $allowedTipos, true)) { http_response_code(400); die('Tipo inválido.'); }

        $nombre = trim($_POST['nombre'] ?? '');
        if (empty($nombre) || strlen($nombre) > 255) { http_response_code(400); die('Nombre inválido.'); }

        $anio = (int)($_POST['anio'] ?? date('Y'));
        if ($anio < 2000 || $anio > 2100) { http_response_code(400); die('Año inválido.'); }
        $mes  = ($tipo === 'mensual') ? (int)$_POST['mes'] : null;
        if ($mes !== null && ($mes < 1 || $mes > 12)) { http_response_code(400); die('Mes inválido.'); }

        $meta    = (float)($_POST['meta'] ?? 0);
        $actual  = (float)($_POST['actual'] ?? 0);
        $unidad  = trim($_POST['unidad'] ?? '$');
        if (strlen($unidad) > 10) $unidad = '$';

        $data = [
            'nombre' => $nombre,
            'tipo'   => $tipo,
            'anio'   => $anio,
            'mes'    => $mes,
            'meta'   => $meta,
            'actual' => $actual,
            'unidad' => $unidad,
        ];

        if ($this->bscModel->createMetrica($data)) {
            header('Location: index.php?action=bsc');
            exit();
        }
    }

    public function update_metrica() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=bsc'); exit();
        }
        AuthController::verifyCsrf();

        $id     = (int)($_POST['id'] ?? 0);
        $actual = (float)($_POST['actual'] ?? 0);

        if ($id > 0) {
            $this->bscModel->updateMetrica($id, ['actual' => $actual]);
        }
        header('Location: index.php?action=bsc');
        exit();
    }

    public function delete_metrica() {
        // Operación destructiva: solo POST con CSRF
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=bsc'); exit();
        }
        AuthController::verifyCsrf();

        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $this->bscModel->deleteMetrica($id);
            AuthController::logSecurity('BSC_METRICA_DELETED', "id=$id");
        }
        header('Location: index.php?action=bsc');
        exit();
    }

    public function upload_archivo() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=bsc'); exit();
        }
        AuthController::verifyCsrf();

        if (!isset($_FILES['archivo'])) {
            header('Location: index.php?action=bsc'); exit();
        }

        $titulo = trim($_POST['titulo'] ?? 'Documento BSC');
        if (strlen($titulo) > 255) $titulo = substr($titulo, 0, 255);

        $file      = $_FILES['archivo'];
        $uploadDir = __DIR__ . '/../uploads/bsc/';

        $allowedExt  = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'xls', 'doc', 'docx'];
        $allowedMime = [
            'application/pdf',
            'image/jpeg', 'image/png', 'image/gif',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if ($file['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedExt, true)) {
                header('Location: index.php?action=bsc&error=tipo_archivo'); exit();
            }
            if ($file['size'] > 20 * 1024 * 1024) { // 20 MB
                header('Location: index.php?action=bsc&error=archivo_grande'); exit();
            }
            if (!function_exists('finfo_open')) {
                header('Location: index.php?action=bsc&error=servidor'); exit();
            }
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime  = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if (!in_array($mime, $allowedMime, true)) {
                header('Location: index.php?action=bsc&error=tipo_archivo'); exit();
            }

            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            $newName    = bin2hex(random_bytes(16)) . '.' . $ext;
            $targetPath = $uploadDir . $newName;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $ruta = 'uploads/bsc/' . $newName;
                $this->bscModel->addArchivo($titulo, $ruta);
                AuthController::logSecurity('BSC_ARCHIVO_UPLOADED', "titulo=$titulo");
            }
        }

        header('Location: index.php?action=bsc');
        exit();
    }

    public function delete_archivo() {
        // Operación destructiva: solo POST con CSRF
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=bsc'); exit();
        }
        AuthController::verifyCsrf();

        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $this->bscModel->deleteArchivo($id);
            AuthController::logSecurity('BSC_ARCHIVO_DELETED', "id=$id");
        }
        header('Location: index.php?action=bsc');
        exit();
    }
}
