<?php
// controllers/PendientesController.php
require_once __DIR__ . '/../models/Pendiente.php';
require_once __DIR__ . '/../models/Seguimiento.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../controllers/AuthController.php';

class PendientesController {
    private $pendienteModel;
    private $seguimientoModel;
    private $userModel;

    private const ALLOWED_TIPOS       = ['rutina', 'estrategico'];
    private const ALLOWED_NATURALEZAS = ['decision','solicitud_info','delegacion','escalamiento','negociacion','averiguacion','aprobacion','compra','capacitacion','analisis','plan_accion','otra'];
    private const ALLOWED_PRIORIDADES = ['alta', 'media', 'baja'];
    private const ALLOWED_ESTADOS     = ['abierto', 'en_progreso', 'bloqueado', 'cerrado'];
    private const ALLOWED_IMPACTOS    = ['EBIT', 'Gross', 'Eficiencia', 'Gente', 'Riesgo'];

    public function __construct() {
        $this->pendienteModel   = new Pendiente();
        $this->seguimientoModel = new Seguimiento();
        $this->userModel        = new User();
    }

    // ─── Upload Seguro ────────────────────────────────────────────────────────

    /**
     * Procesa un upload de archivo con validación de extensión, MIME y tamaño.
     * Devuelve el nombre del archivo guardado, o null si falla.
     */
    private function processUpload(array $file, string $uploadDir): ?string {
        if ($file['error'] !== UPLOAD_ERR_OK) return null;

        $allowedExt  = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'xls', 'doc', 'docx'];
        $allowedMime = [
            'application/pdf',
            'image/jpeg', 'image/png', 'image/gif',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) return null;

        if ($file['size'] > 10 * 1024 * 1024) return null; // 10 MB máximo

        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime  = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if (!in_array($mime, $allowedMime, true)) return null;
        }

        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $newName = bin2hex(random_bytes(16)) . '.' . $ext;
        $dest    = $uploadDir . $newName;

        if (!move_uploaded_file($file['tmp_name'], $dest)) return null;

        return $newName;
    }

    // ─── Validación de campos de pendiente ────────────────────────────────────

    private function validateEnums(array $post): void {
        if (!in_array($post['tipo'] ?? '', self::ALLOWED_TIPOS, true))       { http_response_code(400); die('Tipo inválido.'); }
        if (!in_array($post['naturaleza'] ?? '', self::ALLOWED_NATURALEZAS, true)) { http_response_code(400); die('Naturaleza inválida.'); }
        if (!in_array($post['prioridad'] ?? '', self::ALLOWED_PRIORIDADES, true))  { http_response_code(400); die('Prioridad inválida.'); }

        $porcentaje = (int)($post['porcentaje_avance'] ?? 0);
        if ($porcentaje < 0 || $porcentaje > 100) { http_response_code(400); die('Porcentaje inválido.'); }

        $fechaInicio    = $post['fecha_inicio'] ?? '';
        $fechaCompromiso = $post['fecha_compromiso'] ?? '';
        if (!empty($fechaInicio) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaInicio)) {
            http_response_code(400); die('Fecha de inicio inválida.');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaCompromiso)) {
            http_response_code(400); die('Fecha de compromiso inválida.');
        }

        // Filtrar impactos a solo los valores permitidos
        if (isset($post['impacto']) && is_array($post['impacto'])) {
            foreach ($post['impacto'] as $imp) {
                if (!in_array($imp, self::ALLOWED_IMPACTOS, true)) {
                    http_response_code(400); die('Impacto inválido.');
                }
            }
        }
    }

    // ─── Row Level Security ───────────────────────────────────────────────────

    private function rls(): array {
        return [
            'user_id'   => $_SESSION['user_id']   ?? 0,
            'user_rol'  => $_SESSION['user_rol']  ?? '',
            'user_area' => $_SESSION['user_area'] ?? '',
        ];
    }

    // ─── Acciones ─────────────────────────────────────────────────────────────

    public function index() {
        $filters = [
            'estado'         => $_GET['estado'] ?? '',
            'tipo'           => $_GET['tipo'] ?? '',
            'prioridad'      => $_GET['prioridad'] ?? '',
            'responsable_id' => $_GET['responsable_id'] ?? ''
        ];

        if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'invitado') {
            $filters['responsable_id'] = $_SESSION['user_id'];
        }

        $pendientes = $this->pendienteModel->getAll($filters, $this->rls());
        $usuarios   = $this->userModel->getAll();

        require __DIR__ . '/../views/pendientes/index.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();

            $titulo = trim($_POST['titulo'] ?? '');
            if (empty($titulo) || strlen($titulo) > 500) {
                http_response_code(400); die('Título inválido.');
            }

            $this->validateEnums($_POST);

            $impactoFiltrado = array_filter(
                $_POST['impacto'] ?? [],
                fn($i) => in_array($i, self::ALLOWED_IMPACTOS, true)
            );

            $data = [
                'titulo'                    => $titulo,
                'descripcion'               => trim($_POST['descripcion'] ?? ''),
                'tipo'                      => $_POST['tipo'],
                'naturaleza'                => $_POST['naturaleza'],
                'contribucion'              => trim($_POST['contribucion'] ?? '') ?: null,
                'impacto'                   => implode(',', $impactoFiltrado),
                'prioridad'                 => $_POST['prioridad'],
                'estado'                    => 'abierto',
                'estado_avance'             => $_POST['estado_avance'] ?? null,
                'porcentaje_avance'         => (int)($_POST['porcentaje_avance'] ?? 0),
                'objetivo_id'               => !empty($_POST['objetivo_id']) ? (int)$_POST['objetivo_id'] : null,
                'proyecto_id'               => !empty($_POST['proyecto_id']) ? (int)$_POST['proyecto_id'] : null,
                'fecha_inicio'              => $_POST['fecha_inicio'] ?? date('Y-m-d'),
                'fecha_compromiso'          => $_POST['fecha_compromiso'],
                'fecha_compromiso_original' => $_POST['fecha_compromiso'],
                'creado_por'                => $_SESSION['user_id'],
                'responsable_id'            => (int)$_POST['responsable_id'],
                'solicitado_por_id'         => !empty($_POST['solicitado_por_id']) ? (int)$_POST['solicitado_por_id'] : null,
            ];

            if ($this->pendienteModel->create($data)) {
                header('Location: index.php?action=pendientes_list');
                exit();
            }
        }
        $usuarios = $this->userModel->getAll();
        require_once __DIR__ . '/../models/Objetivo.php';
        require_once __DIR__ . '/../models/Proyecto.php';
        $objetivosAgrupados = (new Objetivo())->getAllGroupedByYear();
        $proyectos          = (new Proyecto())->getAll();
        require __DIR__ . '/../views/pendientes/create.php';
    }

    public function detail() {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            header('Location: index.php?action=pendientes_list');
            exit();
        }

        $pendiente = $this->pendienteModel->findById($id, $this->rls());
        if (!$pendiente) {
            header('Location: index.php?action=pendientes_list');
            exit();
        }
        $seguimientos = $this->seguimientoModel->getByPendiente($id);
        $usuarios     = $this->userModel->getAll();

        require __DIR__ . '/../views/pendientes/detail.php';
    }

    public function addSeguimiento() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();

            $pendiente_id = (int)($_POST['pendiente_id'] ?? 0);
            $accion       = trim($_POST['accion'] ?? '');
            $descripcion  = trim($_POST['descripcion'] ?? '');

            $allowedAcciones = ['comentario','en_proceso','decision','solicitud','delegacion','postergada','cierre'];
            if (!in_array($accion, $allowedAcciones, true)) {
                http_response_code(400); die('Acción inválida.');
            }
            if (empty($descripcion)) {
                http_response_code(400); die('Descripción requerida.');
            }

            $evidencia  = null;
            $uploadDir  = __DIR__ . '/../uploads/';
            if (isset($_FILES['evidencia']) && $_FILES['evidencia']['error'] !== UPLOAD_ERR_NO_FILE) {
                $evidencia = $this->processUpload($_FILES['evidencia'], $uploadDir);
            }

            $data = [
                'pendiente_id' => $pendiente_id,
                'usuario_id'   => $_SESSION['user_id'],
                'accion'       => $accion,
                'descripcion'  => $descripcion,
                'evidencia'    => $evidencia,
            ];

            if ($this->seguimientoModel->add($data)) {
                $updateData = [];
                if (isset($_POST['porcentaje_avance'])) {
                    $pct = (int)$_POST['porcentaje_avance'];
                    $updateData['porcentaje_avance'] = max(0, min(100, $pct));
                }
                if (!empty($_POST['nueva_fecha_compromiso'])) {
                    $nf = $_POST['nueva_fecha_compromiso'];
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $nf)) {
                        $updateData['fecha_compromiso'] = $nf;
                    }
                }

                if ($accion === 'cierre') {
                    $updateData['estado']      = 'cerrado';
                    $updateData['fecha_cierre'] = date('Y-m-d');
                } elseif ($accion === 'postergada') {
                    $updateData['estado'] = 'bloqueado';
                } elseif (in_array($accion, ['en_proceso', 'decision', 'comentario'], true)) {
                    $updateData['estado'] = 'en_progreso';
                }

                $updateData['fecha_actualizacion'] = date('Y-m-d H:i:s');

                if (!empty($updateData)) {
                    $this->pendienteModel->update($pendiente_id, $updateData);
                }

                header('Location: index.php?action=pendiente_detail&id=' . $pendiente_id);
                exit();
            }
        }
    }

    public function delegar() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AuthController::verifyCsrf();

            $id    = (int)($_POST['id'] ?? 0);
            $email = trim($_POST['email'] ?? '');

            if ($id && strlen($email) <= 255) {
                if ($this->pendienteModel->update($id, ['delegado_a' => $email])) {
                    header('Location: index.php?action=pendiente_detail&id=' . $id . '&delegado=1');
                    exit();
                }
            }
        }
    }

    public function comite() {
        $filters = [
            'estado'         => $_GET['estado'] ?? 'activos',
            'tipo'           => $_GET['tipo'] ?? '',
            'responsable_id' => $_GET['responsable_id'] ?? ''
        ];

        if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'invitado') {
            $filters['responsable_id'] = $_SESSION['user_id'];
        }

        $pendientes = $this->pendienteModel->getAll($filters, $this->rls());

        usort($pendientes, function($a, $b) {
            $dateA = strtotime($a['fecha_compromiso']);
            $dateB = strtotime($b['fecha_compromiso']);
            if ($dateA !== $dateB) return $dateA <=> $dateB;
            $prioMap = ['alta' => 1, 'media' => 2, 'baja' => 3];
            return ($prioMap[$a['prioridad']] ?? 9) <=> ($prioMap[$b['prioridad']] ?? 9);
        });

        $agrupados = ['rutina' => [], 'estrategico' => []];
        foreach ($pendientes as $p) {
            $agrupados[$p['tipo']][] = $p;
        }

        $usuarios = $this->userModel->getAll();
        require __DIR__ . '/../views/pendientes/comite.php';
    }

    public function export() {
        $filters = [
            'estado'         => $_GET['estado'] ?? '',
            'tipo'           => $_GET['tipo'] ?? '',
            'responsable_id' => $_GET['responsable_id'] ?? ''
        ];
        $pendientes = $this->pendienteModel->getAll($filters, $this->rls());

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=compromisos_comite_' . date('Y-m-d') . '.csv');
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($output, ['ID', 'Título', 'Tipo', 'Impacto', 'Prioridad', 'Estado', 'Responsable', 'Fecha Compromiso']);

        foreach ($pendientes as $p) {
            fputcsv($output, [
                $p['id'],
                $p['titulo'],
                ucfirst($p['tipo']),
                $p['impacto'],
                ucfirst($p['prioridad']),
                ucfirst($p['estado']),
                $p['responsable'],
                $p['fecha_compromiso']
            ]);
        }
        fclose($output);
        exit();
    }

    public function edit() {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { header('Location: index.php?action=pendientes_list'); exit(); }

        $pendiente = $this->pendienteModel->findById($id);
        if (!$pendiente) { header('Location: index.php?action=pendientes_list'); exit(); }

        $usuarios  = $this->userModel->getAll();
        $directivos = array_filter($usuarios, fn($u) => $u['rol'] === 'director');

        require_once __DIR__ . '/../models/Objetivo.php';
        require_once __DIR__ . '/../models/Proyecto.php';
        $objetivosAgrupados = (new Objetivo())->getAllGroupedByYear();
        $proyectos          = (new Proyecto())->getAll();

        require __DIR__ . '/../views/pendientes/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=pendientes_list'); exit();
        }
        AuthController::verifyCsrf();

        $id = (int)($_POST['id'] ?? 0);
        if (!$id) { header('Location: index.php?action=pendientes_list'); exit(); }

        $titulo = trim($_POST['titulo'] ?? '');
        if (empty($titulo) || strlen($titulo) > 500) {
            http_response_code(400); die('Título inválido.');
        }

        if (!in_array($_POST['tipo'] ?? '', self::ALLOWED_TIPOS, true))    { http_response_code(400); die('Tipo inválido.'); }
        if (!in_array($_POST['prioridad'] ?? '', self::ALLOWED_PRIORIDADES, true)) { http_response_code(400); die('Prioridad inválida.'); }
        if (!in_array($_POST['estado'] ?? '', self::ALLOWED_ESTADOS, true)) { http_response_code(400); die('Estado inválido.'); }
        if (!in_array($_POST['naturaleza'] ?? '', self::ALLOWED_NATURALEZAS, true)) { http_response_code(400); die('Naturaleza inválida.'); }

        $porcentaje = (int)($_POST['porcentaje_avance'] ?? 0);
        if ($porcentaje < 0 || $porcentaje > 100) { http_response_code(400); die('Porcentaje inválido.'); }

        $impactoFiltrado = array_filter(
            $_POST['impacto'] ?? [],
            fn($i) => in_array($i, self::ALLOWED_IMPACTOS, true)
        );

        $data = [
            'titulo'            => $titulo,
            'descripcion'       => trim($_POST['descripcion'] ?? ''),
            'tipo'              => $_POST['tipo'],
            'naturaleza'        => $_POST['naturaleza'],
            'contribucion'      => trim($_POST['contribucion'] ?? '') ?: null,
            'prioridad'         => $_POST['prioridad'],
            'estado'            => $_POST['estado'],
            'estado_avance'     => $_POST['estado_avance'] ?? null,
            'porcentaje_avance' => $porcentaje,
            'objetivo_id'       => !empty($_POST['objetivo_id']) ? (int)$_POST['objetivo_id'] : null,
            'proyecto_id'       => !empty($_POST['proyecto_id']) ? (int)$_POST['proyecto_id'] : null,
            'fecha_inicio'      => $_POST['fecha_inicio'],
            'fecha_compromiso'  => $_POST['fecha_compromiso'],
            'responsable_id'    => (int)$_POST['responsable_id'],
            'solicitado_por_id' => !empty($_POST['solicitado_por_id']) ? (int)$_POST['solicitado_por_id'] : null,
            'impacto'           => implode(',', $impactoFiltrado),
            'delegado_a'        => trim($_POST['delegado_a'] ?? '') ?: null,
        ];

        if ($data['estado'] === 'cerrado') {
            $data['fecha_cierre'] = date('Y-m-d');
        } else {
            $data['fecha_cierre'] = null;
        }
        $data['fecha_actualizacion'] = date('Y-m-d H:i:s');

        $this->pendienteModel->update($id, $data);
        header('Location: index.php?action=pendiente_detail&id=' . $id . '&updated=1');
        exit();
    }

    public function inlineUpdate() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' ||
            !isset($_SESSION['user_rol']) ||
            $_SESSION['user_rol'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No autorizado']);
            exit();
        }

        AuthController::verifyCsrf();

        $id        = $_POST['id'] ?? null;
        $field     = $_POST['field'] ?? null;
        $value     = $_POST['value'] ?? null;
        $direction = $_POST['direction'] ?? null;

        if (!$id) {
            $input     = json_decode(file_get_contents('php://input'), true);
            $id        = $input['id'] ?? null;
            $field     = $input['field'] ?? null;
            $value     = $input['value'] ?? null;
            $direction = $input['direction'] ?? null;
        }

        $success = false;

        if ($direction) {
            $p      = $this->pendienteModel->findById((int)$id);
            $estados = ['abierto', 'en_progreso', 'bloqueado', 'cerrado'];
            $idx    = array_search($p['estado'], $estados);

            if ($direction === 'next' && $idx < 3) {
                $newVal = $estados[$idx + 1];
            } elseif ($direction === 'back' && $idx > 0) {
                $newVal = $estados[$idx - 1];
            }

            if (isset($newVal)) {
                $upd = ['estado' => $newVal];
                if ($newVal === 'cerrado') $upd['fecha_cierre'] = date('Y-m-d');
                if ($newVal !== 'cerrado') $upd['fecha_cierre'] = null;
                $success = $this->pendienteModel->update((int)$id, $upd);
            }
        } else {
            $allowedFields = ['prioridad','tipo','estado','estado_avance','porcentaje_avance','fecha_compromiso','responsable_id'];
            if (in_array($field, $allowedFields, true)) {
                $success = $this->pendienteModel->update((int)$id, [$field => $value]);
            }
        }

        header('Content-Type: application/json');
        echo json_encode(['success' => $success]);
        exit();
    }

    public function delete() {
        // Las operaciones destructivas deben ser POST con CSRF
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?action=pendientes_list');
            exit();
        }
        AuthController::verifyCsrf();

        if (!isset($_SESSION['user_rol']) || $_SESSION['user_rol'] !== 'admin') {
            header('Location: index.php?action=pendientes_list');
            exit();
        }

        $id = (int)($_POST['id'] ?? 0);
        if ($id) {
            $this->pendienteModel->delete($id);
            AuthController::logSecurity('PENDIENTE_DELETED', "id=$id");
        }
        header('Location: index.php?action=pendientes_list');
        exit();
    }

    public function matrixUpdate() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' ||
            !isset($_SESSION['user_rol']) ||
            $_SESSION['user_rol'] !== 'admin') {
            exit();
        }

        AuthController::verifyCsrf();

        $id         = (int)($_POST['id'] ?? 0);
        $prioridad  = $_POST['prioridad'] ?? '';
        $impactType = $_POST['impact_type'] ?? '';

        if (!in_array($prioridad, self::ALLOWED_PRIORIDADES, true)) exit();
        if (!in_array($impactType, ['high', 'low'], true)) exit();

        $p       = $this->pendienteModel->findById($id);
        $impacts = explode(',', $p['impacto']);

        if ($impactType === 'high' && count($impacts) < 2) {
            if (!in_array('EBIT', $impacts)) $impacts[] = 'EBIT';
            if (count($impacts) < 2)         $impacts[] = 'Riesgo';
        } elseif ($impactType === 'low' && count($impacts) >= 2) {
            $impacts = [$impacts[0]];
        }

        $this->pendienteModel->update($id, [
            'prioridad' => $prioridad,
            'impacto'   => implode(',', array_filter($impacts))
        ]);

        echo json_encode(['success' => true]);
        exit();
    }
}
