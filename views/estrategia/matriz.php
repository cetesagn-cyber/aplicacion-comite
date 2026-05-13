<?php
// views/estrategia/matriz.php
$pageTitle = "Matriz de Priorización Estratégica";
require __DIR__ . '/../layout/header.php';

// Lógica de clasificación para la matriz
$cuadrantes = [
    'do_now' => ['label' => 'Hacer de Inmediato', 'color' => '#ef4444', 'items' => []], // Alta Prioridad, Alto Impacto
    'plan' => ['label' => 'Planificar / Agendar', 'color' => '#3b82f6', 'items' => []],   // Baja Prioridad, Alto Impacto
    'quick' => ['label' => 'Atención Rápida', 'color' => '#f59e0b', 'items' => []],     // Alta Prioridad, Bajo Impacto
    'monitor' => ['label' => 'Monitorear / Delegar', 'color' => '#64748b', 'items' => []] // Baja Prioridad, Bajo Impacto
];

foreach ($pendientes as $p) {
    $impactoCount = count(explode(',', $p['impacto']));
    $isHighPriority = ($p['prioridad'] === 'alta');
    $isHighImpact = ($impactoCount >= 2);

    if ($isHighPriority && $isHighImpact) $cuadrantes['do_now']['items'][] = $p;
    elseif (!$isHighPriority && $isHighImpact) $cuadrantes['plan']['items'][] = $p;
    elseif ($isHighPriority && !$isHighImpact) $cuadrantes['quick']['items'][] = $p;
    else $cuadrantes['monitor']['items'][] = $p;
}
?>

<div style="margin-bottom: 2rem;">
    <a href="index.php?action=estrategia" style="text-decoration: none; color: var(--primary); font-size: 0.875rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <i data-lucide="arrow-left" style="width: 14px;"></i> Volver a Análisis
    </a>
    <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--secondary);">Matriz de Priorización</h1>
    <p style="color: var(--text-muted);">Clasificación automática basada en el nivel de impacto y prioridad asignada.</p>
</div>

<div class="matrix-container">
    <!-- Etiquetas de Ejes -->
    <div class="axis-y">ALTA PRIORIDAD</div>
    <div class="axis-y bottom">BAJA PRIORIDAD</div>
    <div class="axis-x">BAJO IMPACTO</div>
    <div class="axis-x right">ALTO IMPACTO</div>

    <div class="matrix-grid">
        <!-- Superior Izquierda: Quick Wins -->
        <div class="matrix-quadrant" id="quad-quick" data-priority="alta" data-impact="low" style="border-right: 2px dashed #e2e8f0; border-bottom: 2px dashed #e2e8f0;">
            <div class="quadrant-header" style="color: <?php echo $cuadrantes['quick']['color']; ?>; background: #f8fafc; z-index: 10;">
                <i data-lucide="zap" style="width: 18px;"></i> <?php echo $cuadrantes['quick']['label']; ?>
            </div>
            <div class="quadrant-items sortable-list" id="list-quick">
                <?php foreach ($cuadrantes['quick']['items'] as $p) renderMatrixItem($p); ?>
            </div>
        </div>

        <!-- Superior Derecha: Do Now -->
        <div class="matrix-quadrant highlight" id="quad-do_now" data-priority="alta" data-impact="high" style="border-bottom: 2px dashed #e2e8f0;">
            <div class="quadrant-header" style="color: <?php echo $cuadrantes['do_now']['color']; ?>; background: #fef2f2; z-index: 10;">
                <i data-lucide="alert-circle" style="width: 18px;"></i> <?php echo $cuadrantes['do_now']['label']; ?>
            </div>
            <div class="quadrant-items sortable-list" id="list-do_now">
                <?php foreach ($cuadrantes['do_now']['items'] as $p) renderMatrixItem($p); ?>
            </div>
        </div>

        <!-- Inferior Izquierda: Monitor -->
        <div class="matrix-quadrant" id="quad-monitor" data-priority="baja" data-impact="low" style="border-right: 2px dashed #e2e8f0;">
            <div class="quadrant-header" style="color: <?php echo $cuadrantes['monitor']['color']; ?>; background: #f8fafc; z-index: 10;">
                <i data-lucide="eye" style="width: 18px;"></i> <?php echo $cuadrantes['monitor']['label']; ?>
            </div>
            <div class="quadrant-items sortable-list" id="list-monitor">
                <?php foreach ($cuadrantes['monitor']['items'] as $p) renderMatrixItem($p); ?>
            </div>
        </div>

        <!-- Inferior Derecha: Plan -->
        <div class="matrix-quadrant" id="quad-plan" data-priority="baja" data-impact="high">
            <div class="quadrant-header" style="color: <?php echo $cuadrantes['plan']['color']; ?>; background: #f8fafc; z-index: 10;">
                <i data-lucide="calendar" style="width: 18px;"></i> <?php echo $cuadrantes['plan']['label']; ?>
            </div>
            <div class="quadrant-items sortable-list" id="list-plan">
                <?php foreach ($cuadrantes['plan']['items'] as $p) renderMatrixItem($p); ?>
            </div>
        </div>
    </div>
</div>

<?php
function renderMatrixItem($p) {
    ?>
    <div class="matrix-item" data-id="<?php echo $p['id']; ?>" onclick="window.location.href='index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>'">
        <div style="font-weight: 700; margin-bottom: 0.25rem; pointer-events: none;"><?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?></div>
        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); pointer-events: none;">
            <span><?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?></span>
            <span class="impact-badge"><?php echo count(explode(',', $p['impacto'])); ?> imp.</span>
        </div>
    </div>
    <?php
}
?>

<!-- SortableJS -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>

<style>
.matrix-container {
    position: relative;
    padding: 2rem;
    margin-top: 1rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.matrix-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 400px 400px;
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
}
.matrix-quadrant {
    padding: 0; /* Cambiado para que el header pegue arriba */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
.matrix-quadrant.highlight {
    background: #fef2f2;
}
.quadrant-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 0.9375rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1.5rem;
    position: sticky;
    top: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.quadrant-items {
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 100px;
}
.matrix-item {
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    cursor: grab;
    transition: all 0.2s;
    font-size: 0.8125rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.matrix-item:active { cursor: grabbing; }
.matrix-item:hover {
    transform: scale(1.02);
    border-color: var(--primary);
    z-index: 5;
}
.sortable-ghost {
    opacity: 0.4;
    background: var(--primary-light);
    border: 2px dashed var(--primary);
}

/* Ejes */
.axis-y {
    position: absolute;
    left: -1rem;
    top: 25%;
    transform: rotate(-90deg) translateX(-50%);
    font-size: 0.75rem;
    font-weight: 800;
    color: #94a3b8;
}
.axis-y.bottom { top: 75%; }
.axis-x {
    position: absolute;
    bottom: -1rem;
    left: 25%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 800;
    color: #94a3b8;
}
.axis-x.right { left: 75%; }

@media (max-width: 1024px) {
    .matrix-grid { grid-template-rows: auto auto; }
    .matrix-quadrant { min-height: 350px; }
}
</style>

<script>
document.querySelectorAll('.sortable-list').forEach(el => {
    new Sortable(el, {
        group: 'matrix',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function (evt) {
            const id = evt.item.getAttribute('data-id');
            const targetQuad = evt.to.closest('.matrix-quadrant');
            const newPriority = targetQuad.getAttribute('data-priority');
            const newImpactType = targetQuad.getAttribute('data-impact');

            // Actualizar en el servidor
            fetch('index.php?action=pendiente_matrix_update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${id}&prioridad=${newPriority}&impact_type=${newImpactType}`
            }).then(() => {
                // Opcional: recargar o actualizar contador visual localmente
                lucide.createIcons();
            });
        }
    });
});
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>

<?php require __DIR__ . '/../layout/footer.php'; ?>
