<?php
// views/estrategia/index.php
$pageTitle = "Centro de Análisis";
require __DIR__ . '/../layout/header.php';
?>

<div style="margin-bottom: 1.5rem;">
    <p style="color: var(--text-muted);">Herramientas avanzadas para la toma de decisiones y visualización de compromisos.</p>
</div>

<div class="strategy-grid">
    <!-- Kanban -->
    <div class="card strategy-card" onclick="window.location.href='index.php?action=estrategia_kanban'" style="cursor: pointer;">
        <div class="strategy-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            <i data-lucide="columns-3" style="width: 28px; height: 28px;"></i>
        </div>
        <h3 class="strategy-title">Tablero Kanban</h3>
        <div class="strategy-details">
            <p>Gestiona el flujo de trabajo arrastrando compromisos entre estados de forma visual.</p>
            <div class="strategy-link" style="color: #3b82f6;">
                Ver Módulo <i data-lucide="chevron-right" style="width: 14px;"></i>
            </div>
        </div>
    </div>

    <!-- Matriz de Priorización -->
    <div class="card strategy-card" onclick="window.location.href='index.php?action=estrategia_matriz'" style="cursor: pointer;">
        <div class="strategy-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--primary);">
            <i data-lucide="layout-grid" style="width: 28px; height: 28px;"></i>
        </div>
        <h3 class="strategy-title">Matriz de Prioridad</h3>
        <div class="strategy-details">
            <p>Visualiza el impacto vs. la urgencia para identificar qué requiere atención inmediata.</p>
            <div class="strategy-link" style="color: var(--primary);">
                Ver Módulo <i data-lucide="chevron-right" style="width: 14px;"></i>
            </div>
        </div>
    </div>

    <!-- Línea de Tiempo -->
    <div class="card strategy-card" onclick="window.location.href='index.php?action=estrategia_gantt'" style="cursor: pointer;">
        <div class="strategy-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i data-lucide="calendar-range" style="width: 28px; height: 28px;"></i>
        </div>
        <h3 class="strategy-title">Gantt / Timeline</h3>
        <div class="strategy-details">
            <p>Visualiza la carga de trabajo y el cumplimiento en una línea de tiempo continua.</p>
            <div class="strategy-link" style="color: #10b981;">
                Ver Módulo <i data-lucide="chevron-right" style="width: 14px;"></i>
            </div>
        </div>
    </div>

    <!-- Salud de Compromisos -->
    <div class="card strategy-card" onclick="window.location.href='index.php?action=estrategia_salud'" style="cursor: pointer;">
        <div class="strategy-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
            <i data-lucide="activity" style="width: 28px; height: 28px;"></i>
        </div>
        <h3 class="strategy-title">Salud Analítica</h3>
        <div class="strategy-details">
            <p>Analiza el desempeño por responsable y detecta riesgos antes de que ocurran.</p>
            <div class="strategy-link" style="color: #8b5cf6;">
                Ver Módulo <i data-lucide="chevron-right" style="width: 14px;"></i>
            </div>
        </div>
    </div>
</div>

<style>
.strategy-grid {
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 1.5rem;
}

.strategy-card {
    padding: 1.5rem;
    height: 180px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: hidden;
    position: relative;
    justify-content: center;
}

.strategy-card:hover {
    height: 260px;
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
    justify-content: flex-start;
    padding-top: 2rem;
}

.strategy-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.strategy-card:hover .strategy-icon {
    transform: scale(0.9);
    margin-bottom: 0.5rem;
}

.strategy-title {
    margin: 1rem 0 0.5rem; 
    font-size: 1.125rem; 
    font-weight: 700;
    transition: all 0.3s ease;
}

.strategy-details {
    max-height: 0;
    opacity: 0;
    transition: all 0.4s ease;
    pointer-events: none;
}

.strategy-card:hover .strategy-details {
    max-height: 150px;
    opacity: 1;
    pointer-events: auto;
}

.strategy-details p {
    font-size: 0.8125rem; 
    color: var(--text-muted); 
    line-height: 1.4;
    margin-bottom: 1rem;
}

.strategy-link {
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-weight: 700; 
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

@media (max-width: 1024px) {
    .strategy-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
    .strategy-grid { grid-template-columns: 1fr; }
}
</style>

<?php require __DIR__ . '/../layout/footer.php'; ?>
