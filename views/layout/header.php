<?php
// views/layout/header.php
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle ?? 'Seguimiento Comité', ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons (CDN) -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <?php if (isset($_SESSION['user_id'])): ?>
    <!-- Token CSRF disponible para llamadas AJAX autenticadas -->
    <script>const CSRF_TOKEN = '<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>';</script>
    <?php endif; ?>
</head>
<body>
    <div class="dashboard-layout">
        <aside class="sidebar">
            <a href="index.php" class="sidebar-brand">
                CETESA <span style="color: var(--primary);">COMITÉ</span>
            </a>
            
            <nav class="sidebar-nav">
                <a href="index.php?action=dashboard" class="nav-link <?php echo ($action == 'dashboard') ? 'active' : ''; ?>">
                    <i data-lucide="layout-dashboard"></i> Dashboard
                </a>
                <a href="index.php?action=comite_view" class="nav-link <?php echo ($action == 'comite_view') ? 'active' : ''; ?>">
                    <i data-lucide="presentation"></i> Vista de Comité
                </a>
                <a href="index.php?action=pendientes_list" class="nav-link <?php echo ($action == 'pendientes_list' || $action == 'pendiente_detail') ? 'active' : ''; ?>">
                    <i data-lucide="list-todo"></i> Pedidos
                </a>
                <a href="index.php?action=pendiente_create" class="nav-link <?php echo ($action == 'pendiente_create') ? 'active' : ''; ?>">
                    <i data-lucide="plus-circle"></i> Nuevo Pedido
                </a>
                <a href="index.php?action=proyectos" class="nav-link <?php echo ($action == 'proyectos') ? 'active' : ''; ?>">
                    <i data-lucide="folder-kanban"></i> Proyectos
                </a>
                <a href="index.php?action=objetivos" class="nav-link <?php echo ($action == 'objetivos') ? 'active' : ''; ?>">
                    <i data-lucide="target"></i> Objetivos
                </a>
                <a href="index.php?action=estrategia" class="nav-link <?php echo ($action == 'estrategia') ? 'active' : ''; ?>">
                    <i data-lucide="bar-chart-big"></i> Análisis
                </a>
                <a href="index.php?action=bsc" class="nav-link <?php echo ($action == 'bsc') ? 'active' : ''; ?>">
                    <i data-lucide="target"></i> BSC
                </a>
                <a href="index.php?action=profile" class="nav-link <?php echo ($action == 'profile') ? 'active' : ''; ?>">
                    <i data-lucide="user-round-check"></i> Mi Tablero
                </a>
                <?php if ($_SESSION['user_rol'] === 'admin'): ?>
                <a href="index.php?action=usuarios" class="nav-link <?php echo ($action == 'usuarios') ? 'active' : ''; ?>">
                    <i data-lucide="users"></i> Usuarios
                </a>
                <?php endif; ?>
                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">
                <a href="index.php?action=logout" class="nav-link">
                    <i data-lucide="log-out"></i> Cerrar Sesión
                </a>
            </nav>

            <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                    <?php echo htmlspecialchars(substr($_SESSION['user_name'], 0, 1), ENT_QUOTES, 'UTF-8'); ?>
                </div>
                <div style="font-size: 0.75rem;">
                    <p style="font-weight: 600;"><?php echo htmlspecialchars($_SESSION['user_name'], ENT_QUOTES, 'UTF-8'); ?></p>
                    <p style="color: #94a3b8;"><?php echo htmlspecialchars(ucfirst($_SESSION['user_rol']), ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
            </div>
        </aside>

        <main class="main-content">
            <header class="page-header">
                <h2><?php echo $pageTitle ?? 'Panel de Control'; ?></h2>
                <div class="user-meta">
                    <span class="badge badge-secondary"><?php echo htmlspecialchars($_SESSION['user_area'], ENT_QUOTES, 'UTF-8'); ?></span>
                </div>
            </header>
