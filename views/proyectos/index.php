<?php
require __DIR__ . '/../layout/header.php';

// Helper para opciones de objetivos (Movido al inicio)
if (!function_exists('renderObjetivoOptions')) {
    function renderObjetivoOptions($objetivosAgrupados, $selectedId = null) {
        $html = '<option value="">— Ninguno —</option>';
        if (!empty($objetivosAgrupados)) {
            foreach ($objetivosAgrupados as $anio => $objs) {
                $html .= '<optgroup label="' . $anio . '">';
                foreach ($objs as $obj) {
                    $sel = ($selectedId == $obj['id']) ? 'selected' : '';
                    $html .= '<option value="' . $obj['id'] . '" ' . $sel . '>' . htmlspecialchars($obj['titulo']) . '</option>';
                }
                $html .= '</optgroup>';
            }
        }
        return $html;
    }
}
?>

<div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 2rem;">
    <?php if ($isAdmin): ?>
    <button type="button" class="btn btn-primary" onclick="document.getElementById('createModal').classList.add('active');" style="box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
        <i data-lucide="plus"></i> Nuevo Proyecto
    </button>
    <?php endif; ?>
</div>

<?php if (empty($proyectos)): ?>
    <div class="card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <i data-lucide="folder-open" style="width: 48px; height: 48px; margin: 0 auto 1rem; display: block; opacity: 0.4;"></i>
        <p>No hay proyectos registrados aún. Crea el primero con el botón de arriba.</p>
    </div>
<?php else: ?>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <?php foreach ($proyectos as $p): ?>
            <?php
                $prjNum = 'PRJ-' . str_pad($p['id'], 3, '0', STR_PAD_LEFT);
                $pendientesCount = count($p['pendientes']);
                $pendientesActivos = array_filter($p['pendientes'], fn($pen) => $pen['estado'] !== 'cerrado');
                $avgAvance = $pendientesCount > 0 ? round(array_sum(array_column($p['pendientes'], 'porcentaje_avance')) / $pendientesCount) : 0;
            ?>
            <details class="card" style="padding: 0; overflow: hidden;" id="proj-<?php echo $p['id']; ?>">
                <summary style="padding: 1.25rem 1.5rem; cursor: pointer; list-style: none; user-select: none; display: flex; align-items: center; gap: 1rem;">
                    <!-- Project Number badge -->
                    <span style="flex-shrink: 0; background: var(--primary); color: white; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; letter-spacing: 0.5px;"><?php echo $prjNum; ?></span>

                    <!-- Title + progress bar -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <span style="font-weight: 700; font-size: 1rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><?php echo htmlspecialchars($p['titulo']); ?></span>
                            <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); margin-left: 1rem; flex-shrink: 0;"><?php echo $avgAvance; ?>% promedio</span>
                        </div>
                        <div style="width: 100%; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden;">
                            <div style="width: <?php echo $avgAvance; ?>%; height: 100%; background: var(--primary); transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <!-- Meta info -->
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: 0.75rem; margin-left: 0.5rem;">
                        <?php if (!empty($p['responsable_nombre'])): ?>
                            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-muted);">
                                <div style="width: 22px; height: 22px; background: var(--border); border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.625rem; color: var(--secondary);"><?php echo substr($p['responsable_nombre'], 0, 1); ?></div>
                                <?php echo $p['responsable_nombre']; ?>
                            </div>
                        <?php endif; ?>
                        <span style="font-size: 0.75rem; color: var(--text-muted);"><?php echo $pendientesCount; ?> pedido<?php echo $pendientesCount != 1 ? 's' : ''; ?></span>
                        <i data-lucide="chevron-down" class="details-icon" style="color: var(--text-muted); transition: transform 0.2s; flex-shrink: 0;"></i>
                    </div>
                </summary>

                <!-- Expanded body -->
                <div style="border-top: 1px solid var(--border); padding: 1.5rem;">

                    <!-- Description + Date + Objectives row -->
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Descripción</h4>
                                <?php if ($p['fecha_cumplimiento']): ?>
                                    <div style="text-align: right;">
                                        <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Fecha Compromiso</h4>
                                        <span style="font-size: 0.875rem; font-weight: 700; color: <?php echo (strtotime($p['fecha_cumplimiento']) < time()) ? 'var(--danger)' : 'var(--primary)'; ?>;">
                                            <i data-lucide="calendar" style="width: 14px; height: 14px; display: inline; vertical-align: text-bottom; margin-right: 4px;"></i>
                                            <?php echo date('d/m/Y', strtotime($p['fecha_cumplimiento'])); ?>
                                        </span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text); white-space: pre-wrap; line-height: 1.6;"><?php echo $p['descripcion'] ? htmlspecialchars($p['descripcion']) : '<em style="color:var(--text-muted)">Sin descripción.</em>'; ?></p>
                        </div>
                        <div>
                            <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">Objetivos Vinculados</h4>
                            <?php if ($p['objetivo_1_titulo']): ?>
                                <div style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span class="badge badge-primary" style="font-size: 0.65rem; flex-shrink: 0; margin-top: 2px;">Principal</span>
                                    <span style="font-size: 0.875rem;"><?php echo htmlspecialchars($p['objetivo_1_titulo']); ?></span>
                                </div>
                            <?php endif; ?>
                            <?php if ($p['objetivo_2_titulo']): ?>
                                <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                                    <span class="badge badge-secondary" style="font-size: 0.65rem; flex-shrink: 0; margin-top: 2px;">Secundario</span>
                                    <span style="font-size: 0.875rem;"><?php echo htmlspecialchars($p['objetivo_2_titulo']); ?></span>
                                </div>
                            <?php endif; ?>
                            <?php if (!$p['objetivo_1_titulo'] && !$p['objetivo_2_titulo']): ?>
                                <span style="font-size: 0.875rem; color: var(--text-muted); font-style: italic;">Sin objetivos vinculados</span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Pendientes vinculados -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                                <i data-lucide="list-checks" style="width: 14px; height: 14px;"></i> Pedidos Vinculados
                            </h4>
                            <?php if ($isAdmin && !empty($pendientesSinProyecto)): ?>
                                <button type="button" class="btn btn-secondary btn-vincular" 
                                    data-id="<?php echo $p['id']; ?>"
                                    data-titulo="<?php echo htmlspecialchars($p['titulo']); ?>"
                                    style="font-size: 0.75rem; padding: 0.3rem 0.6rem; width: auto;">
                                    <i data-lucide="link" style="width: 12px; height: 12px;"></i> Vincular Existentes
                                </button>
                            <?php endif; ?>
                        </div>
                        <?php if (empty($p['pendientes'])): ?>
                            <p style="font-size: 0.875rem; color: var(--text-muted); font-style: italic;">Ningún pedido ha sido vinculado a este proyecto aún.</p>
                        <?php else: ?>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <?php foreach ($p['pendientes'] as $pen): ?>
                                    <?php
                                        $estadoClass = $pen['estado'] == 'cerrado' ? 'badge-success' : ($pen['estado'] == 'bloqueado' ? 'badge-danger' : ($pen['estado'] == 'en_progreso' ? 'badge-warning' : 'badge-secondary'));
                                        $barColor = $pen['estado'] == 'cerrado' ? 'var(--success, #22c55e)' : 'var(--primary)';
                                    ?>
                                    <div style="display: flex; align-items: center; gap: 1rem; background: var(--surface-hover, rgba(0,0,0,0.03)); border-radius: 8px; padding: 0.6rem 1rem;">
                                        <span class="badge <?php echo $estadoClass; ?>" style="font-size: 0.65rem; flex-shrink: 0;"><?php echo str_replace('_', ' ', $pen['estado']); ?></span>
                                        <a href="index.php?action=pendiente_detail&id=<?php echo $pen['id']; ?>" style="flex: 1; font-size: 0.875rem; font-weight: 600; color: var(--text); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="<?php echo htmlspecialchars($pen['titulo']); ?>">
                                            <?php echo htmlspecialchars($pen['titulo']); ?>
                                        </a>
                                        <span style="font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0;"><?php echo $pen['responsable']; ?></span>
                                        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; min-width: 100px;">
                                            <div style="width: 60px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                                                <div style="width: <?php echo $pen['porcentaje_avance']; ?>%; height: 100%; background: <?php echo $barColor; ?>;"></div>
                                            </div>
                                            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text);"><?php echo $pen['porcentaje_avance']; ?>%</span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Admin actions -->
                    <?php if ($isAdmin): ?>
                    <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary btn-edit-proj"
                            data-id="<?php echo $p['id']; ?>"
                            data-titulo="<?php echo htmlspecialchars($p['titulo']); ?>"
                            data-desc="<?php echo htmlspecialchars($p['descripcion']); ?>"
                            data-fecha="<?php echo $p['fecha_cumplimiento']; ?>"
                            data-obj1="<?php echo $p['objetivo_id_1']; ?>"
                            data-obj2="<?php echo $p['objetivo_id_2']; ?>"
                            data-resp="<?php echo $p['responsable_id']; ?>"
                            style="font-size: 0.8125rem;">
                            <i data-lucide="pencil" style="width: 14px; height: 14px;"></i> Editar Proyecto
                        </button>
                        <form method="POST" action="index.php?action=proyecto_delete" style="display:inline;" onsubmit="return confirm('¿Seguro de eliminar este proyecto?');">
                            <input type="hidden" name="id" value="<?php echo (int)$p['id']; ?>">
                            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                            <button type="submit" class="btn btn-danger" style="font-size: 0.8125rem;">
                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Eliminar
                            </button>
                        </form>
                    </div>
                    <?php endif; ?>

                </div>
            </details>
        <?php endforeach; ?>
    </div>
<?php endif; ?>



<?php if ($isAdmin): ?>
<!-- Create Modal -->
<div class="modal-overlay" id="createModal">
    <div class="card" style="width: 100%; max-width: 620px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="folder-plus" style="width: 20px; height: 20px; color: var(--primary);"></i> Nuevo Proyecto
        </h3>
        <form action="index.php?action=proyecto_store" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Título del Proyecto *</label>
                <input type="text" name="titulo" class="form-control" required placeholder="Ej: Expansión Planta Norte">
            </div>
            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Descripción General</label>
                <textarea name="descripcion" class="form-control" rows="4" placeholder="Describe el alcance del proyecto..."></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Responsable</label>
                    <select name="responsable_id" class="form-control">
                        <option value="">— Sin asignar —</option>
                        <?php foreach ($directivos as $u): ?>
                            <option value="<?php echo $u['id']; ?>"><?php echo htmlspecialchars($u['nombre']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Fecha de Cumplimiento</label>
                    <input type="date" name="fecha_cumplimiento" class="form-control">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Objetivo Principal</label>
                    <select name="objetivo_id_1" class="form-control"><?php echo renderObjetivoOptions($objetivosAgrupados); ?></select>
                </div>
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Objetivo Secundario</label>
                    <select name="objetivo_id_2" class="form-control"><?php echo renderObjetivoOptions($objetivosAgrupados); ?></select>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('createModal').classList.remove('active');">Cancelar</button>
                <button type="submit" class="btn btn-primary"><i data-lucide="save" style="width: 14px; height: 14px;"></i> Guardar</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal-overlay" id="editModal">
    <div class="card" style="width: 100%; max-width: 620px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="pencil" style="width: 20px; height: 20px; color: var(--primary);"></i> Editar Proyecto
        </h3>
        <form action="index.php?action=proyecto_update" method="POST">
            <input type="hidden" id="edit_id" name="id">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Título del Proyecto *</label>
                <input type="text" id="edit_titulo" name="titulo" class="form-control" required>
            </div>
            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Descripción General</label>
                <textarea id="edit_descripcion" name="descripcion" class="form-control" rows="4"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Responsable</label>
                    <select id="edit_responsable" name="responsable_id" class="form-control">
                        <option value="">— Sin asignar —</option>
                        <?php foreach ($directivos as $u): ?>
                            <option value="<?php echo $u['id']; ?>"><?php echo htmlspecialchars($u['nombre']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Fecha de Cumplimiento</label>
                    <input type="date" id="edit_fecha" name="fecha_cumplimiento" class="form-control">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Objetivo Principal</label>
                    <select id="edit_obj1" name="objetivo_id_1" class="form-control"><?php echo renderObjetivoOptions($objetivosAgrupados); ?></select>
                </div>
                <div>
                    <label style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Objetivo Secundario</label>
                    <select id="edit_obj2" name="objetivo_id_2" class="form-control"><?php echo renderObjetivoOptions($objetivosAgrupados); ?></select>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('editModal').classList.remove('active');">Cancelar</button>
                <button type="submit" class="btn btn-primary"><i data-lucide="save" style="width: 14px; height: 14px;"></i> Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>

<!-- Link Pendientes Modal -->
<div class="modal-overlay" id="vincularModal">
    <div class="card" style="width: 100%; max-width: 550px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="link" style="width: 20px; height: 20px; color: var(--primary);"></i> Vincular Pedidos
        </h3>
        <p id="vincular_proyecto_nombre" style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; font-weight: 600;"></p>
        
        <form action="index.php?action=proyecto_vincular_pendientes" method="POST">
            <input type="hidden" id="vincular_proyecto_id" name="proyecto_id">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            
            <div style="max-height: 350px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem; margin-bottom: 1.5rem;">
                <?php if (empty($pendientesSinProyecto)): ?>
                    <p style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.875rem;">No hay pedidos disponibles para vincular.</p>
                <?php else: ?>
                    <?php foreach ($pendientesSinProyecto as $pen): ?>
                        <label style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='transparent'">
                            <input type="checkbox" name="pendientes_ids[]" value="<?php echo $pen['id']; ?>" style="width: 18px; height: 18px; accent-color: var(--primary);">
                            <div style="flex: 1;">
                                <div style="font-size: 0.875rem; font-weight: 600;"><?php echo htmlspecialchars($pen['titulo']); ?></div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo $pen['responsable']; ?> — <?php echo date('d/m/Y', strtotime($pen['fecha_compromiso'])); ?></div>
                            </div>
                        </label>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('vincularModal').classList.remove('active');">Cancelar</button>
                <button type="submit" class="btn btn-primary" <?php echo empty($pendientesSinProyecto) ? 'disabled' : ''; ?>>
                    <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Vincular Seleccionados
                </button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Edit Modal
    const editModal = document.getElementById('editModal');
    if (editModal) {
        document.querySelectorAll('.btn-edit-proj').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const id = btn.getAttribute('data-id');
                const titulo = btn.getAttribute('data-titulo') || '';
                const desc = btn.getAttribute('data-desc') || '';
                const fecha = btn.getAttribute('data-fecha') || '';
                const obj1 = btn.getAttribute('data-obj1') || '';
                const obj2 = btn.getAttribute('data-obj2') || '';
                const resp = btn.getAttribute('data-resp') || '';

                if (document.getElementById('edit_id')) document.getElementById('edit_id').value = id;
                if (document.getElementById('edit_titulo')) document.getElementById('edit_titulo').value = titulo;
                if (document.getElementById('edit_descripcion')) document.getElementById('edit_descripcion').value = desc;
                if (document.getElementById('edit_fecha')) document.getElementById('edit_fecha').value = fecha;
                if (document.getElementById('edit_obj1')) document.getElementById('edit_obj1').value = obj1;
                if (document.getElementById('edit_obj2')) document.getElementById('edit_obj2').value = obj2;
                if (document.getElementById('edit_responsable')) document.getElementById('edit_responsable').value = resp;
                
                editModal.classList.add('active');
            });
        });
    }

    // Vincular Modal
    const vincularModal = document.getElementById('vincularModal');
    if (vincularModal) {
        document.querySelectorAll('.btn-vincular').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const titulo = btn.getAttribute('data-titulo') || '';
                
                if (document.getElementById('vincular_proyecto_id')) document.getElementById('vincular_proyecto_id').value = id;
                if (document.getElementById('vincular_proyecto_nombre')) document.getElementById('vincular_proyecto_nombre').textContent = "Proyecto: " + titulo;
                
                vincularModal.classList.add('active');
            });
        });
    }

    // Chevron rotation on accordion open/close
    document.querySelectorAll('details').forEach(det => {
        det.addEventListener('toggle', () => {
            const icon = det.querySelector('.details-icon');
            if (icon) icon.style.transform = det.open ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    });
});
</script>
<?php endif; ?>

<?php require __DIR__ . '/../layout/footer.php'; ?>
