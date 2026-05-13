<?php
// views/pendientes/detail.php
$pageTitle = "Detalle del Pedido";
require __DIR__ . '/../layout/header.php';
?>

<div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
    <!-- Información Principal -->
    <div>
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <?php 
                    $statusClass = $pendiente['estado'] == 'cerrado' ? 'badge-success' : ($pendiente['estado'] == 'bloqueado' ? 'badge-danger' : ($pendiente['estado'] == 'en_progreso' ? 'badge-warning' : 'badge-secondary'));
                    ?>
                    <span class="badge <?php echo $statusClass; ?>" style="margin-bottom: 0.5rem;"><?php echo str_replace('_', ' ', $pendiente['estado']); ?></span>
                    <?php if ($pendiente['estado_avance'] == 'avance'): ?>
                        <span class="badge badge-success" style="margin-bottom: 0.5rem; margin-left: 0.5rem;"><i data-lucide="trending-up" style="width: 14px; height: 14px; margin-right: 4px;"></i> Avance</span>
                    <?php elseif ($pendiente['estado_avance'] == 'sin_avance'): ?>
                        <span class="badge badge-secondary" style="margin-bottom: 0.5rem; margin-left: 0.5rem;"><i data-lucide="minus" style="width: 14px; height: 14px; margin-right: 4px;"></i> Sin Avance</span>
                    <?php endif; ?>
                    <h1 style="font-size: 1.5rem; font-weight: 700;"><?php echo htmlspecialchars($pendiente['titulo'], ENT_QUOTES, 'UTF-8'); ?></h1>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
                    <div>
                        <span class="badge badge-secondary"><?php echo htmlspecialchars(ucfirst($pendiente['tipo']), ENT_QUOTES, 'UTF-8'); ?></span>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem;">
                            <p><strong>Creado:</strong> <?php echo date('d/m/Y', strtotime($pendiente['fecha_creacion'])); ?></p>
                            
                            <p><strong>Fecha de Compromiso inicial:</strong> <?php echo date('d/m/Y', strtotime($pendiente['fecha_compromiso_original'])); ?></p>
                            
                            <p><strong>Nuevo cierre acordado:</strong> <span style="font-weight: 700; color: <?php echo (strtotime($pendiente['fecha_compromiso']) < time() && $pendiente['estado'] != 'cerrado') ? 'var(--danger)' : 'inherit'; ?>"><?php echo date('d/m/Y', strtotime($pendiente['fecha_compromiso'])); ?></span></p>

                            <?php if ($pendiente['fecha_cierre']): ?>
                                <p style="color: var(--success);"><strong>F. Cierre Real:</strong> <?php echo date('d/m/Y', strtotime($pendiente['fecha_cierre'])); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center; margin-top: 0.5rem;">
                        <?php
                        $subject = rawurlencode("CETESA COMITÉ - Ref: " . $pendiente['titulo']);
                        $body = rawurlencode("Hola,\n\nTe comparto el siguiente pedido del comité para tu gestión/conocimiento:\n\nTítulo: " . $pendiente['titulo'] . "\nPrioridad: " . ucfirst($pendiente['prioridad']) . "\nFecha Límite: " . date('d/m/Y', strtotime($pendiente['fecha_compromiso'])) . "\n\nPuedes ver los detalles completos ingresando al sistema de comité.\n\nSaludos.");
                        ?>
                        <button type="button" data-id="<?php echo (int)$pendiente['id']; ?>" data-subject="<?php echo htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'); ?>" data-body="<?php echo htmlspecialchars($body, ENT_QUOTES, 'UTF-8'); ?>" onclick="compartirYDelegar(this.dataset.id, this.dataset.subject, this.dataset.body)" class="btn btn-secondary" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
                            <i data-lucide="mail"></i> Compartir
                        </button>
                        
                        <script>
                        function compartirYDelegar(id, subject, body) {
                            const nombre = prompt("¿A quién deseas delegar este pedido?", <?php echo json_encode($pendiente['delegado_a'] ?? ''); ?>);
                            
                            if (nombre !== null) {
                                // Guardar el nombre en la base de datos
                                fetch('index.php?action=pendiente_delegar', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-CSRF-Token': CSRF_TOKEN
                                    },
                                    body: `id=${id}&email=${encodeURIComponent(nombre)}`
                                }).then(() => {
                                    // Abrir Outlook (dejamos el destinatario vacío para que lo elijas tú)
                                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                    // Recargar para mostrar el nombre en el tablero
                                    setTimeout(() => location.reload(), 1000);
                                });
                            }
                        }
                        </script>
                        
                        <?php if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'admin'): ?>
                        <a href="index.php?action=pendiente_edit&id=<?php echo $pendiente['id']; ?>" class="btn btn-primary" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
                            <i data-lucide="pencil"></i> Editar
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Progreso de la Tarea</span>
                    <span style="font-size: 0.875rem; font-weight: 700; color: var(--primary);"><?php echo (int)$pendiente['porcentaje_avance']; ?>%</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                    <div style="width: <?php echo (int)$pendiente['porcentaje_avance']; ?>%; height: 100%; background: var(--primary); transition: width 0.3s ease;"></div>
                </div>
            </div>

            <div style="margin-bottom: 2rem; position: relative;">
                <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">Descripción</h3>
                <p style="white-space: pre-wrap; color: var(--text); padding-bottom: 1rem;"><?php echo htmlspecialchars($pendiente['descripcion'] ?: 'Sin descripción.', ENT_QUOTES, 'UTF-8'); ?></p>

                <?php if (isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'admin'): ?>
                    <form action="index.php?action=pendiente_delete" method="POST"
                          style="position: absolute; bottom: 0; right: 0;">
                        <input type="hidden" name="id" value="<?php echo (int)$pendiente['id']; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                        <button type="submit"
                                class="btn btn-icon btn-danger"
                                style="width: 32px; height: 32px; padding: 0; border-radius: 50%; opacity: 0.6; transition: opacity 0.3s; border: none; cursor: pointer;"
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.6'"
                                onclick="return confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.');"
                                title="Eliminar Pedido">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </form>
                <?php endif; ?>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
                <div>
                    <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Responsable</h4>
                    <p style="font-weight: 600;"><?php echo htmlspecialchars($pendiente['responsable'], ENT_QUOTES, 'UTF-8'); ?></p>
                    <p style="font-size: 0.75rem; color: var(--text-muted);"><?php echo htmlspecialchars($pendiente['responsable_area'], ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
                <?php if (!empty($pendiente['solicitado_por_nombre'])): ?>
                <div>
                    <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Solicitado por</h4>
                    <p style="font-weight: 600;"><?php echo htmlspecialchars($pendiente['solicitado_por_nombre'], ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
                <?php endif; ?>
                <div>
                    <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Periodo</h4>
                    <p style="font-weight: 600; font-size: 0.8125rem;">
                        <span style="color: var(--text-muted);">Desde:</span> <?php echo $pendiente['fecha_inicio'] ? date('d/m/Y', strtotime($pendiente['fecha_inicio'])) : date('d/m/Y', strtotime($pendiente['fecha_creacion'])); ?><br>
                        <span style="color: var(--text-muted);">Límite:</span> <span style="font-weight: 700; color: <?php echo (strtotime($pendiente['fecha_compromiso']) < time() && $pendiente['estado'] != 'cerrado') ? 'var(--danger)' : 'inherit'; ?>"><?php echo date('d/m/Y', strtotime($pendiente['fecha_compromiso'])); ?></span>
                    </p>
                </div>
                <?php if (!empty($pendiente['contribucion'])): ?>
                <div>
                    <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Contribución</h4>
                    <p style="font-weight: 800; font-size: 1.1rem; color: var(--success);"><?php echo htmlspecialchars($pendiente['contribucion'], ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
                <?php endif; ?>
                <div>
                    <h4 style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Impacto</h4>
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        <?php foreach(explode(',', $pendiente['impacto']) as $imp): ?>
                            <span class="badge badge-secondary" style="font-size: 0.65rem;"><?php echo htmlspecialchars(trim($imp), ENT_QUOTES, 'UTF-8'); ?></span>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Historial de Seguimiento -->
        <div class="card" style="margin-top: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Línea de Tiempo / Seguimiento</h3>
            
            <div class="timeline" style="display: flex; flex-direction: column; gap: 1.5rem; position: relative;">
                <?php if (empty($seguimientos)): ?>
                    <p style="color: var(--text-muted); text-align: center; padding: 2rem;">No hay registros de seguimiento para este pedido.</p>
                <?php else: ?>
                    <?php foreach ($seguimientos as $s): ?>
                        <div style="display: flex; gap: 1rem; position: relative;">
                            <div style="min-width: 100px; font-size: 0.75rem; color: var(--text-muted); text-align: right; padding-top: 0.25rem;">
                                <?php echo date('d/m/Y', strtotime($s['fecha'])); ?><br>
                                <?php echo date('H:i', strtotime($s['fecha'])); ?>
                            </div>
                            <div style="width: 2px; background: var(--border); position: relative; margin: 0.5rem 0;">
                                <div style="width: 10px; height: 10px; background: var(--primary); border-radius: 50%; position: absolute; left: -4px; top: 0;"></div>
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <span class="badge badge-secondary" style="font-size: 0.65rem;"><?php echo htmlspecialchars(strtoupper($s['accion']), ENT_QUOTES, 'UTF-8'); ?></span>
                                    <span style="font-weight: 600; font-size: 0.875rem;"><?php echo htmlspecialchars($s['usuario'], ENT_QUOTES, 'UTF-8'); ?></span>
                                </div>
                                <p style="font-size: 0.875rem; color: var(--text);"><?php echo htmlspecialchars($s['descripcion'], ENT_QUOTES, 'UTF-8'); ?></p>
                                <?php if ($s['evidencia'] && preg_match('/^[a-f0-9]+\.[a-z0-9]{2,5}$/', $s['evidencia'])): ?>
                                    <a href="uploads/<?php echo htmlspecialchars($s['evidencia'], ENT_QUOTES, 'UTF-8'); ?>" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.75rem; color: var(--accent); text-decoration: none;">
                                        <i data-lucide="paperclip" style="width: 14px; height: 14px;"></i> Ver Evidencia
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Formulario de Acción y Objetivo -->
    <div>
        <?php if (!empty($pendiente['objetivo_id'])): ?>
            <?php 
                $diasSinAvance = null;
                $isStalled = false;
                if (!empty($pendiente['objetivo_fecha'])) {
                    $diasSinAvance = round((time() - strtotime($pendiente['objetivo_fecha'])) / (60 * 60 * 24));
                    if ($diasSinAvance > 14 && $pendiente['objetivo_porcentaje'] < 100) {
                        $isStalled = true;
                    }
                } else if ($pendiente['objetivo_porcentaje'] < 100) {
                    $isStalled = true; // Never updated!
                }
            ?>
            <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid <?php echo $isStalled ? 'var(--danger)' : 'var(--primary)'; ?>;">
                <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--secondary);">Objetivo Relacionado</h3>
                <p style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;"><?php echo htmlspecialchars($pendiente['objetivo_titulo'], ENT_QUOTES, 'UTF-8'); ?></p>
                
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Avance del Objetivo</span>
                        <span style="font-size: 0.75rem; font-weight: 700;"><?php echo $pendiente['objetivo_porcentaje']; ?>%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                        <div style="width: <?php echo $pendiente['objetivo_porcentaje']; ?>%; height: 100%; background: <?php echo $isStalled ? 'var(--danger)' : 'var(--primary)'; ?>;"></div>
                    </div>
                </div>

                <?php if ($isStalled): ?>
                    <div style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.5rem; border-radius: 4px; font-size: 0.75rem; display: flex; gap: 0.5rem; align-items: center;">
                        <i data-lucide="alert-circle" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
                        <span>Estancado: <?php echo $diasSinAvance !== null ? "Sin actualizar hace $diasSinAvance días." : "Nunca se ha actualizado el avance."; ?></span>
                    </div>
                <?php else: ?>
                    <p style="font-size: 0.75rem; color: var(--text-muted);"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline; margin-right: 4px;"></i>Última actualización: <?php echo $pendiente['objetivo_fecha'] ? date('d/m/Y', strtotime($pendiente['objetivo_fecha'])) : 'N/A'; ?></p>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="card" style="position: sticky; top: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Registrar Acción y Avance</h3>
            
            <form action="index.php?action=pendiente_add_seguimiento" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="pendiente_id" value="<?php echo (int)$pendiente['id']; ?>">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                
                <div class="form-group">
                    <label for="accion">Tipo de Acción</label>
                    <select id="accion" name="accion" class="form-control" required>
                        <option value="comentario">Comentario / Actualización</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="decision">Decisión Tomada</option>
                        <option value="solicitud">Solicitud de Información</option>
                        <option value="delegacion">Delegación</option>
                        <option value="postergada">Postergada</option>
                        <option value="cierre">Cerrar Pendiente (Finalizado)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="porcentaje_avance">Actualizar % Avance</label>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="range" id="porcentaje_slider" class="form-control" min="0" max="100" value="<?php echo (int)$pendiente['porcentaje_avance']; ?>" style="flex: 1;" oninput="document.getElementById('porcentaje_avance').value = this.value;">
                        <input type="number" id="porcentaje_avance" name="porcentaje_avance" class="form-control" style="width: 80px;" min="0" max="100" value="<?php echo (int)$pendiente['porcentaje_avance']; ?>" required oninput="document.getElementById('porcentaje_slider').value = this.value;">
                    </div>
                </div>

                <div class="form-group">
                    <label for="nueva_fecha_compromiso">Reprogramar Fecha (Nuevo cierre acordado)</label>
                    <input type="date" id="nueva_fecha_compromiso" name="nueva_fecha_compromiso" class="form-control" value="<?php echo htmlspecialchars($pendiente['fecha_compromiso'], ENT_QUOTES, 'UTF-8'); ?>">
                    <small style="color: var(--text-muted);">Deje como está si no hay cambios en la fecha.</small>
                </div>

                <div class="form-group">
                    <label for="descripcion">Detalle de la acción</label>
                    <textarea id="descripcion" name="descripcion" class="form-control" rows="8" placeholder="Escriba los detalles aquí..." required></textarea>
                </div>

                <div class="form-group">
                    <label for="evidencia">Adjuntar Evidencia (PDF, Imagen, Excel)</label>
                    <input type="file" id="evidencia" name="evidencia" class="form-control" style="padding: 0.5rem;">
                </div>

                <button type="submit" class="btn btn-primary">Guardar Seguimiento</button>
            </form>
        </div>
    </div>
</div>

<?php require __DIR__ . '/../layout/footer.php'; ?>
