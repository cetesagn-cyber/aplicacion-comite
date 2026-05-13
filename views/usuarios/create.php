<?php
// views/usuarios/create.php
$pageTitle = "Nuevo Usuario";
require __DIR__ . '/../layout/header.php';
?>

<div class="card max-width-600">
    <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700;">Crear Nuevo Usuario</h3>
        <p style="color: var(--text-muted);">Defina las credenciales y el rol del nuevo participante.</p>
    </div>

    <form action="index.php?action=usuario_create" method="POST">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
        <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" name="nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
        </div>
        <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" class="form-control" placeholder="juan.perez@empresa.com" required>
        </div>
        <div class="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" class="form-control" required>
        </div>
        <div class="form-group">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Rol</label>
                    <select name="rol" class="form-control" required>
                        <option value="invitado">Invitado (Solo ve sus tareas)</option>
                        <option value="director">Director/Responsable</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div>
                    <label>Área</label>
                    <input type="text" name="area" class="form-control" placeholder="Ej: Operaciones" required>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="submit" class="btn btn-primary">Guardar Usuario</button>
            <a href="index.php?action=usuarios" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>
