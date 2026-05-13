<?php
// views/usuarios/perfil.php
$pageTitle = "Mi Tablero de Compromisos";
require __DIR__ . '/../layout/header.php';
?>

<div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
    <div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--secondary);"><?php echo htmlspecialchars($usuario['nombre'], ENT_QUOTES, 'UTF-8'); ?></h1>
        <p style="color: var(--text-muted);"><?php echo htmlspecialchars($usuario['area'], ENT_QUOTES, 'UTF-8'); ?> — Mis Compromisos y Pendientes</p>
    </div>
    <div style="display: flex; gap: 1rem;">
        <div class="card" style="padding: 0.75rem 1.5rem; text-align: center; min-width: 120px; margin-bottom: 0;">
            <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--danger); text-transform: uppercase;">Vencidos</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--danger);"><?php echo count($clasificados['vencidos']); ?></span>
        </div>
        <div class="card" style="padding: 0.75rem 1.5rem; text-align: center; min-width: 120px; margin-bottom: 0;">
            <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--warning); text-transform: uppercase;">Próximos</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--warning);"><?php echo count($clasificados['proximos']); ?></span>
        </div>
        <div class="card" style="padding: 0.75rem 1.5rem; text-align: center; min-width: 120px; margin-bottom: 0;">
            <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--success); text-transform: uppercase;">Cerrados</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--success);"><?php echo count($clasificados['cerrados']); ?></span>
        </div>
    </div>
</div>

<!-- Filtros de Navegación -->
<div style="margin-bottom: 2rem; display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
    <button class="tab-btn active" onclick="filterTab('urgente', this)">🚨 Urgentes y Próximos</button>
    <button class="tab-btn" onclick="filterTab('al_dia', this)">📅 Al Día</button>
    <button class="tab-btn" onclick="filterTab('cerrados', this)">✅ Finalizados</button>
</div>

<div id="urgente-section" class="tab-content">
    <?php if (empty($clasificados['vencidos']) && empty($clasificados['proximos'])): ?>
        <div class="card" style="text-align: center; padding: 3rem;">
            <i data-lucide="check-circle-2" style="width: 48px; height: 48px; color: var(--success); margin: 0 auto 1rem;"></i>
            <h3>¡Todo al día!</h3>
            <p style="color: var(--text-muted);">No tienes compromisos vencidos ni próximos a vencer en los siguientes 7 días.</p>
        </div>
    <?php else: ?>
        <?php if (!empty($clasificados['vencidos'])): ?>
            <h2 style="font-size: 1rem; font-weight: 800; color: var(--danger); margin-bottom: 1rem; text-transform: uppercase;">⚠️ Vencidos</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <?php foreach ($clasificados['vencidos'] as $p): ?>
                    <?php renderTaskCard($p, 'danger'); ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($clasificados['proximos'])): ?>
            <h2 style="font-size: 1rem; font-weight: 800; color: var(--warning); margin-bottom: 1rem; text-transform: uppercase;">⏳ Próximos a Vencer (7 días)</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
                <?php foreach ($clasificados['proximos'] as $p): ?>
                    <?php renderTaskCard($p, 'warning'); ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<div id="al_dia-section" class="tab-content" style="display: none;">
    <h2 style="font-size: 1rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem; text-transform: uppercase;">📅 Compromisos al Día</h2>
    <?php if (empty($clasificados['al_dia'])): ?>
        <p style="color: var(--text-muted);">No hay otros compromisos activos.</p>
    <?php else: ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
            <?php foreach ($clasificados['al_dia'] as $p): ?>
                <?php renderTaskCard($p, 'primary'); ?>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<div id="cerrados-section" class="tab-content" style="display: none;">
    <h2 style="font-size: 1rem; font-weight: 800; color: var(--success); margin-bottom: 1rem; text-transform: uppercase;">✅ Finalizados</h2>
    <div class="card" style="padding: 0; overflow: hidden;">
        <table>
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Cierre Real</th>
                    <th>Avance</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($clasificados['cerrados'] as $p): ?>
                    <tr>
                        <td style="font-weight: 600;"><?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><span class="badge badge-secondary"><?php echo htmlspecialchars($p['tipo'], ENT_QUOTES, 'UTF-8'); ?></span></td>
                        <td><?php echo $p['fecha_cierre'] ? date('d/m/Y', strtotime($p['fecha_cierre'])) : 'N/A'; ?></td>
                        <td><span class="badge badge-success">100%</span></td>
                        <td><a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>" class="btn-icon"><i data-lucide="external-link"></i></a></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php
function renderTaskCard($p, $type) {
    $borderColor = "var(--$type)";
    ?>
    <div class="card" 
         onclick="window.location.href='index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>'"
         style="cursor: pointer; border-left: 4px solid <?php echo $borderColor; ?>; margin-bottom: 0; transition: transform 0.2s;" 
         onmouseover="this.style.transform='translateY(-2px)'" 
         onmouseout="this.style.transform='translateY(0)'">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
            <span class="badge <?php echo $p['tipo'] == 'estrategico' ? 'badge-primary' : 'badge-secondary'; ?>" style="font-size: 0.6rem;"><?php echo htmlspecialchars(strtoupper($p['tipo']), ENT_QUOTES, 'UTF-8'); ?></span>
            <span style="font-size: 0.7rem; font-weight: 700; color: <?php echo $borderColor; ?>;">
                Vence: <?php echo date('d/m/Y', strtotime($p['fecha_compromiso'])); ?>
            </span>
        </div>
        <h3 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--secondary);"><?php echo htmlspecialchars($p['titulo'], ENT_QUOTES, 'UTF-8'); ?></h3>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem;">
            <div style="flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
                <div style="width: <?php echo $p['porcentaje_avance']; ?>%; height: 100%; background: <?php echo $borderColor; ?>;"></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 800;"><?php echo $p['porcentaje_avance']; ?>%</span>
            <a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>" class="btn-icon" style="width: 28px; height: 28px; padding: 0;"><i data-lucide="arrow-right" style="width: 14px;"></i></a>
        </div>
        <p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.03); padding-top: 0.4rem;">
            <strong>Delegado a:</strong> <?php echo !empty($p['delegado_a']) ? htmlspecialchars($p['delegado_a'], ENT_QUOTES, 'UTF-8') : 'nadie'; ?>
        </p>
    </div>
    <?php
}
?>

<style>
.tab-btn {
    padding: 0.75rem 1.25rem;
    border: none;
    background: transparent;
    font-weight: 700;
    font-size: 0.875rem;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
}
.tab-btn:hover {
    background: var(--surface-hover);
    color: var(--secondary);
}
.tab-btn.active {
    color: var(--primary);
    background: rgba(239, 68, 68, 0.05);
}
</style>

<script>
function filterTab(tabId, btn) {
    // Ocultar todos
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    // Mostrar el seleccionado
    document.getElementById(tabId + '-section').style.display = 'block';
    
    // Cambiar clases de botones
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    lucide.createIcons();
}
</script>

<?php require __DIR__ . '/../layout/footer.php'; ?>
