<?php
// views/pendientes/partials/_pendiente_row.php
// Requires $p (pendiente array), $usuarios (array), $_SESSION
$statusClass = $p['estado'] == 'cerrado'    ? 'badge-success'
             : ($p['estado'] == 'bloqueado' ? 'badge-danger'
             : ($p['estado'] == 'en_progreso' ? 'badge-warning' : 'badge-secondary'));
$barColor    = $p['estado'] == 'cerrado'    ? 'var(--success, #10b981)' : 'var(--primary)';
$isAdmin     = $_SESSION['user_rol'] === 'admin';
?>
<tr style="<?php echo $p['estado'] === 'cerrado' ? 'opacity: 0.75;' : ''; ?>">
    <!-- Estado -->
    <td>
        <?php if ($isAdmin): ?>
            <select class="form-control" style="padding: 0.2rem; font-size: 0.75rem; height: auto;"
                    onchange="updatePendiente(<?php echo $p['id']; ?>, 'estado', this)">
                <option value="abierto"     <?php echo $p['estado'] == 'abierto'     ? 'selected' : ''; ?>>Abierto</option>
                <option value="en_progreso" <?php echo $p['estado'] == 'en_progreso' ? 'selected' : ''; ?>>En Progreso</option>
                <option value="bloqueado"   <?php echo $p['estado'] == 'bloqueado'   ? 'selected' : ''; ?>>Postergado</option>
                <option value="cerrado"     <?php echo $p['estado'] == 'cerrado'     ? 'selected' : ''; ?>>Cerrado</option>
            </select>
        <?php else: ?>
            <span class="badge <?php echo $statusClass; ?>"><?php echo str_replace('_', ' ', $p['estado']); ?></span>
        <?php endif; ?>
    </td>

    <!-- Avance -->
    <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 60px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                <div style="width: <?php echo $p['porcentaje_avance']; ?>%; height: 100%; background: <?php echo $barColor; ?>;"></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text);"><?php echo $p['porcentaje_avance']; ?>%</span>
        </div>
    </td>

    <!-- Título -->
    <td>
        <a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>"
           style="font-weight: 600; color: var(--text); text-decoration: none;">
            <?php echo htmlspecialchars($p['titulo']); ?>
        </a>
    </td>

    <!-- Responsable -->
    <td>
        <?php if ($isAdmin): ?>
            <select class="form-control" style="padding: 0.2rem; font-size: 0.75rem; height: auto; max-width: 150px;"
                    onchange="updatePendiente(<?php echo $p['id']; ?>, 'responsable_id', this)">
                <?php foreach (array_filter($usuarios, fn($u) => $u['rol'] === 'director') as $u): ?>
                    <option value="<?php echo $u['id']; ?>" <?php echo $p['responsable_id'] == $u['id'] ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($u['nombre']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        <?php else: ?>
            <div style="font-weight: 500;"><?php echo htmlspecialchars($p['responsable']); ?></div>
            <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo htmlspecialchars($p['responsable_area']); ?></div>
        <?php endif; ?>
    </td>

    <!-- Tipo -->
    <td>
        <?php if ($isAdmin): ?>
            <select class="form-control" style="padding: 0.2rem; font-size: 0.75rem; height: auto;"
                    onchange="updatePendiente(<?php echo $p['id']; ?>, 'tipo', this)">
                <option value="rutina"     <?php echo $p['tipo'] == 'rutina'     ? 'selected' : ''; ?>>Rutina</option>
                <option value="estrategico" <?php echo $p['tipo'] == 'estrategico' ? 'selected' : ''; ?>>Estratégico</option>
            </select>
        <?php else: ?>
            <?php echo ucfirst($p['tipo']); ?>
        <?php endif; ?>
    </td>

    <!-- Prioridad -->
    <td>
        <?php if ($isAdmin): ?>
            <select class="form-control" style="padding: 0.2rem; font-size: 0.75rem; height: auto;"
                    onchange="updatePendiente(<?php echo $p['id']; ?>, 'prioridad', this)">
                <option value="alta"  <?php echo $p['prioridad'] == 'alta'  ? 'selected' : ''; ?>>Alta</option>
                <option value="media" <?php echo $p['prioridad'] == 'media' ? 'selected' : ''; ?>>Media</option>
                <option value="baja"  <?php echo $p['prioridad'] == 'baja'  ? 'selected' : ''; ?>>Baja</option>
            </select>
        <?php else: ?>
            <?php $badgeClass = $p['prioridad'] == 'alta' ? 'badge-danger' : ($p['prioridad'] == 'media' ? 'badge-warning' : 'badge-success'); ?>
            <span class="badge <?php echo $badgeClass; ?>"><?php echo $p['prioridad']; ?></span>
        <?php endif; ?>
    </td>

    <!-- Compromiso -->
    <td>
        <?php if ($isAdmin): ?>
            <input type="date" class="form-control"
                   style="padding: 0.2rem; font-size: 0.75rem; height: auto; max-width: 120px;"
                   value="<?php echo substr($p['fecha_compromiso'], 0, 10); ?>"
                   onchange="updatePendiente(<?php echo $p['id']; ?>, 'fecha_compromiso', this)">
        <?php else: ?>
            <?php
            $isVencido = (strtotime($p['fecha_compromiso']) < time() && $p['estado'] != 'cerrado');
            $color     = $isVencido ? 'color: var(--danger); font-weight: 700;' : '';
            ?>
            <span style="<?php echo $color; ?>"><?php echo date('d/m/Y', strtotime($p['fecha_compromiso'])); ?></span>
        <?php endif; ?>
    </td>

    <!-- Acciones -->
    <td style="display: flex; gap: 0.5rem;">
        <a href="index.php?action=pendiente_detail&id=<?php echo $p['id']; ?>"
           class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; width: auto;">
            Ver Detalle
        </a>
        <?php if ($isAdmin): ?>
            <a href="index.php?action=pendiente_delete&id=<?php echo $p['id']; ?>" 
               class="btn btn-icon btn-danger" 
               style="width: 32px; height: 32px; padding: 0;"
               onclick="return confirm('¿Estás seguro de que deseas eliminar este pendiente? Esta acción no se puede deshacer.');"
               title="Eliminar Pendiente">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </a>
        <?php endif; ?>
    </td>
</tr>
