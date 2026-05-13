<?php
// views/estrategia/gantt.php
$pageTitle = "Línea de Tiempo (Gantt) de Compromisos";
require __DIR__ . '/../layout/header.php';

// Calcular el rango del calendario (desde el mes actual + 1)
$startDate = new DateTime('first day of this month');
$endDate = clone $startDate;
$endDate->modify('+2 months');

$interval = new DateInterval('P1D');
$dateRange = new DatePeriod($startDate, $interval, $endDate);

$totalDays = $startDate->diff($endDate)->days;
?>

<div style="margin-bottom: 2rem;">
    <a href="index.php?action=estrategia" style="text-decoration: none; color: var(--primary); font-size: 0.875rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <i data-lucide="arrow-left" style="width: 14px;"></i> Volver a Análisis
    </a>
    <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--secondary);">Línea de Tiempo (Gantt)</h1>
    <p style="color: var(--text-muted);">Cronograma de compromisos activos para los próximos 60 días.</p>
</div>

<div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
    <div class="gantt-container" style="overflow-x: auto; padding: 2rem;">
        <div class="gantt-timeline" style="min-width: 1200px; position: relative;">
            
            <!-- Cabecera de Meses -->
            <div style="display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1rem;">
                <div style="width: 250px; flex-shrink: 0; padding: 1rem; font-weight: 800; color: var(--secondary); background: #f8fafc;">Compromiso</div>
                <div style="flex: 1; display: flex;">
                    <?php 
                    $currentMonth = '';
                    $monthWidth = 0;
                    foreach ($dateRange as $date) {
                        $m = $date->format('F Y');
                        if ($m !== $currentMonth) {
                            $currentMonth = $m;
                            echo "<div style='flex: 1; text-align: center; padding: 1rem; font-size: 0.75rem; font-weight: 800; border-left: 1px solid var(--border); text-transform: uppercase; background: #f8fafc; color: var(--text-muted);'>$m</div>";
                        }
                    }
                    ?>
                </div>
            </div>

            <!-- Filas de Compromisos -->
            <?php foreach ($pendientes as $p): 
                $pStart = new DateTime($p['fecha_creacion']);
                $pEnd = new DateTime($p['fecha_compromiso']);
                
                // Ajustar al rango visible
                if ($pStart < $startDate) $pStart = clone $startDate;
                if ($pEnd > $endDate) $pEnd = clone $endDate;
                if ($pEnd < $startDate) continue; // Fuera de rango

                $daysFromStart = $startDate->diff($pStart)->days;
                $duration = $pStart->diff($pEnd)->days + 1;
                
                $leftPercent = ($daysFromStart / $totalDays) * 100;
                $widthPercent = ($duration / $totalDays) * 100;
                
                $color = $p['prioridad'] == 'alta' ? '#ef4444' : ($p['prioridad'] == 'media' ? '#f59e0b' : '#10b981');
            ?>
                <div class="gantt-row" style="display: flex; align-items: center; border-bottom: 1px solid #f1f5f9; height: 60px;">
                    <div style="width: 250px; flex-shrink: 0; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; color: var(--secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="<?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?>">
                        <?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?>
                    </div>
                    <div style="flex: 1; position: relative; height: 100%; display: flex; align-items: center;">
                        <!-- Cuadrícula de fondo (semanas) -->
                        <?php for($i=0; $i<8; $i++): ?>
                            <div style="position: absolute; left: <?php echo ($i * 12.5); ?>%; height: 100%; border-left: 1px dashed #f1f5f9; width: 1px; z-index: 1;"></div>
                        <?php endfor; ?>

                        <div class="gantt-bar" 
                             onclick="window.location.href='index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>'"
                             style="left: <?php echo $leftPercent; ?>%; width: <?php echo $widthPercent; ?>%; background: <?php echo $color; ?>; opacity: 0.8; z-index: 2;">
                             <span class="gantt-tooltip"><?php echo htmlspecialchars($p['responsable'], ENT_QUOTES, 'UTF-8'); ?> (<?php echo (int)$p['porcentaje_avance']; ?>%)</span>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>

        </div>
    </div>
</div>

<style>
.gantt-container {
    background: white;
}
.gantt-row:hover {
    background: #fcfdfe;
}
.gantt-bar {
    position: absolute;
    height: 24px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 10px;
    min-width: 20px;
}
.gantt-bar:hover {
    transform: scaleY(1.1);
    opacity: 1 !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.gantt-tooltip {
    display: none;
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--secondary);
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    white-space: nowrap;
    z-index: 100;
}
.gantt-bar:hover .gantt-tooltip {
    display: block;
}
</style>

<?php require __DIR__ . '/../layout/footer.php'; ?>
