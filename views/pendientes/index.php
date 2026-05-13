<?php
// views/pendientes/index.php
$pageTitle = "Todos los Pedidos";
require __DIR__ . '/../layout/header.php';

// Separar activos y cerrados
$activos  = array_filter($pendientes, fn($p) => $p['estado'] !== 'cerrado');
$cerrados = array_filter($pendientes, fn($p) => $p['estado'] === 'cerrado');
?>

<div class="card" style="margin-bottom: 1.5rem;">
    <form action="index.php" method="GET" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end;">
        <input type="hidden" name="action" value="pendientes_list">
        
        <div class="form-group" style="margin-bottom: 0; min-width: 150px;">
            <label>Estado</label>
            <select name="estado" class="form-control">
                <option value="">Cualquiera</option>
                <option value="abierto" <?php echo ($filters['estado'] == 'abierto') ? 'selected' : ''; ?>>Abierto</option>
                <option value="en_progreso" <?php echo ($filters['estado'] == 'en_progreso') ? 'selected' : ''; ?>>En Progreso</option>
                <option value="bloqueado" <?php echo ($filters['estado'] == 'bloqueado') ? 'selected' : ''; ?>>Bloqueado</option>
                <option value="cerrado" <?php echo ($filters['estado'] == 'cerrado') ? 'selected' : ''; ?>>Cerrado</option>
            </select>
        </div>

        <div class="form-group" style="margin-bottom: 0; min-width: 150px;">
            <label>Tipo</label>
            <select name="tipo" class="form-control">
                <option value="">Cualquiera</option>
                <option value="rutina" <?php echo ($filters['tipo'] == 'rutina') ? 'selected' : ''; ?>>Rutina</option>
                <option value="estrategico" <?php echo ($filters['tipo'] == 'estrategico') ? 'selected' : ''; ?>>Estratégico</option>
            </select>
        </div>

        <div class="form-group" style="margin-bottom: 0; min-width: 150px;">
            <label>Responsable</label>
            <select name="responsable_id" class="form-control">
                <option value="">Todos</option>
                <?php foreach ($usuarios as $u): ?>
                    <option value="<?php echo (int)$u['id']; ?>" <?php echo ($filters['responsable_id'] == $u['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?></option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
            <label for="searchLive">Buscar</label>
            <input type="text" id="searchLive" class="form-control" placeholder="Título, responsable..." style="min-width: 200px;" autocomplete="off">
        </div>

        <button type="submit" class="btn btn-primary" style="width: auto;">Filtrar</button>
    </form>
</div>
<div class="card">
    <div class="table-container">
        <table id="pendientesTable">
            <thead>
                <tr>
                    <th>Estado</th>
                    <th>Avance</th>
                    <th>Título</th>
                    <th>Responsable</th>
                    <th>Tipo</th>
                    <th>Prioridad</th>
                    <th>Compromiso</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($activos)): ?>
                    <tr><td colspan="8" style="text-align: center;">No se encontraron pendientes activos.</td></tr>
                <?php else: ?>
                    <?php foreach ($activos as $p): ?>
                        <?php include __DIR__ . '/partials/_pendiente_row.php'; ?>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php if (!empty($cerrados)): ?>
<details id="seccionCerrados" style="margin-top: 1.5rem;">
    <summary style="cursor: pointer; list-style: none; user-select: none; display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm);">
        <i data-lucide="chevron-down" id="cerradosChevron" style="color: var(--text-muted); transition: transform 0.2s; flex-shrink: 0;"></i>
        <span style="font-weight: 700; font-size: 0.9375rem; color: var(--text-muted);">Pedidos Cerrados</span>
        <span class="badge badge-success" style="margin-left: 0.25rem;"><?php echo count($cerrados); ?></span>
        <span style="font-size: 0.8125rem; color: var(--text-muted); font-style: italic; margin-left: 0.5rem;">— Haz clic para ver</span>
    </summary>
    <div class="card" style="margin-top: 0.75rem; border-top: 3px solid var(--success);
        border-radius: 0 0 var(--radius) var(--radius); padding: 0; overflow: hidden;">
        <div class="table-container">
            <table id="pendientesCerradosTable">
                <thead>
                    <tr>
                        <th>Estado</th>
                        <th>Avance</th>
                        <th>Título</th>
                        <th>Responsable</th>
                        <th>Tipo</th>
                        <th>Prioridad</th>
                        <th>Compromiso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($cerrados as $p): ?>
                        <?php include __DIR__ . '/partials/_pendiente_row.php'; ?>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</details>
<?php endif; ?>

<?php require __DIR__ . '/../layout/footer.php'; ?>

<script>
// Buscador en vivo sobre las dos tablas
document.getElementById('searchLive')?.addEventListener('input', function() {
    const term = this.value.toLowerCase();
    [
        ...document.querySelectorAll('#pendientesTable tbody tr'),
        ...document.querySelectorAll('#pendientesCerradosTable tbody tr')
    ].forEach(row => {
        if (row.textContent.toLowerCase().includes(term)) {
            row.style.removeProperty('display');
            // Si la fila está en la sección colapsada, ábrela automáticamente
            const det = row.closest('details');
            if (det && !det.open) det.open = true;
        } else {
            row.style.setProperty('display', 'none', 'important');
        }
    });
});

// Rotar chevron al abrir/cerrar
document.getElementById('seccionCerrados')?.addEventListener('toggle', function() {
    const icon = document.getElementById('cerradosChevron');
    if (icon) icon.style.transform = this.open ? 'rotate(180deg)' : 'rotate(0deg)';
});
</script>
