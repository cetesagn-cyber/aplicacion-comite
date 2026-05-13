<?php
// views/bsc/index.php
$pageTitle = "Balanced Scorecard (BSC)";
require __DIR__ . '/../layout/header.php';
?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <div>
        <p style="color: var(--text-muted);">Seguimiento de grandes métricas del negocio y objetivos estratégicos.</p>
    </div>
    <div style="display: flex; gap: 1rem;">
        <button onclick="document.getElementById('modalMetrica').style.display='flex'" class="btn btn-primary">
            <i data-lucide="plus"></i> Nueva Métrica
        </button>
        <button onclick="document.getElementById('modalArchivo').style.display='flex'" class="btn btn-secondary">
            <i data-lucide="upload-cloud"></i> Subir Anexo BSC
        </button>
    </div>
</div>

<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
    <!-- PARTE IZQUIERDA: MÉTRICAS -->
    <div style="display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- Métricas Anuales -->
        <div class="card">
            <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--secondary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="calendar" style="color: var(--primary);"></i> Metas Anuales <?php echo $anio; ?>
            </h3>
            <div class="grid-metrics">
                <?php foreach ($anuales as $m): ?>
                    <div class="metric-item">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <div>
                                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;"><?php echo htmlspecialchars($m['nombre'], ENT_QUOTES, 'UTF-8'); ?></span>
                                <div style="font-size: 1.5rem; font-weight: 800; color: var(--secondary);">
                                    <?php echo $m['unidad'] . number_format($m['actual'], 0); ?>
                                    <span style="font-size: 0.875rem; color: var(--text-muted); font-weight: 400;">/ <?php echo number_format($m['meta'], 0); ?></span>
                                </div>
                            </div>
                            <button data-metric="<?php echo htmlspecialchars(json_encode($m), ENT_QUOTES, 'UTF-8'); ?>" onclick="openEditMetrica(JSON.parse(this.dataset.metric))" class="btn-icon-sm"><i data-lucide="edit-2"></i></button>
                        </div>
                        <?php 
                            $progreso = $m['meta'] > 0 ? ($m['actual'] / $m['meta']) * 100 : 0;
                            $color = $progreso >= 100 ? 'var(--success)' : ($progreso >= 80 ? 'var(--warning)' : 'var(--primary)');
                        ?>
                        <div style="width: 100%; background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                            <div style="width: <?php echo min($progreso, 100); ?>%; background: <?php echo $color; ?>; height: 100%; transition: width 1s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600;">
                            <span style="color: <?php echo $color; ?>;"><?php echo round($progreso, 1); ?>% de la meta</span>
                            <form action="index.php?action=bsc_metrica_delete" method="POST" style="display:inline;">
                                <input type="hidden" name="id" value="<?php echo (int)$m['id']; ?>">
                                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                <button type="submit" onclick="return confirm('¿Eliminar esta métrica?')"
                                        style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.75rem;font-weight:600;padding:0;">
                                    Eliminar
                                </button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($anuales)): ?>
                    <p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No hay metas anuales registradas.</p>
                <?php endif; ?>
            </div>
        </div>

        <!-- Métricas Mensuales -->
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--secondary); display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="trending-up" style="color: #3b82f6;"></i> Metas Mensuales
                </h3>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Métrica</th>
                            <th>Mes</th>
                            <th>Meta</th>
                            <th>Actual</th>
                            <th>%</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                        foreach ($mensuales as $m): 
                            $progreso = $m['meta'] > 0 ? ($m['actual'] / $m['meta']) * 100 : 0;
                        ?>
                            <tr>
                                <td style="font-weight: 700;"><?php echo htmlspecialchars($m['nombre'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo $meses[$m['mes']]; ?></td>
                                <td><?php echo $m['unidad'] . number_format($m['meta'], 0); ?></td>
                                <td>
                                    <form action="index.php?action=bsc_metrica_update" method="POST" style="display: flex; gap: 0.5rem; align-items: center;">
                                        <input type="hidden" name="id" value="<?php echo (int)$m['id']; ?>">
                                        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                        <input type="number" name="actual" value="<?php echo htmlspecialchars($m['actual'], ENT_QUOTES, 'UTF-8'); ?>" step="0.01" style="width: 100px; padding: 2px 5px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.8125rem;">
                                        <button type="submit" class="btn-icon-sm" style="background: var(--secondary); color: white;"><i data-lucide="check" style="width: 12px;"></i></button>
                                    </form>
                                </td>
                                <td>
                                    <span class="badge <?php echo $progreso >= 100 ? 'badge-success' : ($progreso >= 80 ? 'badge-warning' : 'badge-danger'); ?>">
                                        <?php echo round($progreso); ?>%
                                    </span>
                                </td>
                                <td>
                                    <form action="index.php?action=bsc_metrica_delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="id" value="<?php echo (int)$m['id']; ?>">
                                        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                        <button type="submit" onclick="return confirm('¿Eliminar?')"
                                                style="background:none;border:none;cursor:pointer;color:#ef4444;padding:0;">
                                            <i data-lucide="trash-2" style="width: 16px;"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($mensuales)): ?>
                            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay metas mensuales registradas.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- PARTE DERECHA: DOCUMENTO BSC -->
    <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div class="card card-glass">
            <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--secondary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="file-text" style="color: var(--primary);"></i> Documento BSC
            </h3>
            
            <?php if (empty($archivos)): ?>
                <div style="text-align: center; padding: 3rem 1rem; border: 2px dashed var(--border); border-radius: 1rem;">
                    <i data-lucide="file-plus" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="font-size: 0.875rem; color: var(--text-muted);">No se ha subido el Balanced Scorecard todavía.</p>
                </div>
            <?php else: 
                $latest = $archivos[0];
            ?>
                <div style="background: #f8fafc; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="background: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
                            <i data-lucide="file" style="color: var(--primary);"></i>
                        </div>
                        <div style="flex: 1; overflow: hidden;">
                            <h4 style="font-size: 0.875rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><?php echo htmlspecialchars($latest['titulo'], ENT_QUOTES, 'UTF-8'); ?></h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Subido el <?php echo date('d/m/Y', strtotime($latest['fecha_subida'])); ?></p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="<?php echo htmlspecialchars($latest['ruta'], ENT_QUOTES, 'UTF-8'); ?>" target="_blank" class="btn btn-secondary" style="flex: 1; font-size: 0.75rem; padding: 0.5rem;">Ver Documento</a>
                        <form action="index.php?action=bsc_archivo_delete" method="POST" style="display:inline;">
                            <input type="hidden" name="id" value="<?php echo (int)$latest['id']; ?>">
                            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                            <button type="submit" class="btn-icon"
                                    onclick="return confirm('¿Eliminar este documento?')"
                                    style="background:#fee2e2;color:#ef4444;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                                <i data-lucide="trash-2" style="width: 16px;"></i>
                            </button>
                        </form>
                    </div>
                </div>
                
                <?php if (count($archivos) > 1): ?>
                    <details>
                        <summary style="font-size: 0.8125rem; font-weight: 700; color: var(--primary); cursor: pointer; margin-bottom: 0.5rem;">Historial de Versiones</summary>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                            <?php for($i=1; $i < count($archivos); $i++): ?>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; padding: 0.5rem; background: #fff; border-radius: 6px;">
                                    <span><?php echo date('d/m/Y', strtotime($archivos[$i]['fecha_subida'])); ?></span>
                                    <a href="<?php echo $archivos[$i]['ruta']; ?>" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 700;">Abrir</a>
                                </div>
                            <?php endfor; ?>
                        </div>
                    </details>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- MODAL NUEVA MÉTRICA -->
<div id="modalMetrica" class="modal-overlay" style="display: none;">
    <div class="card modal-content" style="max-width: 500px;">
        <h3 style="margin-bottom: 1.5rem;">Nueva Métrica BSC</h3>
        <form action="index.php?action=bsc_metrica_create" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div class="form-group">
                <label>Nombre de la Métrica</label>
                <input type="text" name="nombre" class="form-control" placeholder="Ej: Meta de Ebit" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Tipo</label>
                    <select name="tipo" id="metricaTipo" class="form-control" onchange="toggleMes(this.value)" required>
                        <option value="anual">Anual Fija</option>
                        <option value="mensual">Mensual Variable</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Año</label>
                    <input type="number" name="anio" class="form-control" value="<?php echo date('Y'); ?>" required>
                </div>
            </div>
            <div id="divMes" class="form-group" style="display: none;">
                <label>Mes</label>
                <select name="mes" class="form-control">
                    <?php for($i=1; $i<=12; $i++) echo "<option value='$i'>$meses[$i]</option>"; ?>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Meta (Objetivo)</label>
                    <input type="number" name="meta" step="0.01" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Unidad</label>
                    <input type="text" name="unidad" class="form-control" placeholder="$" value="$">
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" onclick="document.getElementById('modalMetrica').style.display='none'" class="btn btn-secondary">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL SUBIR ARCHIVO -->
<div id="modalArchivo" class="modal-overlay" style="display: none;">
    <div class="card modal-content" style="max-width: 500px;">
        <h3 style="margin-bottom: 1.5rem;">Subir Documento BSC</h3>
        <form action="index.php?action=bsc_upload" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <div class="form-group">
                <label>Título / Versión</label>
                <input type="text" name="titulo" class="form-control" placeholder="Ej: Balanced Scorecard 2024 Q2" required>
            </div>
            <div class="form-group">
                <label>Archivo (PDF o Imagen)</label>
                <input type="file" name="archivo" class="form-control" accept=".pdf,image/*" required>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-primary">Subir</button>
                <button type="button" onclick="document.getElementById('modalArchivo').style.display='none'" class="btn btn-secondary">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<style>
.grid-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}
.metric-item {
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.modal-content {
    width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>

<!-- MODAL EDITAR MÉTRICA -->
<div id="modalEditMetrica" class="modal-overlay" style="display: none;">
    <div class="card modal-content" style="max-width: 500px;">
        <h3 style="margin-bottom: 1.5rem;">Editar Métrica BSC</h3>
        <form action="index.php?action=bsc_metrica_update" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
            <input type="hidden" name="id" id="editMetricaId">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" id="editMetricaNombre" class="form-control" disabled style="background:#f1f5f9; color:var(--text-muted);">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label>Meta (Objetivo)</label>
                    <input type="number" id="editMetricaMeta" class="form-control" disabled style="background:#f1f5f9; color:var(--text-muted);">
                </div>
                <div class="form-group">
                    <label>Valor Actual</label>
                    <input type="number" name="actual" id="editMetricaActual" step="0.01" class="form-control" required autofocus>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" onclick="document.getElementById('modalEditMetrica').style.display='none'" class="btn btn-secondary">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<script>
function toggleMes(tipo) {
    document.getElementById('divMes').style.display = (tipo === 'mensual') ? 'block' : 'none';
}

function openEditMetrica(m) {
    document.getElementById('editMetricaId').value    = m.id;
    document.getElementById('editMetricaNombre').value = m.nombre;
    document.getElementById('editMetricaMeta').value   = m.meta;
    document.getElementById('editMetricaActual').value = m.actual;
    document.getElementById('modalEditMetrica').style.display = 'flex';
    setTimeout(() => document.getElementById('editMetricaActual').focus(), 100);
}
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>
