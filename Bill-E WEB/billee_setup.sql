-- ============================================================
-- Bill-e Web — Script de base de datos local para pruebas
-- PostgreSQL 16+
-- Ejecutar con: psql -U postgres -f billee_setup.sql
-- ============================================================

-- Crear base de datos (ejecutar conectado a postgres)
-- CREATE DATABASE billee_db;
-- \c billee_db

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLA: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Roles base
INSERT INTO roles (name, description, permissions) VALUES
  ('admin',    'Administrador del sistema',  '{"can_edit": true,  "can_delete": true,  "can_export": true}'),
  ('operador', 'Operador de radicación',     '{"can_edit": true,  "can_delete": false, "can_export": true}'),
  ('auditor',  'Auditor de facturas',        '{"can_edit": false, "can_delete": false, "can_export": true}'),
  ('visor',    'Solo lectura',               '{"can_edit": false, "can_delete": false, "can_export": false}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(200),
    role_id         INT NOT NULL REFERENCES roles(id),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    failed_attempts INT DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios de prueba (contraseña: Test1234!)
INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES
  ('admin',      'admin@billee.local',      crypt('Test1234!', gen_salt('bf', 12)), 'Administrador',       (SELECT id FROM roles WHERE name = 'admin')),
  ('jlopez',     'jlopez@billee.local',     crypt('Test1234!', gen_salt('bf', 12)), 'Juan López',          (SELECT id FROM roles WHERE name = 'operador')),
  ('mrodriguez', 'mrodriguez@billee.local', crypt('Test1234!', gen_salt('bf', 12)), 'María Rodríguez',     (SELECT id FROM roles WHERE name = 'operador')),
  ('arodriguez', 'arodriguez@billee.local', crypt('Test1234!', gen_salt('bf', 12)), 'Ana Rodríguez',       (SELECT id FROM roles WHERE name = 'auditor')),
  ('visor1',     'visor1@billee.local',     crypt('Test1234!', gen_salt('bf', 12)), 'Visualizador Demo',   (SELECT id FROM roles WHERE name = 'visor'))
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- TABLA: user_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    ip_address  INET,
    user_agent  TEXT,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: origenes_factura
-- ============================================================
CREATE TABLE IF NOT EXISTS origenes_factura (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) UNIQUE NOT NULL,
    descripcion TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

INSERT INTO origenes_factura (nombre, descripcion) VALUES
  ('Correo electrónico', 'Recibida en bandeja de entrada'),
  ('Portal del proveedor', 'Descargada del portal del proveedor'),
  ('Física (Escaneada)', 'Radicación física escaneada'),
  ('WhatsApp / Teams', 'Enviada por mensajería'),
  ('ERP Externo', 'Importada desde SAP, Siesa, World Office, etc.'),
  ('Otro', 'Origen no categorizado')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- TABLA: proveedores
-- ============================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id          SERIAL PRIMARY KEY,
    nit         TEXT UNIQUE NOT NULL,
    nombre      TEXT NOT NULL,
    email       VARCHAR(255),
    telefono    VARCHAR(30),
    direccion   TEXT,
    ciudad      VARCHAR(100),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO proveedores (nit, nombre, ciudad) VALUES
  ('900.123.456-7', 'Empresa X S.A.S.',              'Bogotá'),
  ('800.456.789-1', 'Suministros Globales Ltda.',     'Medellín'),
  ('700.234.567-8', 'Servicios de Limpieza S.A.S.',   'Cali'),
  ('901.345.678-2', 'Consultores Tech Colombia S.A.', 'Bogotá'),
  ('600.567.890-3', 'Papelería Central S.A.S.',       'Barranquilla')
ON CONFLICT (nit) DO NOTHING;

-- ============================================================
-- TABLA PRINCIPAL: facturas_procesadas (21 columnas exactas)
-- ============================================================
CREATE TABLE IF NOT EXISTS facturas_procesadas (

    -- Identificación
    id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    consecutivo         INTEGER NOT NULL,
    id_unico            TEXT UNIQUE NOT NULL,

    -- Datos del Proveedor
    nit_proveedor       TEXT NOT NULL,
    nombre_proveedor    TEXT NOT NULL,

    -- Datos de la Factura
    numero_factura      TEXT NOT NULL,
    fecha_emision       DATE NOT NULL,
    fecha_vencimiento   DATE,
    cufe                TEXT,

    -- Valores Financieros
    valor_base          NUMERIC(15,2) NOT NULL,
    iva                 NUMERIC(15,2) DEFAULT 0,
    valor_total         NUMERIC(15,2) NOT NULL,

    -- Contenido
    descripcion_items   TEXT,

    -- Clasificación
    tipo_archivo        TEXT,
    es_proforma         BOOLEAN DEFAULT FALSE,

    -- ERP
    orden_compra        CHARACTER VARYING(20),
    entrada_servicio    CHARACTER VARYING(20),

    -- Estado
    estado              TEXT DEFAULT 'PENDIENTE',
    observaciones       TEXT,

    -- Auditoría
    fecha_registro      DATE DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),

    -- Restricciones
    CONSTRAINT uq_factura_proveedor UNIQUE (numero_factura, nit_proveedor),
    CONSTRAINT chk_estado CHECK (estado IN ('PENDIENTE','EN_REVISION','PROCESADA','RECHAZADA')),
    CONSTRAINT chk_valor_total CHECK (valor_total >= 0),
    CONSTRAINT chk_iva CHECK (iva >= 0),
    CONSTRAINT chk_tipo_archivo CHECK (tipo_archivo IN ('pdf','xml','jpeg','png') OR tipo_archivo IS NULL)
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_fp_estado         ON facturas_procesadas(estado);
CREATE INDEX IF NOT EXISTS idx_fp_fecha_registro ON facturas_procesadas(fecha_registro DESC);
CREATE INDEX IF NOT EXISTS idx_fp_nit_proveedor  ON facturas_procesadas(nit_proveedor);
CREATE INDEX IF NOT EXISTS idx_fp_numero_factura ON facturas_procesadas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_fp_created_at     ON facturas_procesadas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fp_orden_compra   ON facturas_procesadas(orden_compra) WHERE orden_compra IS NOT NULL;

-- ── Secuencia para consecutivo ──────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS seq_consecutivo_factura START 1;

-- ── Trigger: auto consecutivo + id_unico ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_consecutivo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.consecutivo := nextval('seq_consecutivo_factura');
    NEW.id_unico    := 'BILLE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.consecutivo::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_consecutivo ON facturas_procesadas;
CREATE TRIGGER trg_set_consecutivo
BEFORE INSERT ON facturas_procesadas
FOR EACH ROW EXECUTE FUNCTION fn_set_consecutivo();

-- ── Datos de prueba ──────────────────────────────────────────────────────────
INSERT INTO facturas_procesadas
    (nit_proveedor, nombre_proveedor, numero_factura, fecha_emision, fecha_vencimiento,
     valor_base, iva, valor_total, tipo_archivo, estado, observaciones, orden_compra, entrada_servicio)
VALUES
  ('900.123.456-7', 'Empresa X S.A.S.',              'FV-2024-001', '2024-01-15', '2024-02-15', 1260504.00, 239496.00, 1500000.00, 'pdf',  'PENDIENTE',   NULL,                    'OC-001', 'ES-001'),
  ('800.456.789-1', 'Suministros Globales Ltda.',     'FE-89234',    '2024-01-16', '2024-02-16', 2722689.00, 517311.00, 3240000.00, 'xml',  'PROCESADA',   NULL,                    'OC-002', NULL),
  ('700.234.567-8', 'Servicios de Limpieza S.A.S.',   'A-4592',      '2024-01-17', '2024-02-17',  714286.00, 135714.00,  850000.00, 'jpeg', 'RECHAZADA',   'Factura ilegible',      NULL,     NULL),
  ('901.345.678-2', 'Consultores Tech Colombia S.A.', 'FV-2024-008', '2024-01-18', '2024-02-18', 4201681.00, 798319.00, 5000000.00, 'pdf',  'EN_REVISION', 'Revisión de valores',   'OC-004', 'ES-004'),
  ('600.567.890-3', 'Papelería Central S.A.S.',       'B-9912',      '2024-01-19', '2024-02-19',  100840.00,  19160.00,  120000.00, 'pdf',  'PROCESADA',   NULL,                    'OC-005', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLA: facturas_archivos
-- ============================================================
CREATE TABLE IF NOT EXISTS facturas_archivos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id   INT NOT NULL REFERENCES facturas_procesadas(id) ON DELETE CASCADE,
    origen_id    INT REFERENCES origenes_factura(id),
    file_name    VARCHAR(300) NOT NULL,
    file_path    TEXT NOT NULL,
    file_type    VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf','xml','jpeg','png')),
    file_size_kb INT,
    mime_type    VARCHAR(100),
    checksum     VARCHAR(64),
    uploaded_at  TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by  UUID REFERENCES users(id),
    is_primary   BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_fa_factura ON facturas_archivos(factura_id);

-- ============================================================
-- TABLA: ai_extracciones
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_extracciones (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id        INT NOT NULL REFERENCES facturas_procesadas(id) ON DELETE CASCADE,
    archivo_id        UUID REFERENCES facturas_archivos(id),
    datos_extraidos   JSONB,
    confianza_global  NUMERIC(5,2),
    campos_a_revisar  INT DEFAULT 0,
    modelo_usado      VARCHAR(100),
    tiempo_proceso_ms INT,
    estado_proceso    VARCHAR(50) CHECK (estado_proceso IN ('SUCCESS','PARTIAL','FAILED')),
    detalle_error     TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: ai_campos_detalle
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_campos_detalle (
    id                 SERIAL PRIMARY KEY,
    extraccion_id      UUID NOT NULL REFERENCES ai_extracciones(id) ON DELETE CASCADE,
    nombre_campo       VARCHAR(100) NOT NULL,
    valor_bruto        TEXT,
    valor_normalizado  TEXT,
    confianza          NUMERIC(5,2),
    fue_corregido      BOOLEAN DEFAULT FALSE,
    valor_corregido    TEXT,
    corregido_por      UUID REFERENCES users(id),
    corregido_at       TIMESTAMPTZ
);

-- ============================================================
-- TABLA: audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    accion      VARCHAR(100) NOT NULL,
    entidad     VARCHAR(100),
    entidad_id  TEXT,
    valor_prev  JSONB,
    valor_nuevo JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_accion  ON audit_log(accion, created_at DESC);

-- ── Trigger: auto-audit en facturas_procesadas ───────────────────────────────
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

DROP TRIGGER IF EXISTS trg_audit_facturas ON facturas_procesadas;
CREATE TRIGGER trg_audit_facturas
AFTER UPDATE ON facturas_procesadas
FOR EACH ROW EXECUTE FUNCTION fn_audit_facturas();

-- ============================================================
-- VISTAS ÚTILES PARA EL DASHBOARD
-- ============================================================

-- Vista: KPIs del día
CREATE OR REPLACE VIEW v_kpis_hoy AS
SELECT
    COUNT(*)                                       AS total_hoy,
    COUNT(*) FILTER (WHERE estado = 'PENDIENTE')   AS pendientes,
    COUNT(*) FILTER (WHERE estado = 'PROCESADA')   AS procesadas,
    COUNT(*) FILTER (WHERE estado = 'RECHAZADA')   AS rechazadas,
    COUNT(*) FILTER (WHERE estado = 'EN_REVISION') AS en_revision,
    SUM(valor_total)                               AS valor_total_hoy
FROM facturas_procesadas
WHERE fecha_registro = CURRENT_DATE;

-- Vista: Tendencia diaria (último mes)
CREATE OR REPLACE VIEW v_tendencia_mensual AS
SELECT
    fecha_registro AS dia,
    COUNT(*)       AS total_facturas,
    SUM(valor_total) AS valor_total
FROM facturas_procesadas
WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY fecha_registro
ORDER BY fecha_registro;

-- Vista: Distribución por estado
CREATE OR REPLACE VIEW v_distribucion_estado AS
SELECT
    estado,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2) AS porcentaje
FROM facturas_procesadas
GROUP BY estado;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — opcional para producción
-- ============================================================
-- ALTER TABLE facturas_procesadas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY rls_facturas ON facturas_procesadas
--     USING (current_setting('app.role', TRUE) = 'admin'
--            OR current_setting('app.role', TRUE) IN ('operador','auditor','visor'));

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
DO $$
DECLARE
    col_count INT;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'facturas_procesadas'
      AND table_schema = 'public';

    IF col_count = 21 THEN
        RAISE NOTICE '✅ facturas_procesadas tiene exactamente 21 columnas.';
    ELSE
        RAISE WARNING '⚠️  facturas_procesadas tiene % columnas (esperadas: 21).', col_count;
    END IF;
END $$;

-- Reporte de tablas creadas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
