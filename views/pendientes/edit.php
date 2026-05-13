<?php
// views/pendientes/edit.php
$pageTitle = "Editar Pedido";
require __DIR__ . '/../layout/header.php';
$impactosActivos = explode(',', $pendiente['impacto']);
?>

<div class="card" style="max-width: 820px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">Editar Compromiso</h3>
            <p style="color: var(--text-muted); margin-top: 0.25rem; font-size: 0.875rem;">ID #<?php echo $pendiente['id']; ?> — Solo visible para administradores.</p>
        </div>
        <a href="index.php?action=pendiente_detail&id=<?php echo $pendiente['id']; ?>" class="btn btn-secondary" style="width: auto;">
            <i data-lucide="arrow-left"></i> Volver
        </a>
    </div>

    <form action="index.php?action=pendiente_update" method="POST">
        <input type="hidden" name="id" value="<?php echo (int)$pendiente['id']; ?>">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">

        <div class="form-group">
            <label for="titulo">Título</label>
            <input type="text" id="titulo" name="titulo" class="form-control" value="<?php echo htmlspecialchars($pendiente['titulo'], ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" class="form-control" rows="4"><?php echo htmlspecialchars($pendiente['descripcion'], ENT_QUOTES, 'UTF-8'); ?></textarea>
        </div>

        <!-- Responsable y Solicitado por -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
                <label for="responsable_id">Responsable</label>
                <select id="responsable_id" name="responsable_id" class="form-control" required>
                    <?php foreach ($directivos as $u): ?>
                        <option value="<?php echo (int)$u['id']; ?>" <?php echo $u['id'] == $pendiente['responsable_id'] ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="solicitado_por_id">Solicitado por</label>
                <select id="solicitado_por_id" name="solicitado_por_id" class="form-control">
                    <option value="">— Ninguno —</option>
                    <?php foreach ($directivos as $u): ?>
                        <option value="<?php echo (int)$u['id']; ?>" <?php echo $u['id'] == $pendiente['solicitado_por_id'] ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <!-- Vinculación Estratégica -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; background: var(--surface-hover, rgba(0,0,0,0.02)); padding: 1rem; border-radius: 8px; border: 1px dashed var(--border); margin-bottom: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="objetivo_id" style="color: var(--primary); font-weight: 700;"><i data-lucide="target" style="width: 14px; height: 14px; display: inline; margin-right: 4px;"></i> Objetivo Relacionado</label>
                <select id="objetivo_id" name="objetivo_id" class="form-control">
                    <option value="">— Ninguno —</option>
                    <?php if (!empty($objetivosAgrupados)): ?>
                        <?php foreach ($objetivosAgrupados as $anio => $objs): ?>
                            <optgroup label="<?php echo $anio; ?>">
                                <?php foreach ($objs as $obj): ?>
                                    <option value="<?php echo (int)$obj['id']; ?>" <?php echo $obj['id'] == $pendiente['objetivo_id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($obj['titulo'], ENT_QUOTES, 'UTF-8'); ?>
                                    </option>
                                <?php endforeach; ?>
                            </optgroup>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label for="proyecto_id" style="color: var(--primary); font-weight: 700;"><i data-lucide="folder-kanban" style="width: 14px; height: 14px; display: inline; margin-right: 4px;"></i> Proyecto Relacionado</label>
                <select id="proyecto_id" name="proyecto_id" class="form-control">
                    <option value="">— Ninguno —</option>
                    <?php foreach ($proyectos as $proj): ?>
                        <option value="<?php echo (int)$proj['id']; ?>" <?php echo $proj['id'] == $pendiente['proyecto_id'] ? 'selected' : ''; ?>>
                            PRJ-<?php echo str_pad((int)$proj['id'], 3, '0', STR_PAD_LEFT); ?> — <?php echo htmlspecialchars($proj['titulo'], ENT_QUOTES, 'UTF-8'); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
                <label for="tipo">Tipo</label>
                <select id="tipo" name="tipo" class="form-control">
                    <option value="rutina" <?php echo $pendiente['tipo'] == 'rutina' ? 'selected' : ''; ?>>Rutina</option>
                    <option value="estrategico" <?php echo $pendiente['tipo'] == 'estrategico' ? 'selected' : ''; ?>>Estratégico</option>
                </select>
            </div>

            <div class="form-group">
                <label for="naturaleza">Naturaleza</label>
                <select id="naturaleza" name="naturaleza" class="form-control">
                    <option value="decision" <?php echo $pendiente['naturaleza'] == 'decision' ? 'selected' : ''; ?>>Decisión</option>
                    <option value="solicitud_info" <?php echo $pendiente['naturaleza'] == 'solicitud_info' ? 'selected' : ''; ?>>Solicitud de Información</option>
                    <option value="delegacion" <?php echo $pendiente['naturaleza'] == 'delegacion' ? 'selected' : ''; ?>>Delegación</option>
                    <option value="escalamiento" <?php echo $pendiente['naturaleza'] == 'escalamiento' ? 'selected' : ''; ?>>Escalamiento</option>
                    <option value="negociacion" <?php echo $pendiente['naturaleza'] == 'negociacion' ? 'selected' : ''; ?>>Negociación</option>
                    <option value="averiguacion" <?php echo $pendiente['naturaleza'] == 'averiguacion' ? 'selected' : ''; ?>>Averiguación</option>
                    <option value="aprobacion" <?php echo $pendiente['naturaleza'] == 'aprobacion' ? 'selected' : ''; ?>>Aprobación</option>
                    <option value="compra" <?php echo $pendiente['naturaleza'] == 'compra' ? 'selected' : ''; ?>>Compra</option>
                    <option value="capacitacion" <?php echo $pendiente['naturaleza'] == 'capacitacion' ? 'selected' : ''; ?>>Capacitación</option>
                    <option value="analisis" <?php echo $pendiente['naturaleza'] == 'analisis' ? 'selected' : ''; ?>>Análisis</option>
                    <option value="plan_accion" <?php echo $pendiente['naturaleza'] == 'plan_accion' ? 'selected' : ''; ?>>Plan de Acción</option>
                    <option value="otra" <?php echo $pendiente['naturaleza'] == 'otra' ? 'selected' : ''; ?>>Otra</option>
                </select>
            </div>

            <div class="form-group">
                <label for="contribucion">Contribución (en miles)</label>
                <input type="text" id="contribucion" name="contribucion" class="form-control" placeholder="Ej: $50 USD / $100 COP" value="<?php echo htmlspecialchars($pendiente['contribucion'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label for="delegado_a">Delegado a (Nombre)</label>
                <input type="text" id="delegado_a" name="delegado_a" class="form-control" placeholder="Ej: Juan Pérez" value="<?php echo htmlspecialchars($pendiente['delegado_a'] ?? ''); ?>">
            </div>
        </div>

        <div class="form-group" style="margin-top: 1.5rem;">
            <label>Impacto en el Negocio</label>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                <?php foreach(['EBIT', 'Gross', 'Eficiencia', 'Gente', 'Riesgo'] as $imp): ?>
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; cursor: pointer; font-weight: 500;">
                        <input type="checkbox" name="impacto[]" value="<?php echo $imp; ?>"
                            style="width: 16px; height: 16px; accent-color: var(--primary);"
                            <?php echo in_array($imp, $impactosActivos) ? 'checked' : ''; ?>>
                        <?php echo $imp; ?>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
            <div class="form-group">
                <label for="prioridad">Prioridad</label>
                <select id="prioridad" name="prioridad" class="form-control">
                    <option value="alta" <?php echo $pendiente['prioridad'] == 'alta' ? 'selected' : ''; ?>>Alta</option>
                    <option value="media" <?php echo $pendiente['prioridad'] == 'media' ? 'selected' : ''; ?>>Media</option>
                    <option value="baja" <?php echo $pendiente['prioridad'] == 'baja' ? 'selected' : ''; ?>>Baja</option>
                </select>
            </div>

            <div class="form-group">
                <label for="estado">Estado</label>
                <select id="estado" name="estado" class="form-control">
                    <option value="abierto" <?php echo $pendiente['estado'] == 'abierto' ? 'selected' : ''; ?>>Abierto</option>
                    <option value="en_progreso" <?php echo $pendiente['estado'] == 'en_progreso' ? 'selected' : ''; ?>>En Progreso</option>
                    <option value="bloqueado" <?php echo $pendiente['estado'] == 'bloqueado' ? 'selected' : ''; ?>>Postergado</option>
                    <option value="cerrado" <?php echo $pendiente['estado'] == 'cerrado' ? 'selected' : ''; ?>>Cerrado</option>
                </select>
            </div>



            <div class="form-group">
                <label for="fecha_inicio">Fecha Inicial</label>
                <input type="date" id="fecha_inicio" name="fecha_inicio" class="form-control"
                    value="<?php echo $pendiente['fecha_inicio'] ?? date('Y-m-d'); ?>" required>
            </div>

            <div class="form-group">
                <label style="color: var(--text-muted);">Compromiso Inicial</label>
                <input type="text" class="form-control" value="<?php echo date('d/m/Y', strtotime($pendiente['fecha_compromiso_original'])); ?>" disabled style="background: var(--surface-hover); cursor: not-allowed;">
            </div>

            <div class="form-group">
                <label for="fecha_compromiso">Nuevo cierre acordado</label>
                <input type="date" id="fecha_compromiso" name="fecha_compromiso" class="form-control"
                    value="<?php echo $pendiente['fecha_compromiso']; ?>" required>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" style="flex: 2;">
                <i data-lucide="save"></i> Guardar Cambios
            </button>
            <a href="index.php?action=pendiente_detail&id=<?php echo $pendiente['id']; ?>" class="btn btn-secondary" style="flex: 1; text-align: center;">
                Cancelar
            </a>
        </div>
    </form>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>
