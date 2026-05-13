<?php
// views/usuarios/edit.php
$pageTitle = "Editar Usuario";
require __DIR__ . '/../layout/header.php';
?>

<div class="card max-width-600">
    <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700;">Editar Usuario: <?php echo htmlspecialchars($usuario['nombre'], ENT_QUOTES, 'UTF-8'); ?></h3>
        <p style="color: var(--text-muted);">Modifique los datos del usuario o actualice su contraseña.</p>
    </div>

    <form action="index.php?action=usuario_edit&id=<?php echo (int)$usuario['id']; ?>" method="POST">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
        <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" name="nombre" class="form-control" value="<?php echo htmlspecialchars($usuario['nombre'], ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>
        <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" class="form-control" value="<?php echo htmlspecialchars($usuario['email'], ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>
        <div class="form-group">
            <label>Nueva Contraseña (dejar en blanco para no cambiar)</label>
            <input type="password" name="password" class="form-control" placeholder="••••••••">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Rol</label>
                <select name="rol" class="form-control" required>
                    <option value="invitado" <?php echo ($usuario['rol'] == 'invitado') ? 'selected' : ''; ?>>Invitado</option>
                    <option value="director" <?php echo ($usuario['rol'] == 'director') ? 'selected' : ''; ?>>Director/Responsable</option>
                    <option value="admin" <?php echo ($usuario['rol'] == 'admin') ? 'selected' : ''; ?>>Administrador</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Estado</label>
                <select name="estado" class="form-control" required>
                    <option value="activo" <?php echo ($usuario['estado'] == 'activo') ? 'selected' : ''; ?>>Activo</option>
                    <option value="inactivo" <?php echo ($usuario['estado'] == 'inactivo') ? 'selected' : ''; ?>>Inactivo</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>Área</label>
            <input type="text" name="area" class="form-control" value="<?php echo htmlspecialchars($usuario['area'], ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary">Actualizar Cambios</button>
            <a href="index.php?action=usuarios" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>
