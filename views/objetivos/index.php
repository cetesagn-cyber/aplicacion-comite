<?php
// views/objetivos/index.php
$pageTitle = "Objetivos Estratégicos";
require __DIR__ . '/../layout/header.php';
$isAdmin = isset($_SESSION['user_rol']) && ($_SESSION['user_rol'] === 'admin' || $_SESSION['user_rol'] === 'director');
?>

<div style="max-width: 900px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--secondary);">Objetivos del Negocio</h2>
            <p style="color: var(--text-muted); margin-top: 0.25rem;">Consulte la dirección del negocio aplicable por año para validar la pertinencia de las actividades.</p>
        </div>
        <?php if ($isAdmin): ?>
        <button type="button" class="btn btn-primary" onclick="document.getElementById('createObjectiveForm').style.display = document.getElementById('createObjectiveForm').style.display === 'none' ? 'block' : 'none';">
            <i data-lucide="plus"></i> Nuevo Objetivo
        </button>
        <?php endif; ?>
    </div>

    <?php if (isset($_GET['status'])): ?>
        <?php if ($_GET['status'] == 'created'): ?>
            <div class="alert" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem; border: 1px solid rgba(16, 185, 129, 0.2);">
                Objetivo registrado exitosamente.
            </div>
        <?php elseif ($_GET['status'] == 'updated'): ?>
            <div class="alert" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem; border: 1px solid rgba(16, 185, 129, 0.2);">
                Objetivo actualizado exitosamente.
            </div>
        <?php elseif ($_GET['status'] == 'deleted'): ?>
            <div class="alert" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem; border: 1px solid rgba(239, 68, 68, 0.2);">
                Objetivo eliminado.
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <?php if ($isAdmin): ?>
    <div class="card" id="createObjectiveForm" style="margin-bottom: 2rem; border-left: 4px solid var(--primary); display: none; animation: slideDown 0.3s ease-out;">
        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Registrar Nuevo Objetivo</h3>
        <form action="index.php?action=objetivo_store" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label for="anio" style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Año</label>
                    <input type="number" id="anio" name="anio" class="form-control" value="<?php echo date('Y'); ?>" required>
                </div>
                <div>
                    <label for="titulo" style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Título / Categoría</label>
                    <input type="text" id="titulo" name="titulo" class="form-control" placeholder="Ej: Expandir mercado nacional" required>
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="descripcion" style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Descripción del Objetivo</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3" placeholder="Transcriba o detalle los criterios del objetivo aquí..." required></textarea>
            </div>
            <div style="text-align: right; display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('createObjectiveForm').style.display = 'none';">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1.5rem;">
                    <i data-lucide="save" style="width: 16px; height: 16px;"></i> Guardar Objetivo
                </button>
            </div>
        </form>
    </div>
    <style>
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    </style>
    <?php endif; ?>

    <!-- Listado por años -->
    <?php if (empty($objetivosAgrupados)): ?>
        <div class="card" style="text-align: center; padding: 3rem;">
            <i data-lucide="target" style="width: 48px; height: 48px; color: var(--border); margin-bottom: 1rem; display: inline-block;"></i>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--text);">Sin objetivos registrados</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Actualmente no hay objetivos transcritos en el sistema.</p>
        </div>
    <?php else: ?>
        <?php foreach ($objetivosAgrupados as $anio => $objetivos): ?>
            <div style="margin-bottom: 3rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.75rem; font-weight: 800; color: var(--primary);"><?php echo $anio; ?></h3>
                    <div style="height: 1px; flex: 1; background: var(--border);"></div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <?php foreach ($objetivos as $obj): ?>
                        <details style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; padding: 0;">
                            <summary style="padding: 1rem 1.5rem; font-weight: 600; font-size: 1.05rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none; user-select: none;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; padding-right: 2rem;">
                                    <i data-lucide="chevron-down" class="details-icon" style="color: var(--text-muted); transition: transform 0.2s;"></i>
                                    <div style="flex: 1;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                            <span><?php echo htmlspecialchars($obj['titulo']); ?></span>
                                            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--primary);"><?php echo $obj['porcentaje_avance']; ?>%</span>
                                        </div>
                                        <?php 
                                            $isStalledObj = false;
                                            if (!empty($obj['fecha_ultimo_avance'])) {
                                                $dias = round((time() - strtotime($obj['fecha_ultimo_avance'])) / (60 * 60 * 24));
                                                if ($dias > 14 && $obj['porcentaje_avance'] < 100) $isStalledObj = true;
                                            } else if ($obj['porcentaje_avance'] < 100) {
                                                $isStalledObj = true;
                                            }
                                        ?>
                                        <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                                            <div style="width: <?php echo $obj['porcentaje_avance']; ?>%; height: 100%; background: <?php echo $isStalledObj ? 'var(--danger)' : 'var(--primary)'; ?>;"></div>
                                        </div>
                                        <?php if ($isStalledObj): ?>
                                            <div style="font-size: 0.7rem; color: var(--danger); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem;">
                                                <i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> Objetivo estancado (más de 2 semanas sin avance)
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;" onclick="event.preventDefault();">
                                    <button type="button" class="btn btn-primary btn-progress-obj" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" data-id="<?php echo $obj['id']; ?>" data-progreso="<?php echo $obj['porcentaje_avance']; ?>">
                                        <i data-lucide="bar-chart-2" style="width: 14px; height: 14px;"></i> Avance
                                    </button>
                                    <?php if ($isAdmin): ?>
                                        <button type="button" class="btn btn-secondary btn-edit-obj" style="padding: 0.25rem 0.5rem;" data-id="<?php echo $obj['id']; ?>" data-anio="<?php echo $obj['anio']; ?>" data-titulo="<?php echo htmlspecialchars($obj['titulo']); ?>" data-desc="<?php echo htmlspecialchars($obj['descripcion']); ?>">
                                            <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
                                        </button>
                                        <form method="POST" action="index.php?action=objetivo_delete" style="display:inline;" onsubmit="return confirm('¿Seguro de eliminar este objetivo?');">
                                            <input type="hidden" name="id" value="<?php echo (int)$obj['id']; ?>">
                                            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                            <button type="submit" class="btn btn-danger" style="padding: 0.25rem 0.5rem;">
                                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </div>
                            </summary>
                            <div style="padding: 1.5rem; border-top: 1px solid var(--border); color: var(--text); background: rgba(0,0,0,0.02); line-height: 1.6; white-space: pre-wrap;"><?php echo htmlspecialchars($obj['descripcion']); ?></div>
                        </details>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<style>
/* Animación simple para details marker */
details > summary::marker,
details > summary::-webkit-details-marker {
    display: none;
}
details[open] > summary .details-icon {
    transform: rotate(180deg);
}
/* Modal styles para editar si es admin */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000;
}
.modal-overlay.active { display: flex; }
</style>

<?php if ($isAdmin): ?>
<!-- Edit Object Modal -->
<div class="modal-overlay" id="editModal">
    <div class="card" style="width: 100%; max-width: 600px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Editar Objetivo</h3>
        <form action="index.php?action=objetivo_update" method="POST">
            <input type="hidden" id="edit_id" name="id">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Año</label>
                    <input type="number" id="edit_anio" name="anio" class="form-control" required>
                </div>
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Título / Categoría</label>
                    <input type="text" id="edit_titulo" name="titulo" class="form-control" required>
                </div>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Descripción del Objetivo</label>
                <textarea id="edit_descripcion" name="descripcion" class="form-control" rows="5" required></textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('editModal').classList.remove('active');">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<!-- Progress Modal (Available for all) -->
<div class="modal-overlay" id="progressModal">
    <div class="card" style="width: 100%; max-width: 400px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Reportar Avance</h3>
        <form action="index.php?action=objetivo_progress" method="POST">
            <input type="hidden" id="prog_id" name="id">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">% de Avance Actual</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <input type="range" id="prog_slider" class="form-control" min="0" max="100" style="flex: 1;" oninput="document.getElementById('prog_number').value = this.value;">
                    <input type="number" id="prog_number" name="porcentaje_avance" class="form-control" style="width: 80px;" min="0" max="100" required oninput="document.getElementById('prog_slider').value = this.value;">
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('progressModal').classList.remove('active');">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Edit Modal (Only if exists)
    const editBtns = document.querySelectorAll('.btn-edit-obj');
    const editModal = document.getElementById('editModal');
    if (editBtns && editModal) {
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('edit_id').value = btn.getAttribute('data-id');
                document.getElementById('edit_anio').value = btn.getAttribute('data-anio');
                document.getElementById('edit_titulo').value = btn.getAttribute('data-titulo');
                document.getElementById('edit_descripcion').value = btn.getAttribute('data-desc');
                editModal.classList.add('active');
            });
        });
    }

    // Progress Modal
    const progBtns = document.querySelectorAll('.btn-progress-obj');
    const progModal = document.getElementById('progressModal');
    progBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('prog_id').value = btn.getAttribute('data-id');
            const p = btn.getAttribute('data-progreso');
            document.getElementById('prog_slider').value = p;
            document.getElementById('prog_number').value = p;
            progModal.classList.add('active');
        });
    });
});
</script>

<script>
    if (typeof lucide !== 'undefined') lucide.createIcons();
</script>
<?php require __DIR__ . '/../layout/footer.php'; ?>
