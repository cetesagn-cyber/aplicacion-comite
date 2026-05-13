<?php
// controllers/AuthController.php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    // ─── CSRF ─────────────────────────────────────────────────────────────────

    public static function initCsrf(): void {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
    }

    public static function getCsrfToken(): string {
        return $_SESSION['csrf_token'] ?? '';
    }

    /**
     * Verifica el token CSRF del request actual.
     * Acepta el token desde $_POST['csrf_token'] o la cabecera X-CSRF-Token (para AJAX).
     */
    public static function verifyCsrf(): void {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

        if (empty($token) || empty($_SESSION['csrf_token']) ||
            !hash_equals($_SESSION['csrf_token'], $token)) {

            self::logSecurity('CSRF_FAIL', 'token mismatch');

            $isJson = (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false)
                   || (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false);
            if ($isJson) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido.']);
                exit();
            }
            http_response_code(403);
            die('Token de seguridad inválido. Recargue la página e intente nuevamente.');
        }
    }

    // ─── Rate Limiting (file-based, por IP) ───────────────────────────────────

    private static function getRateLimitFile(): string {
        $dir = __DIR__ . '/../logs';
        if (!is_dir($dir)) mkdir($dir, 0750, true);
        return $dir . '/rate_limit.json';
    }

    private static function isRateLimited(string $ip): bool {
        $file = self::getRateLimitFile();
        if (!file_exists($file)) return false;

        $data   = json_decode(file_get_contents($file), true) ?: [];
        $now    = time();
        $window = 900; // 15 minutos
        $max    = 5;

        $attempts = array_filter($data[$ip] ?? [], fn($t) => ($now - $t) < $window);
        return count($attempts) >= $max;
    }

    private static function recordFailedLogin(string $ip): void {
        $file = self::getRateLimitFile();
        $data = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
        $data[$ip][] = time();
        file_put_contents($file, json_encode($data), LOCK_EX);
    }

    private static function clearRateLimit(string $ip): void {
        $file = self::getRateLimitFile();
        if (!file_exists($file)) return;
        $data = json_decode(file_get_contents($file), true) ?: [];
        unset($data[$ip]);
        file_put_contents($file, json_encode($data), LOCK_EX);
    }

    // ─── Logging ──────────────────────────────────────────────────────────────

    public static function logSecurity(string $event, string $detail = ''): void {
        $dir = __DIR__ . '/../logs';
        if (!is_dir($dir)) mkdir($dir, 0750, true);
        $userId = $_SESSION['user_id'] ?? 'guest';
        $ip     = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ts     = date('Y-m-d H:i:s');
        $line = "[$ts] $event | user=$userId | ip=$ip | $detail\n";
        $logFile = $dir . '/security.log';
        file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
        if (file_exists($logFile)) chmod($logFile, 0640);
    }

    // ─── Auth Actions ─────────────────────────────────────────────────────────

    public function login() {
        if (isset($_SESSION['user_id'])) {
            header('Location: index.php?action=dashboard');
            exit();
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $email    = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
            $password = $_POST['password'] ?? '';

            if (empty($email) || empty($password)) {
                $error = "Por favor, complete todos los campos.";
                require __DIR__ . '/../views/auth/login.php';
                return;
            }

            if (self::isRateLimited($ip)) {
                $error = "Demasiados intentos fallidos. Espere 15 minutos e intente de nuevo.";
                self::logSecurity('LOGIN_BLOCKED', "email_hash=" . substr(hash('sha256', $email), 0, 16));
                require __DIR__ . '/../views/auth/login.php';
                return;
            }

            $user = $this->userModel->authenticate($email, $password);

            if ($user) {
                self::clearRateLimit($ip);
                session_regenerate_id(true); // Previene session fixation
                $_SESSION['user_id']   = $user['id'];
                $_SESSION['user_name'] = $user['nombre'];
                $_SESSION['user_rol']  = $user['rol'];
                $_SESSION['user_area'] = $user['area'];
                self::initCsrf();
                self::logSecurity('LOGIN_OK', "email_hash=" . substr(hash('sha256', $email), 0, 16));
                header('Location: index.php?action=dashboard');
                exit();
            } else {
                self::recordFailedLogin($ip);
                self::logSecurity('LOGIN_FAIL', "email_hash=" . substr(hash('sha256', $email), 0, 16));
                $error = "Credenciales incorrectas o cuenta inactiva.";
                require __DIR__ . '/../views/auth/login.php';
            }
        } else {
            require __DIR__ . '/../views/auth/login.php';
        }
    }

    public function logout() {
        self::logSecurity('LOGOUT');
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']);
        }
        session_destroy();
        header('Location: index.php?action=login');
        exit();
    }

    // ─── Access Control ───────────────────────────────────────────────────────

    public static function checkAuth(): void {
        if (!isset($_SESSION['user_id'])) {
            header('Location: index.php?action=login');
            exit();
        }
    }

    public static function checkAdmin(): void {
        self::checkAuth();
        if ($_SESSION['user_rol'] !== 'admin') {
            self::logSecurity('ACCESS_DENIED', 'required=admin');
            header('Location: index.php?action=dashboard&error=access_denied');
            exit();
        }
    }

    public static function checkDirectorOrAdmin(): void {
        self::checkAuth();
        if ($_SESSION['user_rol'] !== 'admin' && $_SESSION['user_rol'] !== 'director') {
            self::logSecurity('ACCESS_DENIED', 'required=director_or_admin');
            header('Location: index.php?action=dashboard&error=access_denied');
            exit();
        }
    }
}
