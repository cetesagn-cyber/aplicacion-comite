<?php
// models/User.php
require_once __DIR__ . '/../config/database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE email = ? AND estado = 'activo'");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getAll($includeInactive = false) {
        $sql = "SELECT id, nombre, email, rol, area, estado FROM usuarios";
        if (!$includeInactive) {
            $sql .= " WHERE estado = 'activo'";
        }
        $sql .= " ORDER BY nombre ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO usuarios (nombre, email, password, rol, area) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['nombre'],
            $data['email'],
            password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            $data['rol'],
            $data['area']
        ]);
    }

    public function update($id, $data) {
        // Whitelist de campos permitidos para evitar inyección de nombres de columna
        $allowedFields = ['nombre', 'email', 'rol', 'area', 'estado', 'password'];

        $fields = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (!in_array($key, $allowedFields, true)) continue;

            if ($key === 'password' && !empty($value)) {
                $fields[] = "password = ?";
                $params[] = password_hash($value, PASSWORD_BCRYPT, ['cost' => 12]);
            } elseif ($key !== 'password') {
                $fields[] = "$key = ?";
                $params[] = $value;
            }
        }

        if (empty($fields)) return false;

        $params[] = $id;
        $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE usuarios SET estado = 'inactivo' WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function authenticate($email, $password) {
        $user = $this->findByEmail($email);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }
}
