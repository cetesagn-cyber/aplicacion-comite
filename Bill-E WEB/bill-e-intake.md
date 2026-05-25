# Intake Bill-e Web

## 1. Visión general

Bill-e Web es el portal de contingencia y gestión manual del ecosistema Bill-e para facturación. Su función principal es recibir, validar y procesar facturas que el flujo automático no pudo manejar correctamente, ofreciendo trazabilidad, auditoría y asistencia asistida por IA.

## 2. Problema a resolver

- El flujo automático de facturación Bill-e deja facturas no procesadas cuando el documento está incompleto, escaneado, mal indexado o llega en un formato no estándar.
- Los procesos manuales actuales son lentos, inconsistentes y carecen de trazabilidad y métricas en tiempo real.
- Los departamentos financieros y de radicación necesitan una única interfaz para visualizar, corregir y radicar esas facturas.

## 3. Objetivos principales

- Centralizar el procesamiento manual de facturas falidas.
- Reducir el tiempo de corrección manual mediante lectura automática y extracción IA.
- Mejorar la visibilidad del estado de radicación con dashboards e informes.
- Garantizar seguridad y control de acceso por usuario.
- Registrar auditoría de acciones críticas sobre facturas.

## 4. Usuarios y roles

- Administrador
  - Gestiona usuarios y permisos.
  - Monitorea auditoría y métricas.
- Operador de radicación
  - Carga facturas manuales.
  - Revisa y corrige datos extraídos.
  - Confirma facturas para su proceso.
- Revisor / Control interno
  - Supervisa estados de facturación.
  - Consulta historial y evidencia.
- Usuario de soporte técnico
  - Verifica incidentes de facturación.
  - Analiza errores de extracción.

## 5. Alcance funcional

### 5.1 Capture y radicación

- Subida de facturas en PDF, imagen (JPG, PNG) o XML.
- Selección de origen del documento.
- Previsualización del archivo cargado.
- Extracción automática de datos:
  - número de factura
  - proveedor / razón social
  - NIT / RUT
  - fecha de emisión
  - fecha de vencimiento
  - subtotal / IVA / total
  - orden de compra
- Corrección manual de los campos extraídos.
- Guardado de archivo y registro en base de datos.

### 5.2 Gestión de facturas

- Listado de facturas con filtros avanzados:
  - Estado
  - Fecha de emisión
  - Proveedor
  - Número de factura
  - Tipo de archivo
- Búsqueda libre y paginación.
- Edición de datos en línea.
- Cambios masivos de estado.
- Exportación a CSV/Excel.

### 5.3 Dashboard e indicadores

- Métricas de facturas por estado.
- Tendencias de radicación por día.
- Distribución por proveedor y origen.
- Indicadores de tiempos de procesamiento.

### 5.4 IA / OCR

- Extracción de datos desde XML, PDF y OCR (Tesseract).
- Mejora del análisis con IA cuando la confianza es baja.
- Modelo configurable vía variable de entorno.

### 5.5 Seguridad y auditoría

- Autenticación con JWT.
- Roles y permisos para vistas y acciones.
- Registro de acciones en `audit_log`.
- Control de acceso al API y a archivos subidos.

## 6. Arquitectura técnica

- Frontend: React + Vite + TypeScript + Tailwind.
- Backend: Node.js + Express + PostgreSQL.
- Almacenamiento de archivos: disco local o proveedor externo.
- IA: OpenAI / modelo Codex para extracción y chat.
- OCR: Tesseract.js para documentos escaneados.

## 7. Métricas de éxito

- % de facturas no procesadas automáticamente que se radican desde Bill-e Web.
- Tiempo promedio de radicación manual.
- Reducción en la tasa de errores de captura de datos.
- Número de consultas de auditoría realizadas.
- Nivel de adopción por parte del equipo de radicación.

## 8. Restricciones y supuestos

- El usuario final debe iniciar sesión.
- Los archivos se validan por tipo y tamaño antes de subir.
- La IA requiere una clave configurada (`AI_API_KEY`).
- Los datos sensibles no se exponen en el frontend.

## 9. Requisitos no funcionales

- Interfaz responsive para escritorio.
- Respuesta rápida en filtros y tablas.
- Registro de auditoría para cada inserción y actualización.
- Escalabilidad para manejar miles de facturas.
- Soporte de despliegue en entornos locales y en la nube.

## 10. Siguiente paso recomendado

- Validar con los stakeholders el flujo de radicación manual.
- Definir los campos obligatorios del formulario.
- Priorizar las mejoras de IA y chat en función del volumen de documentos no procesados.
- Crear un roadmap de fases: MVP de radicación → Gestión avanzada → Chat/ayuda IA.
