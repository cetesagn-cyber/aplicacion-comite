<?php
// views/dashboard/index.php
$pageTitle = "Panel Ejecutivo de Control";
require __DIR__ . '/../layout/header.php';
?>

<div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
<?php if ($_SESSION['user_rol'] !== 'invitado'): ?>
    <div class="card stats-card">
        <h3 style="font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Total Compromisos</h3>
        <p class="stats-value"><?php echo array_sum($stats['estados'] ?? []); ?></p>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Acumulado histórico</div>
    </div>
    <div class="card stats-card" style="border-left-color: var(--accent);">
        <h3 style="font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Cumplimiento</h3>
        <p class="stats-value" style="color: var(--accent);"><?php echo $stats['cumplimiento']; ?>%</p>
        <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 3px; margin-top: 0.5rem;">
            <div style="width: <?php echo $stats['cumplimiento']; ?>%; background: var(--accent); height: 100%; border-radius: 3px;"></div>
        </div>
    </div>
    <div class="card stats-card" style="border-left-color: var(--warning);">
        <h3 style="font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">En Gestión</h3>
        <p class="stats-value" style="color: var(--warning);"><?php echo ($stats['estados']['en_progreso'] ?? 0) + ($stats['estados']['abierto'] ?? 0); ?></p>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Pedidos activos</div>
    </div>
<?php endif; ?>
    <!-- Mis Pendientes (usuario logueado) -->
    <div class="card stats-card" style="border-left-color: var(--primary);">
        <h3 style="font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 0.75rem;">
            Mis Pedidos
            <span style="font-size: 0.75rem; background: #fee2e2; color: var(--primary); padding: 1px 7px; border-radius: 9999px; font-weight: 800; margin-left: 6px;"><?php echo count($misPendientes); ?></span>
        </h3>
        <?php if (empty($misPendientes)): ?>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Sin pedidos activos asignados.</p>
        <?php else: ?>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; max-height: 140px;">
                <?php foreach ($misPendientes as $mp): ?>
                    <a href="index.php?action=pendiente_detail&id=<?php echo $mp['id']; ?>" style="display:flex; justify-content: space-between; align-items: center; text-decoration: none;">
                        <span style="font-size: 0.8125rem; font-weight: 500; color: var(--secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;">
                            <?php echo htmlspecialchars($mp['titulo'], ENT_QUOTES, 'UTF-8'); ?>
                        </span>
                        <?php
                            $sc = $mp['estado'] == 'en_progreso' ? 'badge-warning' : ($mp['estado'] == 'bloqueado' ? 'badge-danger' : 'badge-secondary');
                            $sl = $mp['estado'] == 'en_progreso' ? 'En Progreso' : ($mp['estado'] == 'bloqueado' ? 'Postergado' : 'Abierto');
                        ?>
                        <span class="badge <?php echo $sc; ?>" style="font-size: 0.65rem;"><?php echo $sl; ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php if ($_SESSION['user_rol'] !== 'invitado'): ?>
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 id="recent-tasks-title" style="font-size: 1.125rem; font-weight: 800; color: var(--secondary);">Compromisos Recientes</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="resetFilterBtn" onclick="filterByImpact('all')" class="btn-icon" title="Ver todos" style="display: none; background: #f1f5f9; color: var(--primary);"><i data-lucide="refresh-cw" style="width: 14px;"></i></button>
                    <a href="index.php?action=pendientes_list" class="btn-icon" title="Ver listado completo"><i data-lucide="arrow-right"></i></a>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Impacto</th>
                            <th>Responsable</th>
                            <th>Prioridad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($pendientesVencidos)): ?>
                            <tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay pedidos pendientes.</td></tr>
                        <?php else: ?>
                            <?php foreach (array_slice($pendientesVencidos, 0, 15) as $p): ?>
                            <tr class="recent-task-row" data-impacts="<?php echo htmlspecialchars($p['impacto']); ?>">
                                <td>
                                    <a href="index.php?action=pendiente_detail&id=<?php echo (int)$p['id']; ?>" style="color: var(--secondary); font-weight: 600; text-decoration: none;">
                                        <?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?>
                                    </a>
                                </td>
                                <td>
                                    <?php $impacts = explode(',', $p['impacto']); ?>
                                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                        <?php foreach ($impacts as $imp): ?>
                                            <span class="impact-tag" style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;"><?php echo $imp; ?></span>
                                        <?php endforeach; ?>
                                    </div>
                                </td>
                                <td style="font-size: 0.8125rem;"><?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td>
                                    <span class="badge <?php echo $p['prioridad'] == 'alta' ? 'badge-danger' : ($p['prioridad'] == 'media' ? 'badge-warning' : 'badge-success'); ?>">
                                        <?php echo $p['prioridad']; ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card card-glass">
            <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--secondary); margin-bottom: 2rem;">Distribución de Impacto</h3>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <?php 
                $maxStats = max($stats['impactos'] ?: [1]);
                foreach ($stats['impactos'] ?? [] as $impacto => $total): 
                    $percent = $maxStats > 0 ? ($total / $maxStats) * 100 : 0;
                ?>
                    <div class="impact-indicator" onclick="filterByImpact('<?php echo $impacto; ?>')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.875rem; font-weight: 600; color: var(--secondary);"><?php echo $impacto; ?></span>
                            <span style="font-weight: 800; font-size: 0.875rem;"><?php echo $total; ?></span>
                        </div>
                        <div style="width: 100%; background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="width: <?php echo $percent; ?>%; background: var(--primary); height: 100%; opacity: <?php echo 0.3 + ($percent/150); ?>;"></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                <div style="text-align: center;">
                    <button onclick="window.location.href='index.php?action=comite_view'" class="btn btn-primary" style="width: 100%;">
                        <i data-lucide="presentation"></i> Ir a Vista de Comité
                    </button>
                </div>
            </div>
        </div>
    </div>
<?php else: ?>
    <!-- Vista simplificada para invitados -->
    <div class="card" style="padding: 3rem; text-align: center;">
        <i data-lucide="info" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1.5rem;"></i>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Bienvenido al Sistema de Comité</h2>
        <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 2rem;">En el recuadro superior "Mis Pedidos" encontrarás los compromisos que te han sido asignados para gestión o seguimiento.</p>
        <a href="index.php?action=pendientes_list" class="btn btn-primary" style="display: inline-flex;">Ver mis tareas asignadas</a>
    </div>
<?php endif; ?>

<script>
function filterByImpact(impact) {
    const rows = document.querySelectorAll('.recent-task-row');
    const titleElement = document.getElementById('recent-tasks-title');
    const resetBtn = document.getElementById('resetFilterBtn');
    
    let found = 0;
    rows.forEach(row => {
        if (impact === 'all') {
            row.style.display = 'table-row';
            row.style.background = 'transparent';
        } else {
            const rowImpacts = row.getAttribute('data-impacts').split(',');
            if (rowImpacts.includes(impact)) {
                row.style.display = 'table-row';
                row.style.background = 'rgba(239, 68, 68, 0.05)';
                found++;
            } else {
                row.style.display = 'none';
            }
        }
    });

    if (impact === 'all') {
        titleElement.innerText = 'Compromisos Recientes';
        resetBtn.style.display = 'none';
    } else {
        titleElement.innerText = 'Impacto: ' + impact + ' (' + found + ')';
        resetBtn.style.display = 'inline-flex';
    }
    
    lucide.createIcons();
}
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>
