<?php
// views/pendientes/comite.php
$pageTitle = "Vista de Comité (Pedidos)";
require __DIR__ . '/../layout/header.php';
?>

<div class="card" style="margin-bottom: 2rem;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem;">
        <form action="index.php" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex: 1;">
            <input type="hidden" name="action" value="comite_view">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Estado</label>
                <select name="estado" class="form-control">
                    <option value="activos" <?php echo ($filters['estado'] == 'activos') ? 'selected' : ''; ?>>Activos (Abiertos + En Progreso)</option>
                    <option value="abierto" <?php echo ($filters['estado'] == 'abierto') ? 'selected' : ''; ?>>Solo Abiertos</option>
                    <option value="en_progreso" <?php echo ($filters['estado'] == 'en_progreso') ? 'selected' : ''; ?>>Solo En Progreso</option>
                    <option value="cerrado" <?php echo ($filters['estado'] == 'cerrado') ? 'selected' : ''; ?>>Cerrados</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Responsable</label>
                <select name="responsable_id" class="form-control">
                    <option value="">Todos</option>
                    <?php foreach ($usuarios as $u): ?>
                        <option value="<?php echo (int)$u['id']; ?>" <?php echo ($filters['responsable_id'] == $u['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Buscar</label>
                <input type="text" id="searchInput" class="form-control" placeholder="Título, responsable..." style="width: 200px;">
            </div>
            <button type="submit" class="btn btn-primary" style="width: auto;">Filtrar</button>
        </form>

        <div style="display: flex; gap: 0.75rem;">
            <button id="toggleMeetingMode" class="btn btn-secondary" style="width: auto;">
                <i data-lucide="monitor-play"></i> Modo Reunión
            </button>
            <a href="index.php?action=export_csv&estado=<?php echo $filters['estado']; ?>&responsable_id=<?php echo $filters['responsable_id']; ?>" class="btn btn-secondary" style="width: auto; background: #f1f5f9; border: 1px solid var(--border);">
                <i data-lucide="download"></i> Excel/CSV
            </a>
        </div>
    </div>
</div>

<div id="committeeContainer" style="display: flex; flex-direction: column; gap: 2.5rem;">
    <!-- Estratégicos -->
    <section class="committee-section">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">Pendientes Estratégicos</h2>
            <div style="height: 2px; flex: 1; background: linear-gradient(to right, var(--primary), transparent);"></div>
            <span class="badge badge-secondary"><?php echo count($agrupados['estrategico']); ?> items</span>
        </div>

        <?php if (empty($agrupados['estrategico'])): ?>
            <p style="color: var(--text-muted); padding: 1rem;">No hay pendientes estratégicos en este estado.</p>
        <?php else: ?>
            <div class="grid-estrategicos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                <?php foreach ($agrupados['estrategico'] as $p): ?>
                    <div class="card card-item" style="border-top: 4px solid var(--primary); margin-bottom: 0;">
                        <div class="item-header-info" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span class="badge <?php echo $p['prioridad'] == 'alta' ? 'badge-danger' : 'badge-warning'; ?>"><?php echo $p['prioridad']; ?></span>
                            <div style="margin-left: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
                                <div style="width: 30px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
                                    <div style="width: <?php echo $p['porcentaje_avance']; ?>%; height: 100%; background: var(--primary);"></div>
                                </div>
                                <span style="font-size: 0.7rem; font-weight: 700; color: var(--primary);"><?php echo $p['porcentaje_avance']; ?>%</span>
                            </div>
                            <?php 
                            $isVencido = (strtotime($p['fecha_compromiso']) < time() && $p['estado'] != 'cerrado');
                            $color = $isVencido ? 'color: var(--danger); font-weight: 700;' : 'color: var(--text-muted);';
                            ?>
                            <span class="date-span" style="font-size: 0.75rem; <?php echo $color; ?>"><?php echo date('d M, Y', strtotime($p['fecha_compromiso'])); ?></span>
                        </div>
                        <h3 class="item-title" style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.2;" title="<?php echo htmlspecialchars($p['titulo'] . ' - ' . $p['responsable'], ENT_QUOTES, 'UTF-8'); ?>">
                            <?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?> <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-muted);">— <?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?></span>
                        </h3>
                        <p class="item-desc" style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            <?php echo htmlspecialchars($p['descripcion'], ENT_QUOTES, 'UTF-8'); ?>
                        </p>
                        <div class="item-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <div style="font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 24px; height: 24px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; color: var(--secondary);">
                                    <?php echo htmlspecialchars(substr($p['responsable'], 0, 1), ENT_QUOTES, 'UTF-8'); ?>
                                </div>
                                <span class="resp-name"><?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?></span>
                            </div>
                            <a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>" class="btn-icon" style="background: transparent;"><i data-lucide="arrow-right"></i></a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>

    <!-- Rutina -->
    <section class="committee-section">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">Seguimiento de Rutina</h2>
            <div style="height: 2px; flex: 1; background: linear-gradient(to right, var(--secondary), transparent);"></div>
            <span class="badge badge-secondary"><?php echo count($agrupados['rutina']); ?> items</span>
        </div>

        <?php if (empty($agrupados['rutina'])): ?>
            <p style="color: var(--text-muted); padding: 1rem;">No hay pendientes de rutina en este estado.</p>
        <?php else: ?>
            <div class="card" style="padding: 0; overflow: hidden;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Prioridad</th>
                                <th>Título</th>
                                <th>Responsable</th>
                                <th>Compromiso</th>
                                <th>Avance</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($agrupados['rutina'] as $p): ?>
                                <tr class="meeting-row">
                                    <td><span class="badge <?php echo $p['prioridad'] == 'alta' ? 'badge-danger' : ($p['prioridad'] == 'media' ? 'badge-warning' : 'badge-success'); ?>"><?php echo $p['prioridad']; ?></span></td>
                                    <td style="font-weight: 600;"><?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?></td>
                                    <td style="font-size: 0.8125rem; color: var(--text-muted);"><?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?></td>
                                    <td>
                                        <?php 
                                        $isVencido = (strtotime($p['fecha_compromiso']) < time() && $p['estado'] != 'cerrado');
                                        $color = $isVencido ? 'color: var(--danger); font-weight: 700;' : 'font-weight: 500;';
                                        ?>
                                        <span style="<?php echo $color; ?>"><?php echo date('d/m/Y', strtotime($p['fecha_compromiso'])); ?></span>
                                    </td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div style="width: 50px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                                                <div style="width: <?php echo $p['porcentaje_avance']; ?>%; height: 100%; background: var(--primary);"></div>
                                            </div>
                                            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text);"><?php echo $p['porcentaje_avance']; ?>%</span>
                                        </div>
                                    </td>
                                    <td><a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>" class="btn-icon"><i data-lucide="external-link"></i></a></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </section>
</div>

<style>
/* CSS para Modo Reunión Condensado */
#committeeContainer.meeting-mode-active .grid-estrategicos {
    display: flex !important; 
    flex-direction: column; 
    gap: 0.5rem !important;
}

#committeeContainer.meeting-mode-active .card-item {
    display: flex; 
    flex-direction: row; 
    align-items: center; 
    padding: 0.5rem 1rem !important; 
    border-top: none !important;
    border-left: 4px solid var(--primary) !important;
    gap: 1rem;
    box-shadow: none !important;
    border: 1px solid var(--border);
}

#committeeContainer.meeting-mode-active .item-header-info {
    margin-bottom: 0 !important;
    display: flex;
    align-items: center;
    gap: 1rem;
    width: auto;
}

#committeeContainer.meeting-mode-active .item-title {
    margin-bottom: 0 !important;
    flex: 1;
    font-size: 0.9375rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#committeeContainer.meeting-mode-active .item-desc {
    display: none !important;
}

#committeeContainer.meeting-mode-active .item-footer {
    border-top: none !important;
    padding-top: 0 !important;
    width: auto;
}

#committeeContainer.meeting-mode-active .resp-name {
    display: none !important;
}

#committeeContainer.meeting-mode-active .committee-section {
    gap: 1rem;
}
</style>

<script>
document.getElementById('toggleMeetingMode')?.addEventListener('click', function() {
    const container = document.getElementById('committeeContainer');
    const isMeetingMode = container.classList.toggle('meeting-mode-active');
    
    this.classList.toggle('btn-primary');
    this.innerHTML = isMeetingMode 
        ? '<i data-lucide="monitor-off"></i> Salir de Reunión' 
        : '<i data-lucide="monitor-play"></i> Modo Reunión';
    
    lucide.createIcons();
});

document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    
    // Filtrar estratégicos
    const estrategicos = document.querySelectorAll('.grid-estrategicos .card-item');
    estrategicos.forEach(item => {
        if (item.textContent.toLowerCase().includes(term)) {
            item.style.removeProperty('display');
        } else {
            item.style.setProperty('display', 'none', 'important');
        }
    });

    // Filtrar rutina
    const rutina = document.querySelectorAll('.table-container tbody tr');
    rutina.forEach(row => {
        if (row.textContent.toLowerCase().includes(term)) {
            row.style.removeProperty('display');
        } else {
            row.style.setProperty('display', 'none', 'important');
        }
    });
});
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>
