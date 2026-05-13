<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Seguimiento Comité</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <h1>Comité de Dirección</h1>
                <p style="color: var(--text-muted); font-size: 0.875rem;">Seguimiento y Decisiones</p>
            </div>

            <?php if (isset($error)): ?>
                <div class="alert alert-danger">
                    <?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?>
                </div>
            <?php endif; ?>

            <form action="index.php?action=login" method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(AuthController::getCsrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" class="form-control" placeholder="ejemplo@empresa.com" required autofocus>
                </div>
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
            </form>

            <div style="margin-top: 2rem; text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                &copy; <?php echo date('Y'); ?> Cementos Tequendama - CETESA S.A.S.
            </div>
        </div>
    </div>
</body>
</html>
