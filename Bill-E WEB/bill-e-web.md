# 🧾 Bill-e Web — Portal de Gestión de Facturación

> Portal web seguro para la gestión, radicación y procesamiento de facturas que no pueden ser tramitadas automáticamente por el flujo Bill-e.

---

## Tabla de Contenido

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Módulos / Secciones](#3-estructura-de-módulos--secciones)
   - 3.1 [Inicio — Dashboard](#31-inicio--dashboard)
   - 3.2 [Gestión de Radicación](#32-gestión-de-radicación)
   - 3.3 [Radicación Manual](#33-radicación-manual)
   - 3.4 [Vista Previa e Interpretación IA](#34-vista-previa-e-interpretación-ia)
   - 3.5 [Cierre de Sesión](#35-cierre-de-sesión)
4. [Modelo de Datos Relacional — PostgreSQL](#4-modelo-de-datos-relacional--postgresql)
   - 4.1 [Diagrama Entidad-Relación (descripción textual)](#41-diagrama-entidad-relación-descripción-textual)
   - 4.2 [Definición de Tablas](#42-definición-de-tablas)
   - 4.3 [Relaciones entre Tablas](#43-relaciones-entre-tablas)
5. [Seguridad](#5-seguridad)
6. [API REST — Endpoints Principales](#6-api-rest--endpoints-principales)
7. [Stack Tecnológico](#7-stack-tecnológico)
8. [Flujo de Trabajo End-to-End](#8-flujo-de-trabajo-end-to-end)
9. [Consideraciones de Despliegue](#9-consideraciones-de-despliegue)

---

## 1. Visión General

**Bill-e Web** es el portal de contingencia y gestión manual del ecosistema de automatización Bill-e. Su propósito es centralizar las facturas que el flujo automático no pudo procesar, permitiendo a los usuarios:

- Visualizar métricas y tendencias de facturación en tiempo real.
- Radicar y editar facturas manualmente con trazabilidad completa.
- Cargar documentos en múltiples formatos (PDF, JPEG, XML).
- Obtener lectura e interpretación automática de datos mediante IA.
- Operar bajo un esquema seguro de autenticación por usuario.

---

## 2. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                      │
│         HTML5 · Tailwind CSS · JavaScript (Vanilla/Vue)       │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS / REST + JWT
┌──────────────────────▼───────────────────────────────────────┐
│                    BACKEND — API REST                         │
│        Node.js (Express) · Python (FastAPI) · PHP             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ Auth Module │  │ Invoice Svc  │  │   AI Agent / OCR  │    │
│  │  (JWT/bcrypt)│  │ CRUD + Filtros│  │ (GPT / Tesseract) │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │ pg / SQLAlchemy / PDO
┌──────────────────────▼───────────────────────────────────────┐
│               BASE DE DATOS — PostgreSQL                      │
│    Esquemas: public · billing · audit · users                 │
│    Row-Level Security · SSL/TLS · Roles diferenciados          │
└──────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│               ALMACENAMIENTO DE ARCHIVOS                      │
│         S3 / MinIO / Sistema de archivos local (cifrado)      │
└──────────────────────────────────────────────────────────────┘
```

**Principios de diseño:**
- El HTML **nunca** se conecta directamente a PostgreSQL.
- Toda comunicación pasa por la API REST con validación de token JWT.
- Los archivos de factura se almacenan fuera de la BD (solo la ruta/URL en la tabla).
- Auditoría completa: cada acción queda registrada en la tabla `audit_log`.

---

## 3. Estructura de Módulos / Secciones

El portal tiene una barra lateral fija a la izquierda con cinco secciones de navegación.

### Layout General

```
┌──────────────┬────────────────────────────────────────────┐
│              │                                            │
│  S I D E B A R   ÁREA DE CONTENIDO PRINCIPAL             │
│  [Logo]      │                                            │
│  ─────────── │                                            │
│  🏠 Inicio   │                                            │
│  📋 Gestión  │                                            │
│  📤 Radicac. │                                            │
│  👁 Vista Prev│                                            │
│  🚪 Cerrar S.│                                            │
│              │                                            │
└──────────────┴────────────────────────────────────────────┘
```

---

### 3.1 Inicio — Dashboard

**Objetivo:** Ofrecer visibilidad ejecutiva del comportamiento de facturación.

**Componentes visuales:**

| Widget | Descripción | Tipo |
|--------|-------------|------|
| Métricas del día | Facturas procesadas / pendientes / rechazadas hoy | KPI Cards |
| Facturas por día | Tendencia de radicación en los últimos 30 días | Gráfica de línea |
| Distribución por estado | Proporción de estados actuales del inventario | Gráfica de dona |
| Día pico de registro | Día de la semana con mayor volumen histórico | Barra horizontal |
| Origen de facturas | De qué proveedor/fuente provienen las facturas | Gráfica de barras |
| Últimas radicaciones | Tabla resumen con las 10 facturas más recientes | Mini-tabla |

**Filtros del dashboard:**
- Rango de fechas (selector de calendario).
- Filtro por empresa/proveedor.
- Filtro por usuario radicador.

---

### 3.2 Gestión de Radicación

**Objetivo:** Gestionar el inventario completo de facturas radicadas con capacidades de edición y filtrado avanzado.

**Sub-componentes:**

**Panel de filtros (barra superior colapsable):**
- Fecha de radicación (desde / hasta).
- Estado de factura (Pendiente, Procesada, Rechazada, En revisión).
- Proveedor / Empresa emisora.
- Usuario responsable.
- Número de factura.
- Búsqueda libre de texto.
- Botones: `Aplicar filtros` · `Limpiar` · `Exportar CSV/Excel`.

**Tabla tipo Excel (modo edición en línea):**

| # | N° Factura | Proveedor | Fecha Emisión | Valor Total | Estado | Formato | Usuario | Acciones |
|---|-----------|-----------|---------------|-------------|--------|---------|---------|----------|
| 1 | FV-2024-001 | Empresa X | 2024-01-15 | $1.500.000 | 🟡 Pendiente | PDF | jlopez | ✏️ 🗑️ 👁 |

**Funcionalidades de la tabla:**
- Edición en línea (clic en celda para editar).
- Paginación configurable (10 / 25 / 50 / 100 registros).
- Ordenamiento por columna (ascendente / descendente).
- Selección múltiple para acciones en lote (cambio de estado masivo).
- Indicadores de color por estado:
  - 🟡 Amarillo: Pendiente
  - 🟢 Verde: Procesada
  - 🔴 Rojo: Rechazada
  - 🔵 Azul: En revisión

---

### 3.3 Radicación Manual

**Objetivo:** Permitir la carga de facturas que el flujo automático Bill-e no pudo procesar.

**Flujo de radicación:**

```
1. Seleccionar origen (dropdown)
      ↓
2. Cargar archivo (drag & drop o clic)
      ↓
3. Validación automática de formato y tamaño
      ↓
4. Previsualización rápida
      ↓
5. Completar campos mínimos requeridos
      ↓
6. Confirmar radicación → Pasa a Sección 4 (Vista Previa)
```

**Formatos admitidos:**

| Formato | Extensión | Tamaño máx. |
|---------|-----------|-------------|
| PDF | `.pdf` | 10 MB |
| Imagen | `.jpg`, `.jpeg`, `.png` | 5 MB |
| XML (CFDI/UBL) | `.xml` | 2 MB |

**Origen de la factura (lista desplegable — configurable en BD):**
- Correo electrónico (bandeja de entrada)
- Portal del proveedor
- Radicación física escaneada
- Mensaje de WhatsApp / Teams
- ERP externo (SAP, Siesa, World Office, etc.)
- Otro (campo libre)

**Campos del formulario de radicación:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| Archivo | File upload | ✅ |
| Origen | Select | ✅ |
| N° de factura (referencia) | Text | ✅ |
| Empresa emisora | Text / Autocomplete | ✅ |
| NIT / RUT del proveedor | Text | ✅ |
| Fecha de la factura | Date | ✅ |
| Valor bruto | Número | ✅ |
| Observaciones / Motivo de falla Bill-e | Textarea | ⬜ |

---

### 3.4 Vista Previa e Interpretación IA

**Objetivo:** Mostrar la representación visual del documento cargado y los datos extraídos automáticamente por el agente de IA.

**Layout de la sección (50% / 50% o ajustable):**

```
┌─────────────────────────┬──────────────────────────────┐
│   VISOR DE DOCUMENTO    │    DATOS EXTRAÍDOS POR IA    │
│                         │                              │
│  [PDF/Imagen renderizada│  ┌──────────────────────┐    │
│   a escala, con zoom    │  │ N° Factura: FV-001   │    │
│   y scroll]             │  │ Emisor: Empresa X    │    │
│                         │  │ NIT: 900.123.456-7   │    │
│  🔍 Zoom + / Zoom -     │  │ Fecha: 2024-01-15    │    │
│  ↕ Página siguiente     │  │ Subtotal: $1.260.504 │    │
│                         │  │ IVA (19%): $239.496  │    │
│                         │  │ Total: $1.500.000    │    │
│                         │  └──────────────────────┘    │
│                         │                              │
│                         │  ✅ Confianza: 94%           │
│                         │  ⚠️ Campos a verificar: 1   │
│                         │                              │
│                         │  [Campos editables para      │
│                         │   corrección manual]         │
│                         │                              │
│                         │  [Confirmar y Radicar]       │
│                         │  [Volver a cargar]           │
└─────────────────────────┴──────────────────────────────┘
```

**Campos que extrae el agente IA:**

| Campo | Fuente probable |
|-------|----------------|
| Número de factura | Encabezado del documento |
| Nombre del emisor | Datos del proveedor |
| NIT / RUT | Identificación fiscal |
| Fecha de emisión | Fecha del documento |
| Fecha de vencimiento | Términos de pago |
| Descripción de ítems | Cuerpo/detalle de la factura |
| Subtotal, IVA, Total | Sección de totales |
| Método de pago | Observaciones / pie |
| Número de cuenta | Datos bancarios |

**Indicadores de calidad de extracción:**
- `✅ Alta confianza` (>90%): el campo fue extraído con certeza.
- `⚠️ Revisar` (60–90%): posible error, se resalta para edición.
- `❌ No encontrado` (<60%): el usuario debe llenar manualmente.

---

### 3.5 Cierre de Sesión

**Funcionalidades:**
- Confirmación antes de cerrar sesión (`¿Está seguro que desea salir?`).
- Invalida el token JWT en el servidor (lista negra de tokens o reducción de TTL).
- Limpia `localStorage` / `sessionStorage` en el navegador.
- Redirige automáticamente a la pantalla de login.

**Pantalla de Login (página independiente):**

```
┌─────────────────────────────────────┐
│           🧾 Bill-e Web             │
│   ─────────────────────────────     │
│   Usuario: [____________________]   │
│   Contraseña: [________________]    │
│   [       Iniciar Sesión       ]    │
│   ─────────────────────────────     │
│   ¿Olvidó su contraseña? → Link     │
└─────────────────────────────────────┘
```

---

## 4. Modelo de Datos Relacional — PostgreSQL

> La tabla principal `facturas_procesadas` refleja exactamente la estructura real de datos leídos de la factura por el agente IA/OCR del sistema Bill-e.

### 4.1 Diagrama Entidad-Relación

```
┌──────────────┐    N:1    ┌──────────────┐
│    users     │──────────▶│    roles     │
└──────┬───────┘           └──────────────┘
       │ 1                      
       │ N                       
       ▼                        
┌──────────────────┐   1:N  ┌─────────────────────┐
│    facturas      │───────▶│  facturas_archivos   │
│    _procesadas   │        │  (archivos físicos)  │
│  ← TABLA CENTRAL │   1:N  └─────────────────────┘
│    21 columnas → │───────▶┌─────────────────────┐
└──────────────────┘        │   ai_extracciones   │
       │ N:1                │ (resultado agente IA)│
       ▼                    └──────────┬──────────┘
┌──────────────────┐               1  │
│    proveedores   │                  │ N
└──────────────────┘                  ▼
┌──────────────────┐        ┌─────────────────────┐
│ origenes_factura │        │  ai_campos_detalle  │
└──────────────────┘        └─────────────────────┘

audit_log ◀──── (todas las tablas vía trigger o app layer)
```

---

### 4.2 Definición de Tablas

#### 📌 TABLA PRINCIPAL: `facturas_procesadas`

> Esta es la tabla central del sistema. Sus 21 columnas representan exactamente los campos que el agente IA/OCR extrae de cada factura cargada.

```sql
-- ============================================================
-- TABLA: facturas_procesadas
-- Tabla principal — Datos leídos de la factura por el agente IA
-- Estructura real del sistema Bill-e (21 columnas)
-- ============================================================
CREATE TABLE facturas_procesadas (

    -- ── Identificación ────────────────────────────────────────
    id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    consecutivo         INTEGER NOT NULL,           -- Número correlativo de radicación
    id_unico            TEXT UNIQUE NOT NULL,        -- Identificador único global de la factura

    -- ── Datos del Proveedor ───────────────────────────────────
    nit_proveedor       TEXT NOT NULL,              -- NIT o RUT del emisor
    nombre_proveedor    TEXT NOT NULL,              -- Razón social del proveedor

    -- ── Datos de la Factura ───────────────────────────────────
    numero_factura      TEXT NOT NULL,              -- Número impreso en la factura
    fecha_emision       DATE NOT NULL,              -- Fecha de emisión del documento
    fecha_vencimiento   DATE,                       -- Fecha límite de pago
    cufe                TEXT,                       -- Código Único de Factura Electrónica (DIAN)

    -- ── Valores Financieros ───────────────────────────────────
    valor_base          NUMERIC(15,2) NOT NULL,     -- Subtotal antes de IVA
    iva                 NUMERIC(15,2) DEFAULT 0,    -- Valor del IVA
    valor_total         NUMERIC(15,2) NOT NULL,     -- Total a pagar (valor_base + iva)

    -- ── Contenido e Ítems ─────────────────────────────────────
    descripcion_items   TEXT,                       -- Descripción del bien/servicio (texto libre o JSON)

    -- ── Clasificación del Documento ───────────────────────────
    tipo_archivo        TEXT,                       -- 'pdf' | 'xml' | 'jpeg' | 'png'
    es_proforma         BOOLEAN DEFAULT FALSE,      -- TRUE si es cotización/proforma, no factura real

    -- ── Integración con ERP / Compras ─────────────────────────
    orden_compra        CHARACTER VARYING(20),      -- N° de orden de compra asociada
    entrada_servicio    CHARACTER VARYING(20),      -- N° de entrada de servicio/recepción

    -- ── Estado y Seguimiento ──────────────────────────────────
    estado              TEXT DEFAULT 'PENDIENTE',
                        -- 'PENDIENTE' | 'EN_REVISION' | 'PROCESADA' | 'RECHAZADA'
    observaciones       TEXT,                       -- Notas del operador o razón de rechazo

    -- ── Auditoría ─────────────────────────────────────────────
    fecha_registro      DATE DEFAULT CURRENT_DATE,  -- Fecha en que se radicó en el portal
    created_at          TIMESTAMPTZ DEFAULT NOW(),  -- Timestamp exacto de creación

    -- ── Restricciones ─────────────────────────────────────────
    CONSTRAINT uq_factura_proveedor UNIQUE (numero_factura, nit_proveedor),
    CONSTRAINT chk_estado CHECK (estado IN ('PENDIENTE','EN_REVISION','PROCESADA','RECHAZADA')),
    CONSTRAINT chk_valor_total CHECK (valor_total >= 0),
    CONSTRAINT chk_iva CHECK (iva >= 0)
);

-- Índices de rendimiento para filtros frecuentes
CREATE INDEX idx_fp_estado          ON facturas_procesadas(estado);
CREATE INDEX idx_fp_fecha_registro  ON facturas_procesadas(fecha_registro DESC);
CREATE INDEX idx_fp_nit_proveedor   ON facturas_procesadas(nit_proveedor);
CREATE INDEX idx_fp_numero_factura  ON facturas_procesadas(numero_factura);
CREATE INDEX idx_fp_created_at      ON facturas_procesadas(created_at DESC);
CREATE INDEX idx_fp_orden_compra    ON facturas_procesadas(orden_compra)
    WHERE orden_compra IS NOT NULL;
```

---

#### 🗂️ Diccionario de Columnas — `facturas_procesadas`

| # | Columna | Tipo | Nulo | Descripción | Leído por IA |
|---|---------|------|------|-------------|:---:|
| 1 | `id` | INTEGER | No | PK autoincremental | — |
| 2 | `consecutivo` | INTEGER | No | Número correlativo de radicación | — |
| 3 | `fecha_registro` | DATE | No | Fecha en que se radica en portal | — |
| 4 | `numero_factura` | TEXT | No | N° de factura del proveedor | ✅ |
| 5 | `nit_proveedor` | TEXT | No | NIT / RUT del emisor | ✅ |
| 6 | `nombre_proveedor` | TEXT | No | Razón social del proveedor | ✅ |
| 7 | `fecha_emision` | DATE | No | Fecha impresa en la factura | ✅ |
| 8 | `fecha_vencimiento` | DATE | Sí | Fecha límite de pago | ✅ |
| 9 | `valor_base` | NUMERIC(15,2) | No | Subtotal sin IVA | ✅ |
| 10 | `iva` | NUMERIC(15,2) | Sí | Monto de IVA | ✅ |
| 11 | `valor_total` | NUMERIC(15,2) | No | Total = base + iva | ✅ |
| 12 | `descripcion_items` | TEXT | Sí | Detalle de bienes/servicios | ✅ |
| 13 | `tipo_archivo` | TEXT | Sí | Formato del doc cargado | — |
| 14 | `estado` | TEXT | No | Estado en el flujo | — |
| 15 | `observaciones` | TEXT | Sí | Notas del operador | — |
| 16 | `cufe` | TEXT | Sí | Código único DIAN (e-factura) | ✅ |
| 17 | `created_at` | TIMESTAMPTZ | No | Timestamp de creación | — |
| 18 | `es_proforma` | BOOLEAN | No | Indica si es proforma | ✅ |
| 19 | `orden_compra` | VARCHAR(20) | Sí | N° OC del ERP | ✅ |
| 20 | `entrada_servicio` | VARCHAR(20) | Sí | N° entrada de servicio | ✅ |
| 21 | `id_unico` | TEXT | No | ID global único de la factura | ✅ |

---

#### Esquema: `users` — Autenticación

```sql
-- ============================================================
-- TABLA: roles
-- Roles del sistema (admin, auditor, operador, visor)
-- ============================================================
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,   -- 'admin' | 'operador' | 'auditor' | 'visor'
    description TEXT,
    permissions JSONB,                         -- {"can_edit": true, "can_delete": false, ...}
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: users
-- Usuarios del portal Bill-e Web
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,     -- bcrypt con salt (rounds ≥ 12)
    full_name       VARCHAR(200),
    role_id         INT NOT NULL REFERENCES roles(id),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    failed_attempts INT DEFAULT 0,             -- Control de intentos fallidos
    locked_until    TIMESTAMPTZ,               -- Bloqueo temporal tras intentos
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: user_sessions
-- Tokens JWT activos (para invalidación en logout)
-- ============================================================
CREATE TABLE user_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,         -- SHA-256 del JWT (no el token completo)
    ip_address  INET,
    user_agent  TEXT,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### Esquema: `billing` — Catálogos y Archivos

```sql
-- ============================================================
-- TABLA: proveedores
-- Catálogo maestro de proveedores (se puede poblar desde facturas_procesadas)
-- ============================================================
CREATE TABLE proveedores (
    id          SERIAL PRIMARY KEY,
    nit         TEXT UNIQUE NOT NULL,          -- Llave de unión con facturas_procesadas.nit_proveedor
    nombre      TEXT NOT NULL,
    email       VARCHAR(255),
    telefono    VARCHAR(30),
    direccion   TEXT,
    ciudad      VARCHAR(100),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: origenes_factura
-- De dónde proviene el archivo cargado (configurable en BD)
-- ============================================================
CREATE TABLE origenes_factura (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) UNIQUE NOT NULL,  -- 'Correo', 'Portal proveedor', 'ERP', etc.
    descripcion TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA: facturas_archivos
-- Archivos físicos vinculados a facturas_procesadas
-- Un registro de factura puede tener PDF + XML simultáneamente
-- ============================================================
CREATE TABLE facturas_archivos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id      INT NOT NULL REFERENCES facturas_procesadas(id) ON DELETE CASCADE,
    origen_id       INT REFERENCES origenes_factura(id),
    file_name       VARCHAR(300) NOT NULL,
    file_path       TEXT NOT NULL,             -- URL firmada en S3/MinIO
    file_type       VARCHAR(10) NOT NULL,      -- 'pdf' | 'xml' | 'jpeg' | 'png'
    file_size_kb    INT,
    mime_type       VARCHAR(100),
    checksum        VARCHAR(64),               -- SHA-256 para verificar integridad
    uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by     UUID REFERENCES users(id),
    is_primary      BOOLEAN DEFAULT TRUE       -- Archivo principal vs adjunto
);
```

---

#### Esquema: `ai_processing` — Agente IA / OCR

```sql
-- ============================================================
-- TABLA: ai_extracciones
-- Resultado de la lectura IA por factura cargada
-- Los campos extraídos se mapean 1:1 con facturas_procesadas
-- ============================================================
CREATE TABLE ai_extracciones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id          INT NOT NULL REFERENCES facturas_procesadas(id) ON DELETE CASCADE,
    archivo_id          UUID REFERENCES facturas_archivos(id),

    -- Resultado global
    datos_extraidos     JSONB,             -- Snapshot completo de lo que leyó la IA
    confianza_global    NUMERIC(5,2),      -- 0.00 a 100.00 (promedio de todos los campos)
    campos_a_revisar    INT DEFAULT 0,     -- Cantidad de campos con baja confianza

    -- Control del proceso
    modelo_usado        VARCHAR(100),      -- 'gpt-4o' | 'claude-3' | 'tesseract-5'
    tiempo_proceso_ms   INT,               -- Latencia del agente
    estado_proceso      VARCHAR(50),       -- 'SUCCESS' | 'PARTIAL' | 'FAILED'
    detalle_error       TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: ai_campos_detalle
-- Confianza y corrección campo a campo
-- Mapea directamente las columnas de facturas_procesadas
-- ============================================================
CREATE TABLE ai_campos_detalle (
    id               SERIAL PRIMARY KEY,
    extraccion_id    UUID NOT NULL REFERENCES ai_extracciones(id) ON DELETE CASCADE,

    -- Referencia directa a columna de facturas_procesadas
    nombre_campo     VARCHAR(100) NOT NULL,
    -- Ej: 'numero_factura','nit_proveedor','valor_total','cufe','orden_compra', etc.

    valor_bruto      TEXT,                 -- Tal como lo leyó la IA
    valor_normalizado TEXT,                -- Limpio y formateado
    confianza        NUMERIC(5,2),         -- Confianza específica del campo (0-100)

    -- Corrección manual por operador
    fue_corregido    BOOLEAN DEFAULT FALSE,
    valor_corregido  TEXT,
    corregido_por    UUID REFERENCES users(id),
    corregido_at     TIMESTAMPTZ
);
```

---

#### Esquema: `audit`

```sql
-- ============================================================
-- TABLA: audit_log
-- Trazabilidad completa — cada acción sobre cualquier tabla
-- ============================================================
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    accion      VARCHAR(100) NOT NULL,
    -- 'CREATE_FACTURA' | 'UPDATE_ESTADO' | 'CORREGIR_CAMPO_IA' | 'LOGIN' | 'EXPORT'
    entidad     VARCHAR(100),              -- 'facturas_procesadas' | 'users' | 'proveedores'
    entidad_id  TEXT,                      -- ID del registro afectado
    valor_prev  JSONB,                     -- Estado antes del cambio
    valor_nuevo JSONB,                     -- Estado después del cambio
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entidad   ON audit_log(entidad, entidad_id);
CREATE INDEX idx_audit_usuario   ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_accion    ON audit_log(accion, created_at DESC);

-- ============================================================
-- TRIGGER: auto-audit en facturas_procesadas
-- Registra automáticamente cambios de estado y ediciones
-- ============================================================
CREATE OR REPLACE FUNCTION fn_audit_facturas()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (entidad, entidad_id, valor_prev, valor_nuevo, accion)
    VALUES (
        'facturas_procesadas',
        OLD.id::TEXT,
        row_to_json(OLD)::JSONB,
        row_to_json(NEW)::JSONB,
        'UPDATE_FACTURA'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_facturas
AFTER UPDATE ON facturas_procesadas
FOR EACH ROW EXECUTE FUNCTION fn_audit_facturas();
```

---

### 4.3 Relaciones entre Tablas

```
┌─────────────┐   N:1  ┌──────────────────┐
│    users    │───────▶│      roles       │
└──────┬──────┘        └──────────────────┘
       │ 1:N                   
       ▼                        
┌──────────────────┐   N:1  ┌──────────────────┐
│facturas_procesadas│──────▶│   proveedores    │
│  (TABLA CENTRAL) │        │ (nit = FK lógica)│
│  21 columnas     │        └──────────────────┘
└────────┬─────────┘
         │ 1
         ├── N ──▶ facturas_archivos ─── N:1 ──▶ origenes_factura
         │
         └── 1 ──▶ ai_extracciones
                        │ 1
                        └── N ──▶ ai_campos_detalle
                                  (nombre_campo = columna de facturas_procesadas)

audit_log ◀──── trigger en facturas_procesadas + app layer en demás tablas
```

---

**Cardinalidades clave:**

| Relación | Tipo | Descripción |
|----------|------|-------------|
| `users` → `roles` | N:1 | Cada usuario tiene un rol |
| `facturas_procesadas` → `proveedores` | N:1 | Muchas facturas del mismo proveedor (join por `nit_proveedor`) |
| `facturas_procesadas` → `users` | N:1 | Un usuario radica muchas facturas |
| `facturas_procesadas` → `facturas_archivos` | 1:N | Una factura puede tener PDF + XML + imagen |
| `facturas_procesadas` → `ai_extracciones` | 1:1 | Una sesión de extracción IA por factura |
| `ai_extracciones` → `ai_campos_detalle` | 1:N | Un registro por cada columna extraída |
| `facturas_archivos` → `origenes_factura` | N:1 | Cada archivo viene de un origen |

---

### 4.4 Mapeo IA → Columnas de `facturas_procesadas`

Cuando el agente IA lee un documento, cada campo extraído se almacena en `ai_campos_detalle` y luego se persiste en la columna correspondiente de `facturas_procesadas`:

| Campo extraído por IA (`nombre_campo`) | Columna destino | Confianza esperada |
|----------------------------------------|-----------------|--------------------|
| `numero_factura` | `numero_factura` | Alta (>90%) |
| `nit_proveedor` | `nit_proveedor` | Alta (>90%) |
| `nombre_proveedor` | `nombre_proveedor` | Alta (>85%) |
| `fecha_emision` | `fecha_emision` | Alta (>90%) |
| `fecha_vencimiento` | `fecha_vencimiento` | Media (70–90%) |
| `valor_base` | `valor_base` | Alta (>90%) |
| `iva` | `iva` | Alta (>85%) |
| `valor_total` | `valor_total` | Alta (>95%) |
| `descripcion_items` | `descripcion_items` | Media (60–85%) |
| `cufe` | `cufe` | Muy alta (>97%) — código QR/barra |
| `es_proforma` | `es_proforma` | Alta — detectado por texto |
| `orden_compra` | `orden_compra` | Media (condicional) |
| `entrada_servicio` | `entrada_servicio` | Media (condicional) |
| `id_unico` | `id_unico` | Generado por sistema |

---

## 5. Seguridad

### Autenticación y Sesiones

| Mecanismo | Implementación |
|-----------|---------------|
| Contraseñas | `bcrypt` con factor de coste ≥ 12 |
| Tokens | JWT con expiración de 8 horas (configurable) |
| Refresh Token | Token de renovación de 7 días (rotativo) |
| Bloqueo de cuenta | 5 intentos fallidos → bloqueo de 30 min |
| HTTPS | Obligatorio en todos los entornos |
| CORS | Lista blanca de dominios permitidos |

### Seguridad en PostgreSQL

```sql
-- Roles de base de datos con privilegios mínimos
CREATE ROLE billee_api LOGIN PASSWORD 'strongpassword';
GRANT CONNECT ON DATABASE billee_db TO billee_api;
GRANT SELECT, INSERT, UPDATE ON invoices, invoice_files, providers TO billee_api;
GRANT SELECT ON invoice_statuses, invoice_origins, roles TO billee_api;

-- Revocar acceso innecesario
REVOKE DELETE ON invoices FROM billee_api; -- Solo admin puede eliminar

-- Row Level Security (RLS) — usuarios solo ven sus propios datos si aplica
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_invoices ON invoices
    USING (uploaded_by = current_setting('app.current_user_id')::UUID
           OR current_setting('app.role') = 'admin');
```

### Validaciones Adicionales

- Validación de tipo MIME real del archivo (no solo extensión).
- Escaneo antivirus en archivos cargados (ClamAV o servicio externo).
- Rate limiting en endpoints de login y carga de archivos.
- Sanitización de entradas para prevenir SQL Injection e XSS.
- Headers de seguridad: `CSP`, `X-Frame-Options`, `HSTS`.
- Logs de acceso y alertas por comportamiento inusual.

---

## 6. API REST — Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión → retorna JWT |
| POST | `/api/auth/logout` | Revocar token activo |
| POST | `/api/auth/refresh` | Renovar JWT con refresh token |
| POST | `/api/auth/forgot-password` | Solicitar restablecimiento |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/metrics` | KPIs del día actual |
| GET | `/api/dashboard/trends?days=30` | Tendencia histórica |
| GET | `/api/dashboard/by-origin` | Facturas agrupadas por origen |
| GET | `/api/dashboard/peak-day` | Día pico de radicación |

### Gestión de Facturas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/invoices` | Listar con filtros y paginación |
| GET | `/api/invoices/:id` | Detalle de una factura |
| POST | `/api/invoices` | Crear nueva factura (radicación manual) |
| PATCH | `/api/invoices/:id` | Actualizar campos (edición en tabla) |
| DELETE | `/api/invoices/:id` | Eliminar (solo admin) |
| GET | `/api/invoices/export?format=csv` | Exportar resultados filtrados |

### Archivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/invoices/:id/files` | Subir archivo a factura |
| GET | `/api/invoices/:id/files/:fileId` | Descargar archivo |
| DELETE | `/api/invoices/:id/files/:fileId` | Eliminar archivo |

### Procesamiento IA

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/ai/extract` | Enviar archivo al agente de extracción |
| GET | `/api/ai/extractions/:invoiceId` | Obtener resultado de extracción |
| PATCH | `/api/ai/fields/:fieldId` | Corregir campo extraído manualmente |

### Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/providers` | Lista de proveedores |
| POST | `/api/providers` | Crear proveedor |
| GET | `/api/origins` | Orígenes disponibles |
| GET | `/api/statuses` | Estados disponibles |

---

## 7. Stack Tecnológico

### Frontend

| Tecnología | Uso |
|-----------|-----|
| HTML5 | Estructura del portal |
| Tailwind CSS | Diseño del layout lateral y componentes |
| JavaScript (ES2022+) | Lógica de cliente y consumo de API |
| Chart.js / ApexCharts | Gráficas del dashboard |
| PDF.js | Renderizado de PDFs en Vista Previa |
| Axios | Llamadas HTTP a la API |

### Backend (opción Node.js)

| Tecnología | Uso |
|-----------|-----|
| Node.js 20+ | Runtime del servidor |
| Express / Fastify | Framework de API REST |
| jsonwebtoken | Manejo de JWT |
| bcrypt | Hash de contraseñas |
| Multer | Gestión de carga de archivos |
| pg / Prisma | Conexión a PostgreSQL |
| Joi / Zod | Validación de esquemas de entrada |

### Base de Datos

| Tecnología | Uso |
|-----------|-----|
| PostgreSQL 16+ | Base de datos principal |
| pgcrypto | Generación de UUIDs y cifrado |
| pg_trgm | Búsqueda de texto eficiente |

### Infraestructura

| Tecnología | Uso |
|-----------|-----|
| Docker / Docker Compose | Contenerización de servicios |
| MinIO o AWS S3 | Almacenamiento de archivos |
| Nginx | Proxy reverso y SSL |
| Let's Encrypt | Certificados TLS |

---

## 8. Flujo de Trabajo End-to-End

```
Factura no procesada por Bill-e
            ↓
    Usuario accede al portal
    (Login con user/password)
            ↓
    Sección: Radicación Manual
    - Selecciona origen
    - Carga archivo (PDF/JPEG/XML)
    - Llena campos básicos
            ↓
    API recibe el archivo
    - Valida formato y tamaño
    - Calcula checksum
    - Guarda en S3/MinIO
    - Crea registro en invoices
            ↓
    Agente IA / OCR procesa el archivo
    - Extrae campos estructurados
    - Calcula confianza por campo
    - Guarda en ai_extractions
            ↓
    Sección: Vista Previa
    - Usuario ve el documento renderizado
    - Revisa y corrige campos extraídos
    - Confirma la radicación
            ↓
    Estado → "En revisión" o "Procesada"
    Audit log registra la acción
            ↓
    Sección: Gestión de Radicación
    - La factura aparece en la tabla
    - Equipo puede hacer seguimiento
    - Se puede exportar reporte
```

---

## 9. Consideraciones de Despliegue

### Variables de Entorno (`.env`)

```dotenv
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=billee_db
DB_USER=billee_api
DB_PASSWORD=strongpassword_aqui
DB_SSL=true

# JWT
JWT_SECRET=super_secreto_256bits_aqui
JWT_EXPIRY=8h
JWT_REFRESH_EXPIRY=7d

# Almacenamiento
STORAGE_PROVIDER=minio       # 'minio' | 's3'
STORAGE_BUCKET=billee-files
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin

# IA
AI_PROVIDER=openai           # 'openai' | 'anthropic' | 'local'
AI_API_KEY=sk-...
AI_MODEL=gpt-4o

# Seguridad
ALLOWED_ORIGINS=https://billee.tudominio.com
MAX_FILE_SIZE_MB=10
BCRYPT_ROUNDS=12
```

### Docker Compose (resumen)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["80:80", "443:443"]

  api:
    build: ./api
    environment:
      - DB_HOST=db
    depends_on: [db, minio]

  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: billee_db

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes: [miniodata:/data]

volumes:
  pgdata:
  miniodata:
```

---

> **Nota de seguridad:** Nunca exponga las credenciales de la base de datos en el frontend. Toda operación sobre PostgreSQL debe pasar exclusivamente por la capa de API con autenticación JWT válida. Los archivos de factura deben almacenarse cifrados y accederse solo mediante URLs firmadas temporales (presigned URLs).

---

*Documento generado para el proyecto Bill-e Web — Portal de Gestión de Facturación.*
*Versión 1.0 — Revisar y actualizar conforme avance el desarrollo.*
