<?php
// views/pendientes/create.php
$pageTitle = "Crear Nuevo Pedido";
require __DIR__ . '/../layout/header.php';

// Separar directivos (role='director') del resto
$directivos = array_filter($usuarios, fn($u) => $u['rol'] === 'director');
?>

<div class="card" style="max-width: 820px; margin: 0 auto;">
    <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">Nuevo Compromiso / Pendiente</h3>
        <p style="color: var(--text-muted); margin-top: 0.25rem;">Complete los campos para registrar un compromiso del Comité de Dirección.</p>
    </div>

    <form action="index.php?action=pendiente_create" method="POST">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
        <div class="form-group">
            <label for="titulo">Título del Pendiente / Compromiso</label>
            <input type="text" id="titulo" name="titulo" class="form-control" placeholder="Ej: Presentar reporte de costos Q1" required>
        </div>

        <div class="form-group">
            <label for="descripcion">Descripción detallada</label>
            <textarea id="descripcion" name="descripcion" class="form-control" rows="4" placeholder="Detalles de la solicitud o decisión tomada..."></textarea>
        </div>

        <!-- Responsable y Solicitado por -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
                <label for="responsable_id">Responsable</label>
                <select id="responsable_id" name="responsable_id" class="form-control" required>
                    <option value="">Seleccione un responsable...</option>
                    <?php foreach ($directivos as $u): ?>
                        <option value="<?php echo (int)$u['id']; ?>"><?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="solicitado_por_id">Solicitado por</label>
                <select id="solicitado_por_id" name="solicitado_por_id" class="form-control">
                    <option value="">Seleccione (opcional)...</option>
                    <?php foreach ($directivos as $u): ?>
                        <option value="<?php echo (int)$u['id']; ?>"><?php echo htmlspecialchars($u['nombre'], ENT_QUOTES, 'UTF-8'); ?></option>
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
                                    <option value="<?php echo $obj['id']; ?>"><?php echo htmlspecialchars($obj['titulo']); ?></option>
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
                        <option value="<?php echo $proj['id']; ?>">PRJ-<?php echo str_pad($proj['id'], 3, '0', STR_PAD_LEFT); ?> — <?php echo htmlspecialchars($proj['titulo']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
                <label for="tipo">Tipo</label>
                <select id="tipo" name="tipo" class="form-control">
                    <option value="rutina">Rutina</option>
                    <option value="estrategico">Estratégico</option>
                </select>
            </div>

            <div class="form-group">
                <label for="naturaleza">Naturaleza</label>
                <select id="naturaleza" name="naturaleza" class="form-control" required>
                    <option value="decision">Decisión</option>
                    <option value="solicitud_info">Solicitud de Información</option>
                    <option value="delegacion">Delegación</option>
                    <option value="escalamiento">Escalamiento</option>
                    <option value="negociacion">Negociación</option>
                    <option value="averiguacion">Averiguación</option>
                    <option value="aprobacion">Aprobación</option>
                    <option value="compra">Compra</option>
                    <option value="capacitacion">Capacitación</option>
                    <option value="analisis">Análisis</option>
                    <option value="plan_accion">Plan de Acción</option>
                    <option value="otra">Otra</option>
                </select>
            </div>

            <div class="form-group">
                <label for="contribucion">Contribución (en miles)</label>
                <input type="text" id="contribucion" name="contribucion" class="form-control" placeholder="Ej: $50 USD / $100 COP">
            </div>
        </div>

        <div class="form-group" style="margin-top: 1.5rem;">
            <label>Impacto en el Negocio <span style="color: var(--text-muted); font-weight: 400;">(selección múltiple)</span></label>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                <?php foreach(['EBIT', 'Gross', 'Eficiencia', 'Gente', 'Riesgo'] as $imp): ?>
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; cursor: pointer; font-weight: 500;">
                        <input type="checkbox" name="impacto[]" value="<?php echo $imp; ?>" style="width: 16px; height: 16px; accent-color: var(--primary);">
                        <?php echo $imp; ?>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
            <div class="form-group">
                <label for="prioridad">Prioridad</label>
                <select id="prioridad" name="prioridad" class="form-control">
                    <option value="alta">Alta</option>
                    <option value="media" selected>Media</option>
                    <option value="baja">Baja</option>
                </select>
            </div>



            <div class="form-group">
                <label for="fecha_inicio">Fecha Inicial</label>
                <input type="date" id="fecha_inicio" name="fecha_inicio" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
            </div>

            <div class="form-group">
                <label for="fecha_compromiso">Fecha Compromiso</label>
                <input type="date" id="fecha_compromiso" name="fecha_compromiso" class="form-control" required>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" style="flex: 2;">
                <i data-lucide="plus-circle"></i> Crear Pedido
            </button>
            <a href="index.php?action=pendientes_list" class="btn btn-secondary" style="flex: 1; text-align: center;">Cancelar</a>
        </div>
    </form>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>

