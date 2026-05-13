<?php
// views/usuarios/index.php
$pageTitle = "Gestión de Usuarios";
require __DIR__ . '/../layout/header.php';
?>

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700;">Usuarios Registrados</h3>
        <a href="index.php?action=usuario_create" class="btn btn-primary" style="width: auto;">
            <i data-lucide="user-plus" style="width: 18px; margin-right: 8px;"></i> Nuevo Usuario
        </a>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Área</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($usuarios as $u): ?>
                <tr>
                    <td style="font-weight: 600;">
                        <a href="index.php?action=profile&id=<?php echo $u['id']; ?>" style="color: var(--secondary); text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="eye" style="width: 14px; opacity: 0.5;"></i>
                            <?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?>
                        </a>
                    </td>
                    <td><?php echo htmlspecialchars($u['email'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><span class="badge badge-secondary"><?php echo htmlspecialchars(ucfirst($u['rol']), ENT_QUOTES, 'UTF-8'); ?></span></td>
                    <td><?php echo htmlspecialchars($u['area'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td>
                        <span class="badge <?php echo $u['estado'] == 'activo' ? 'badge-success' : 'badge-danger'; ?>">
                            <?php echo ucfirst($u['estado']); ?>
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <a href="index.php?action=usuario_edit&id=<?php echo $u['id']; ?>" class="btn-icon" title="Editar">
                                <i data-lucide="edit-3"></i>
                            </a>
                            <?php if ($u['estado'] == 'activo'): ?>
                                <form action="index.php?action=usuario_delete" method="POST" style="display:inline;">
                                    <input type="hidden" name="id" value="<?php echo (int)$u['id']; ?>">
                                    <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                    <button type="submit" class="btn-icon text-danger" title="Desactivar"
                                            onclick="return confirm('¿Está seguro de desactivar este usuario?')"
                                            style="background:none;border:none;cursor:pointer;padding:0;">
                                        <i data-lucide="user-minus"></i>
                                    </button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>
