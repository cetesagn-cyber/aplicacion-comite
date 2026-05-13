# Aplicación de Seguimiento de Comité de Dirección

Esta aplicación permite gestionar, seguir y cerrar los compromisos y decisiones surgidos en el Comité de Dirección de Cementos Tequendama - CETESA S.A.S.

## Requisitos
- Servidor Web (Apache/Nginx)
- PHP 7.4 o superior
- MySQL / MariaDB

## Instalación

1. **Base de Datos**:
   - Crea una base de datos llamada `comite_seguimiento`.
   - Ejecuta el script SQL ubicado en `database/schema.sql`.

2. **Configuración**:
   - Edita el archivo `config/database.php` con tus credenciales de MySQL.

3. **Despliegue**:
   - Copia los archivos del proyecto a la carpeta de tu servidor web (ej: `htdocs` en XAMPP).
   - Asegúrate de que la carpeta `uploads/` tenga permisos de escritura.

## Credenciales Iniciales
- **Administrador**: `admin@empresa.com` / `password`
- **Director**: `director@empresa.com` / `password`

## Funcionalidades Clave
- **Dashboard Ejecutivo**: Resumen visual de estados e impactos.
- **Trazabilidad**: Historial detallado de cada compromiso.
- **Impacto Negocio**: Clasificación por EBIT, Gross, Eficiencia, etc.
- **Evidencias**: Carga de archivos adjuntos para el cierre de pendientes.

## Estructura del Proyecto
- `/config`: Conexión DB.
- `/controllers`: Lógica de navegación y procesos.
- `/models`: Interacción con tablas de la base de datos.
- `/views`: Interfaz de usuario (Layouts, Auth, Pendientes, Dashboard).
- `/assets`: Recursos CSS, JS e Iconos.
- `/uploads`: Almacenamiento de evidencias.
