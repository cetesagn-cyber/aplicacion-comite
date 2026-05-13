<?php
// views/estrategia/kanban.php
$pageTitle = "Tablero Kanban de Compromisos";
require __DIR__ . '/../layout/header.php';

$estados_config = [
    'abierto' => ['label' => 'Por Empezar', 'color' => '#64748b', 'bg' => '#f1f5f9'],
    'en_progreso' => ['label' => 'En Gestión', 'color' => '#3b82f6', 'bg' => '#eff6ff'],
    'bloqueado' => ['label' => 'Bloqueado / Postergado', 'color' => '#ef4444', 'bg' => '#fef2f2'],
    'cerrado' => ['label' => 'Finalizado', 'color' => '#10b981', 'bg' => '#ecfdf5']
];
?>

<div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
    <div>
        <a href="index.php?action=estrategia" style="text-decoration: none; color: var(--primary); font-size: 0.875rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i data-lucide="arrow-left" style="width: 14px;"></i> Volver a Análisis
        </a>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--secondary);">Tablero Kanban</h1>
    </div>
</div>

<div class="kanban-board">
    <?php foreach ($columnas as $estado => $items): 
        $conf = $estados_config[$estado];
    ?>
        <div class="kanban-column" style="background: <?php echo $conf['bg']; ?>;">
            <div class="kanban-column-header">
                <span style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: <?php echo $conf['color']; ?>;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: <?php echo $conf['color']; ?>;"></span>
                    <?php echo $conf['label']; ?>
                </span>
                <span class="kanban-count"><?php echo count($items); ?></span>
            </div>
            
            <div class="kanban-items">
                <?php foreach ($items as $p): ?>
                    <div class="card kanban-card" onclick="window.location.href='index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>'">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <span class="badge <?php echo $p['prioridad'] == 'alta' ? 'badge-danger' : ($p['prioridad'] == 'media' ? 'badge-warning' : 'badge-success'); ?>" style="font-size: 0.6rem; padding: 2px 6px;">
                                <?php echo $p['prioridad']; ?>
                            </span>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;"><?php echo date('d M', strtotime($p['fecha_compromiso'])); ?></span>
                        </div>
                        
                        <h3 class="kanban-card-title"><?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?></h3>
                        
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0;">
                            <div style="flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                                <div style="width: <?php echo $p['porcentaje_avance']; ?>%; height: 100%; background: <?php echo $conf['color']; ?>;"></div>
                            </div>
                            <span style="font-size: 0.65rem; font-weight: 700; color: var(--secondary);"><?php echo $p['porcentaje_avance']; ?>%</span>
                        </div>
                        
                        <div class="kanban-card-footer">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 20px; height: 20px; border-radius: 50%; background: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800; color: white;">
                                    <?php echo htmlspecialchars(substr($p['responsable'], 0, 1), ENT_QUOTES, 'UTF-8'); ?>
                                </div>
                                <span style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">
                                    <?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?>
                                </span>
                            </div>
                            <div class="kanban-quick-actions">
                                <?php if ($estado !== 'abierto'): ?>
                                    <button onclick="event.stopPropagation(); quickMove(<?php echo $p['id']; ?>, 'back')" class="btn-icon-sm" title="Mover atrás"><i data-lucide="chevron-left"></i></button>
                                <?php endif; ?>
                                <?php if ($estado !== 'cerrado'): ?>
                                    <button onclick="event.stopPropagation(); quickMove(<?php echo $p['id']; ?>, 'next')" class="btn-icon-sm" title="Mover adelante"><i data-lucide="chevron-right"></i></button>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<style>
.kanban-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    align-items: flex-start;
    overflow-x: auto;
    padding-bottom: 1rem;
}
.kanban-column {
    min-height: 70vh;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.kanban-column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
}
.kanban-count {
    font-size: 0.75rem;
    background: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 800;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.kanban-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.kanban-card {
    padding: 1rem;
    margin-bottom: 0;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}
.kanban-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: rgba(0,0,0,0.05);
}
.kanban-card-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--secondary);
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.kanban-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
}
.kanban-quick-actions {
    display: flex;
    gap: 0.25rem;
}
.btn-icon-sm {
    width: 24px;
    height: 24px;
    padding: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-icon-sm:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}
.btn-icon-sm i {
    width: 12px;
    height: 12px;
}

@media (max-width: 1200px) {
    .kanban-board {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (max-width: 640px) {
    .kanban-board {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
function quickMove(id, direction) {
    // Definimos el orden de los estados
    const estados = ['abierto', 'en_progreso', 'bloqueado', 'cerrado'];
    
    // Obtenemos el estado actual del elemento (lo buscamos en la tabla)
    fetch('index.php?action=pendiente_inline_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}&direction=${direction}`
    }).then(response => {
        if (response.ok) {
            location.reload();
        }
    });
}
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>
