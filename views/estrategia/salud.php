<?php
// views/estrategia/salud.php
$pageTitle = "Análisis de Salud de Compromisos";
require __DIR__ . '/../layout/header.php';
?>

<div style="margin-bottom: 2rem;">
    <a href="index.php?action=estrategia" style="text-decoration: none; color: var(--primary); font-size: 0.875rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <i data-lucide="arrow-left" style="width: 14px;"></i> Volver a Análisis
    </a>
    <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--secondary);">Salud Analítica del Equipo</h1>
    <p style="color: var(--text-muted);">Seguimiento de cumplimiento y capacidad de respuesta por responsable.</p>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
    <?php foreach ($stats as $s): 
        $vencidos = (int)$s['vencidos'];
        $total = (int)$s['total'];
        $avance = round($s['avance_promedio'] ?? 0);
        
        // Determinar salud
        if ($total == 0) {
            $healthLabel = 'Sin Pedidos'; $healthColor = '#64748b'; $healthBg = '#f1f5f9';
        } elseif ($vencidos > 2) {
            $healthLabel = 'Crítico'; $healthColor = '#ef4444'; $healthBg = '#fef2f2';
        } elseif ($vencidos > 0) {
            $healthLabel = 'En Observación'; $healthColor = '#f59e0b'; $healthBg = '#fffbeb';
        } else {
            $healthLabel = 'Saludable'; $healthColor = '#10b981'; $healthBg = '#ecfdf5';
        }
    ?>
        <div class="card health-card" 
             onclick="window.location.href='index.php?action=profile&id=<?php echo $s['responsable_id']; ?>'"
             style="border-top: 4px solid <?php echo $healthColor; ?>; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem;"><?php echo htmlspecialchars($s['responsable'], ENT_QUOTES, 'UTF-8'); ?></h3>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Evaluación de Desempeño</span>
                </div>
                <span style="background: <?php echo $healthBg; ?>; color: <?php echo $healthColor; ?>; padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">
                    <?php echo $healthLabel; ?>
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);"><?php echo $total; ?></div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">TOTAL PEDIDOS</div>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.25rem; font-weight: 800; color: #ef4444;"><?php echo $vencidos; ?></div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">VENCIDOS</div>
                </div>
            </div>

            <div style="margin-top: auto;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 700;">
                    <span style="color: var(--text-muted);">Avance Promedio</span>
                    <span><?php echo $avance; ?>%</span>
                </div>
                <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div style="width: <?php echo $avance; ?>%; height: 100%; background: <?php echo $healthColor; ?>; opacity: 0.8;"></div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<style>
.health-card {
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}
.health-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
}
</style>

<?php require __DIR__ . '/../layout/footer.php'; ?>
