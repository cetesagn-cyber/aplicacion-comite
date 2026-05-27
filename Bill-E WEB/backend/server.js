require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { Pool } = require('pg');
const { setupUsersTable, seedUsers, login, requireAuth } = require('./auth');
const { extractDocument } = require('./extractor');

// ── Directorios de archivos ───────────────────────────────────────────────────
const DESCARGAS_DIR       = path.join('C:\\', 'Developer', 'Bill-E WEB', 'Descargas BIll-e');
const EVIDENCIA_DIR       = path.join(__dirname, 'uploads', 'evidencias');
if (!fs.existsSync(DESCARGAS_DIR))       fs.mkdirSync(DESCARGAS_DIR,       { recursive: true });
if (!fs.existsSync(EVIDENCIA_DIR))       fs.mkdirSync(EVIDENCIA_DIR,       { recursive: true });

// ── Multer facturas (memoria) ─────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'text/xml', 'application/xml'];
    cb(null, allowed.includes(file.mimetype) || file.originalname.endsWith('.xml'));
  },
});

// ── Multer evidencias (solo imágenes, máx 5 MB) ───────────────────────────────
const uploadEvidencia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Conexión PostgreSQL ───────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  options:  '-c client_encoding=UTF8',
  max:      3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

async function setupAuditTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id          BIGSERIAL PRIMARY KEY,
      user_id     INT,
      user_email  VARCHAR(255),
      user_name   VARCHAR(200),
      accion      VARCHAR(50)  NOT NULL,
      entidad     VARCHAR(100) NOT NULL DEFAULT 'facturas_procesadas',
      entidad_id  TEXT,
      valor_prev  JSONB,
      valor_nuevo JSONB,
      ip_address  TEXT,
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_log(created_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_log(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_entidad   ON audit_log(entidad_id)`);
  console.log('✅ Tabla audit_log verificada');
}

async function logAudit(pool, req, accion, entidadId, valorPrev = null, valorNuevo = null) {
  try {
    const u = req.user || null;
    await pool.query(
      `INSERT INTO audit_log (user_id, user_email, user_name, accion, entidad_id, valor_prev, valor_nuevo, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        u?.id    || null,
        u?.email || null,
        u?.full_name || null,
        accion,
        String(entidadId),
        valorPrev  ? JSON.stringify(valorPrev)  : null,
        valorNuevo ? JSON.stringify(valorNuevo) : null,
        req.ip || req.headers['x-forwarded-for'] || null,
      ]
    );
  } catch (e) { console.warn('⚠️  audit error:', e.message); }
}

async function setupFilesTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS facturas_archivos (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      factura_id   INT  NOT NULL REFERENCES facturas_procesadas(id) ON DELETE CASCADE,
      file_name    VARCHAR(300) NOT NULL,
      file_path    TEXT NOT NULL,
      file_type    VARCHAR(10)  NOT NULL,
      file_size_kb INT,
      mime_type    VARCHAR(100),
      uploaded_at  TIMESTAMPTZ  DEFAULT NOW(),
      is_primary   BOOLEAN      DEFAULT TRUE
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_fa_factura ON facturas_archivos(factura_id)`);
  // Migraciones: agregar columnas si no existen
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS entregado VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS radicado_x VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS area VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS contabilizado_por VARCHAR(100)`);
  // Nuevas columnas operativas
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS ampliacion_observacion TEXT`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS motivo_demora TEXT`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS rechazado VARCHAR(10)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS fecha_contabilizado DATE`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS doc_contable VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS dias NUMERIC(8,1)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS fecha_entrega_tesoreria DATE`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS fecha_de_dev_a_recepcion DATE`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS motivo_devolucion TEXT`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS fecha_envio_rechazo_recepcion_al_cliente DATE`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS dias_rechazo_recepcion_vs_asignacion NUMERIC(8,1)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS acuse_recibido_dian VARCHAR(10)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS recibo_de_mercancia VARCHAR(10)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS aceptacion_o_rechazo VARCHAR(20)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS forma_de_pago VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS tipo_de_factura VARCHAR(100)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS tiempo_promedio NUMERIC(8,1)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS tiempo_real NUMERIC(8,1)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS evidencia_aceptacion_url TEXT`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS alerta_radicado VARCHAR(20)`);
  await pool.query(`ALTER TABLE facturas_procesadas ADD COLUMN IF NOT EXISTS tipo_moneda VARCHAR(10) DEFAULT 'COP'`);
  await pool.query(`UPDATE facturas_procesadas SET tipo_moneda = 'COP' WHERE tipo_moneda IS NULL`);
  // Migración: convertir fecha_entrega_tesoreria de DATE a VARCHAR para admitir texto libre
  await pool.query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'facturas_procesadas'
          AND column_name = 'fecha_entrega_tesoreria'
          AND data_type = 'date'
      ) THEN
        ALTER TABLE facturas_procesadas
          ALTER COLUMN fecha_entrega_tesoreria TYPE VARCHAR(200) USING fecha_entrega_tesoreria::TEXT;
      END IF;
    END $$;
  `);
  console.log('✅ Tabla facturas_archivos verificada');
  console.log('✅ Todas las columnas operativas verificadas');
}

// ── Función PL/pgSQL: centraliza toda la lógica de alerta_radicado ───────────
// Reglas:
//   · PROCESADA / RECHAZADA                 → 'A tiempo' (siempre)
//   · PENDIENTE / EN_REVISION               → días hábiles desde fecha efectiva
//       • Si la hora de registro > 17:00    → fecha efectiva = siguiente día hábil
//       • Días hábiles 1-3                  → 'A tiempo'
//       • Días hábiles 4-6                  → 'Demorado'
//       • Días hábiles ≥ 7                  → 'Alerta'
async function setupAlertaFunction(pool) {
  await pool.query(`
    CREATE OR REPLACE FUNCTION calc_alerta_radicado(
      p_estado     VARCHAR,
      p_created_at TIMESTAMPTZ
    ) RETURNS VARCHAR AS $$
    DECLARE
      eff_date DATE;
      dow      INT;
      bdays    INT;
    BEGIN
      -- Procesada o Rechazada → siempre A tiempo
      IF p_estado IN ('PROCESADA', 'RECHAZADA') THEN
        RETURN 'A tiempo';
      END IF;

      -- Solo aplica para Pendiente o En Revisión con timestamp válido
      IF p_estado NOT IN ('PENDIENTE', 'EN_REVISION') OR p_created_at IS NULL THEN
        RETURN NULL;
      END IF;

      -- Fecha efectiva de radicado (hora en Colombia UTC-5)
      IF EXTRACT(HOUR FROM (p_created_at AT TIME ZONE 'America/Bogota')) >= 17 THEN
        dow := EXTRACT(ISODOW FROM (p_created_at AT TIME ZONE 'America/Bogota'))::int;
        eff_date := (p_created_at AT TIME ZONE 'America/Bogota')::date +
          CASE dow
            WHEN 5 THEN 3   -- Viernes → Lunes
            WHEN 6 THEN 2   -- Sábado  → Lunes
            WHEN 7 THEN 1   -- Domingo → Lunes
            ELSE            1 -- Lun-Jue → día siguiente
          END;
      ELSE
        eff_date := (p_created_at AT TIME ZONE 'America/Bogota')::date;
      END IF;

      -- Si la fecha efectiva es hoy o futura no hay alerta todavía
      IF CURRENT_DATE <= eff_date THEN
        RETURN NULL;
      END IF;

      -- Contar días hábiles (lun-vie) entre eff_date+1 y CURRENT_DATE inclusive
      SELECT COUNT(*)::int INTO bdays
      FROM generate_series(eff_date + 1, CURRENT_DATE, '1 day') AS d
      WHERE EXTRACT(isodow FROM d) <= 5;

      RETURN CASE
        WHEN bdays BETWEEN 1 AND 3 THEN 'A tiempo'
        WHEN bdays BETWEEN 4 AND 6 THEN 'Demorado'
        WHEN bdays >= 7             THEN 'Alerta'
        ELSE 'A tiempo'
      END;
    END;
    $$ LANGUAGE plpgsql STABLE;
  `);
  console.log('✅ Función calc_alerta_radicado creada/actualizada');
}

// ── Recalcula alerta_radicado para TODOS los registros ────────────────────────
async function refreshAlertaRadicado(pool) {
  await pool.query(`
    UPDATE facturas_procesadas
    SET alerta_radicado = calc_alerta_radicado(estado, created_at)
  `);
  console.log('✅ alerta_radicado recalculado para todos los registros');
}

pool.connect()
  .then(async c => {
    console.log('✅ PostgreSQL conectado');
    c.release();
    await setupUsersTable(pool);
    await seedUsers(pool);
    await setupFilesTable(pool);
    await setupAuditTable(pool);
    await setupAlertaFunction(pool);
    await refreshAlertaRadicado(pool);
  })
  .catch(e => console.error('❌ Error conectando a PostgreSQL:', e.message));

// ── Middleware: auth opcional (captura usuario si hay token, no bloquea) ───────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'billee_cetesa_jwt_secret_2026_secure';
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}
app.use(optionalAuth);

// ── Servir archivos subidos ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Servir frontend compilado (producción) ───────────────────────────────────
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const result = await login(pool, email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/auth/change-password ───────────────────────────────────────────
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Clave actual y nueva clave son requeridas' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'La nueva clave debe tener al menos 6 caracteres' });

    const { rows } = await pool.query(
      'SELECT password_hash FROM billee_users WHERE id = $1 AND is_active = TRUE',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'La clave actual es incorrecta' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE billee_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );
    res.json({ message: 'Clave actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_REVISION', 'PROCESADA', 'RECHAZADA'];

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/facturas
//   ?search=texto   — busca en numero_factura, nombre_proveedor, nit_proveedor
//   ?estado=...     — filtra por estado
//   ?page=1&limit=10
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/facturas', async (req, res) => {
  try {
    const {
      search = '', estado = '', page = '1', limit = '10',
      col_numero_factura = '', col_nombre_proveedor = '', col_nit_proveedor = '',
      col_tipo_archivo = '', col_fecha_desde = '', col_fecha_hasta = '',
      col_valor_min = '', col_valor_max = '',
      col_area = '', col_entregado = '', col_radicado_x = '',
      col_contabilizado_por = '', col_motivo_demora = '', col_alerta_radicado = '',
      col_forma_de_pago = '', col_orden_compra = '', col_doc_contable = '',
      col_motivo_devolucion = '',
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    // Búsqueda global (numero_factura, proveedor, nit al mismo tiempo)
    if (search) {
      conditions.push(`(numero_factura ILIKE $${idx} OR nombre_proveedor ILIKE $${idx} OR nit_proveedor ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (estado && ESTADOS_VALIDOS.includes(estado)) {
      conditions.push(`estado = $${idx}`);
      params.push(estado);
      idx++;
    }

    // Filtros por columna individuales
    if (col_numero_factura) {
      conditions.push(`numero_factura ILIKE $${idx}`);
      params.push(`%${col_numero_factura}%`);
      idx++;
    }
    if (col_nombre_proveedor) {
      conditions.push(`nombre_proveedor ILIKE $${idx}`);
      params.push(`%${col_nombre_proveedor}%`);
      idx++;
    }
    if (col_nit_proveedor) {
      conditions.push(`nit_proveedor ILIKE $${idx}`);
      params.push(`%${col_nit_proveedor}%`);
      idx++;
    }
    if (col_tipo_archivo) {
      conditions.push(`tipo_archivo ILIKE $${idx}`);
      params.push(`%${col_tipo_archivo}%`);
      idx++;
    }
    if (col_fecha_desde) {
      conditions.push(`fecha_emision >= $${idx}`);
      params.push(col_fecha_desde);
      idx++;
    }
    if (col_fecha_hasta) {
      conditions.push(`fecha_emision <= $${idx}`);
      params.push(col_fecha_hasta);
      idx++;
    }
    if (col_valor_min) {
      conditions.push(`valor_total >= $${idx}`);
      params.push(parseFloat(col_valor_min));
      idx++;
    }
    if (col_valor_max) {
      conditions.push(`valor_total <= $${idx}`);
      params.push(parseFloat(col_valor_max));
      idx++;
    }
    if (col_area) {
      conditions.push(`area = $${idx}`);
      params.push(col_area); idx++;
    }
    if (col_entregado) {
      conditions.push(`entregado = $${idx}`);
      params.push(col_entregado); idx++;
    }
    if (col_radicado_x) {
      conditions.push(`radicado_x = $${idx}`);
      params.push(col_radicado_x); idx++;
    }
    if (col_contabilizado_por) {
      conditions.push(`contabilizado_por = $${idx}`);
      params.push(col_contabilizado_por); idx++;
    }
    if (col_motivo_demora) {
      conditions.push(`motivo_demora = $${idx}`);
      params.push(col_motivo_demora); idx++;
    }
    if (col_alerta_radicado) {
      conditions.push(`alerta_radicado = $${idx}`);
      params.push(col_alerta_radicado); idx++;
    }
    if (col_forma_de_pago) {
      conditions.push(`forma_de_pago = $${idx}`);
      params.push(col_forma_de_pago); idx++;
    }
    if (col_orden_compra) {
      conditions.push(`orden_compra ILIKE $${idx}`);
      params.push(`%${col_orden_compra}%`); idx++;
    }
    if (col_doc_contable) {
      conditions.push(`doc_contable ILIKE $${idx}`);
      params.push(`%${col_doc_contable}%`); idx++;
    }
    if (col_motivo_devolucion) {
      conditions.push(`motivo_devolucion = $${idx}`);
      params.push(col_motivo_devolucion); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM facturas_procesadas ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT
         id, consecutivo, id_unico,
         nit_proveedor, nombre_proveedor,
         numero_factura,
         fecha_emision,
         calc_alerta_radicado(estado, created_at) AS alerta_radicado,
         fecha_vencimiento, cufe,
         valor_base, iva, valor_total, tipo_moneda,
         ampliacion_observacion, motivo_demora, rechazado,
         fecha_contabilizado, doc_contable, dias,
         fecha_entrega_tesoreria, fecha_de_dev_a_recepcion, motivo_devolucion,
         fecha_envio_rechazo_recepcion_al_cliente, dias_rechazo_recepcion_vs_asignacion,
         acuse_recibido_dian, recibo_de_mercancia, aceptacion_o_rechazo,
         forma_de_pago, tipo_de_factura, tiempo_promedio, tiempo_real,
         evidencia_aceptacion_url,
         descripcion_items, tipo_archivo, es_proforma,
         orden_compra, entrada_servicio,
         estado, observaciones, entregado, radicado_x, area, contabilizado_por,
         fecha_registro, created_at
       FROM facturas_procesadas
       ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data:       dataResult.rows,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/facturas/:id
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/facturas/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM facturas_procesadas WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/facturas  — crear nueva factura (radicación manual + archivo)
// Acepta multipart/form-data (con archivo) o application/json (sin archivo)
// ═════════════════════════════════════════════════════════════════════════════
app.post('/api/facturas', upload.single('archivo'), async (req, res) => {
  try {
    const body = req.body;
    const {
      nit_proveedor, nombre_proveedor,
      numero_factura, fecha_emision, fecha_vencimiento, cufe,
      valor_base, iva, valor_total,
      descripcion_items, tipo_archivo,
      orden_compra, entrada_servicio,
      observaciones,
    } = body;

    // Detectar tipo de archivo desde el campo o desde el archivo subido
    let tipoFinal = tipo_archivo || null;
    if (req.file && !tipoFinal) {
      const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
      tipoFinal = ext === 'jpg' ? 'jpeg' : ext;
    }

    const { rows } = await pool.query(
      `INSERT INTO facturas_procesadas
         (nit_proveedor, nombre_proveedor,
          numero_factura, fecha_emision, fecha_vencimiento, cufe,
          valor_base, iva, valor_total,
          descripcion_items, tipo_archivo,
          orden_compra, entrada_servicio,
          observaciones, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'PENDIENTE')
       RETURNING *`,
      [
        nit_proveedor, nombre_proveedor,
        numero_factura, fecha_emision || null, fecha_vencimiento || null, cufe || null,
        parseFloat(valor_base) || 0, parseFloat(iva) || 0, parseFloat(valor_total) || 0,
        descripcion_items || null, tipoFinal,
        orden_compra || null, entrada_servicio || null,
        observaciones || null,
      ]
    );

    const factura = rows[0];

    // ── Guardar archivo en directorio local de descargas ───────────────────
    if (req.file) {
      const ext      = path.extname(req.file.originalname).toLowerCase();
      const ts = new Date().toISOString().slice(0, 16).replace(/\D/g, '').replace(/^(.{8})/, '$1-');
      const fileName = `${ts}_${factura.numero_factura || factura.id_unico}${ext}`;
      const filePath = path.join(DESCARGAS_DIR, fileName);
      
      try {
        fs.writeFileSync(filePath, req.file.buffer);
        factura.copia_radicacion = filePath;
        console.log(`✅ Archivo guardado: ${filePath}`);
      } catch (e) {
        console.warn('⚠️  Error guardando archivo en descargas:', e.message);
        factura.copia_radicacion = null;
        // No bloquear radicación por error en guardado
      }

      const relativePath = `facturas/${fileName}`;
      const fileType     = (ext.slice(1) === 'jpg' ? 'jpeg' : ext.slice(1));
      const fileSizeKb   = Math.round(req.file.size / 1024);

      await pool.query(
        `INSERT INTO facturas_archivos
           (factura_id, file_name, file_path, file_type, file_size_kb, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [factura.id, fileName, relativePath, fileType, fileSizeKb, req.file.mimetype]
      );

      // ── Extracción automática de campos ─────────────────────────────────
      try {
        const extraccion = await extractDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
        factura.extraccion = extraccion;

        // Actualizar campos extraídos que el usuario no llenó manualmente
        const c = extraccion.campos;
        const autoUpdates = {};
        if (!nit_proveedor     && c.nit_proveedor)     autoUpdates.nit_proveedor     = c.nit_proveedor;
        if (!nombre_proveedor  && c.nombre_proveedor)  autoUpdates.nombre_proveedor  = c.nombre_proveedor;
        if (!numero_factura    && c.numero_factura)    autoUpdates.numero_factura    = c.numero_factura;
        if (!fecha_emision     && c.fecha_emision)     autoUpdates.fecha_emision     = c.fecha_emision;
        if (!fecha_vencimiento && c.fecha_vencimiento) autoUpdates.fecha_vencimiento = c.fecha_vencimiento;
        if (!cufe              && c.cufe)              autoUpdates.cufe              = c.cufe;
        if (!valor_base        && c.valor_base)        autoUpdates.valor_base        = c.valor_base;
        if (!iva               && c.iva)               autoUpdates.iva               = c.iva;
        if (!valor_total       && c.valor_total)       autoUpdates.valor_total       = c.valor_total;
        if (!orden_compra      && c.orden_compra)      autoUpdates.orden_compra      = c.orden_compra;
        if (c.es_proforma)                             autoUpdates.es_proforma       = c.es_proforma;

        if (Object.keys(autoUpdates).length) {
          const sets   = Object.keys(autoUpdates).map((k, i) => `${k} = $${i + 1}`).join(', ');
          const vals   = Object.values(autoUpdates);
          const { rows: updated } = await pool.query(
            `UPDATE facturas_procesadas SET ${sets} WHERE id = $${vals.length + 1} RETURNING *`,
            [...vals, factura.id]
          );
          if (updated.length) Object.assign(factura, updated[0]);
        }
      } catch (exErr) {
        console.warn('⚠️  Extracción fallida (no crítico):', exErr.message);
      }
    }

    await logAudit(pool, req, 'INSERT', factura.id, null, factura);
    res.status(201).json(factura);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una factura con ese número para este proveedor.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// PATCH /api/facturas/:id  — actualizar campos
// ═════════════════════════════════════════════════════════════════════════════
app.patch('/api/facturas/:id', async (req, res) => {
  try {
    const allowed = [
      'nit_proveedor','nombre_proveedor','numero_factura',
      'fecha_emision','fecha_vencimiento','cufe',
      'valor_base','iva','valor_total',
      'descripcion_items','tipo_archivo',
      'orden_compra','entrada_servicio',
      'estado','observaciones','entregado','area','contabilizado_por',
      'ampliacion_observacion','motivo_demora','rechazado',
      'fecha_contabilizado','doc_contable','dias',
      'fecha_entrega_tesoreria','fecha_de_dev_a_recepcion','motivo_devolucion',
      'fecha_envio_rechazo_recepcion_al_cliente','dias_rechazo_recepcion_vs_asignacion',
      'acuse_recibido_dian','recibo_de_mercancia','aceptacion_o_rechazo',
      'forma_de_pago','tipo_de_factura','tiempo_promedio','tiempo_real',
      'tipo_moneda',
    ];

    const updates = Object.entries(req.body)
      .filter(([k]) => allowed.includes(k));

    if (!updates.length) return res.status(400).json({ error: 'Sin campos para actualizar' });

    if (req.body.estado && !ESTADOS_VALIDOS.includes(req.body.estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const setClauses = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values     = updates.map(([, v]) => v);

    const { rows } = await pool.query(
      `UPDATE facturas_procesadas
       SET ${setClauses}
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Factura no encontrada' });

    // Recalcular alerta_radicado si cambió el estado
    if ('estado' in req.body) {
      await pool.query(
        `UPDATE facturas_procesadas
         SET alerta_radicado = calc_alerta_radicado(estado, created_at)
         WHERE id = $1`,
        [req.params.id]
      );
    }

    await logAudit(pool, req, 'UPDATE', req.params.id, null, req.body);
    const { rows: updated } = await pool.query('SELECT * FROM facturas_procesadas WHERE id = $1', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /api/facturas/:id
// ═════════════════════════════════════════════════════════════════════════════
app.delete('/api/facturas/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM facturas_procesadas WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Factura no encontrada' });
    await logAudit(pool, req, 'DELETE', req.params.id, null, null);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/audit  — registros de auditoría
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/audit', requireAuth, async (req, res) => {
  try {
    const { page = '1', limit = '20', accion = '', user_email = '', entidad_id = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = []; const params = [];
    let idx = 1;
    if (accion)      { conditions.push(`accion = $${idx++}`);              params.push(accion); }
    if (user_email)  { conditions.push(`user_email ILIKE $${idx++}`);      params.push(`%${user_email}%`); }
    if (entidad_id)  { conditions.push(`entidad_id = $${idx++}`);          params.push(entidad_id); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM audit_log ${where}`, params),
      pool.query(
        `SELECT id, user_id, user_email, user_name, accion, entidad, entidad_id,
                valor_prev, valor_nuevo, ip_address, created_at
         FROM audit_log ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, parseInt(limit), offset]
      ),
    ]);
    res.json({
      data:       dataRes.rows,
      total:      parseInt(countRes.rows[0].count),
      page:       parseInt(page),
      totalPages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit)),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/metrics  — KPIs para el dashboard
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE estado = 'PENDIENTE')     AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'PROCESADA')     AS procesadas,
        COUNT(*) FILTER (WHERE estado = 'RECHAZADA')     AS rechazadas,
        COUNT(*) FILTER (WHERE estado = 'EN_REVISION')   AS en_revision,
        -- Mes actual vs mes anterior
        COUNT(*) FILTER (WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE))                                                 AS total_mes_actual,
        COUNT(*) FILTER (WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                           AND fecha_registro <  DATE_TRUNC('month', CURRENT_DATE))                                                 AS total_mes_anterior
      FROM facturas_procesadas
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/tendencia  — radicaciones por día (mes actual + anterior)
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/dashboard/tendencia', async (req, res) => {
  try {
    const [actualRes, anteriorRes] = await Promise.all([
      pool.query(`
        SELECT fecha_registro::text AS dia, COUNT(*) AS total
        FROM facturas_procesadas
        WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY fecha_registro ORDER BY fecha_registro
      `),
      pool.query(`
        SELECT fecha_registro::text AS dia, COUNT(*) AS total
        FROM facturas_procesadas
        WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND fecha_registro <  DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY fecha_registro ORDER BY fecha_registro
      `),
    ]);
    res.json({
      actual:   actualRes.rows.map(r => ({ dia: r.dia, total: Number(r.total) })),
      anterior: anteriorRes.rows.map(r => ({ dia: r.dia, total: Number(r.total) })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS (solo admin)
// ═════════════════════════════════════════════════════════════════════════════
const bcrypt = require('bcryptjs');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acceso restringido a administradores' });
  next();
}

// GET /api/users
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM billee_users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users
app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name || !role)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    const ROLES = ['admin', 'operador', 'auditor', 'visor'];
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO billee_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, is_active, created_at`,
      [email.toLowerCase().trim(), hash, full_name, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

const PROTECTED_EMAIL = 'adminbille@cetesa.com.co';

// PATCH /api/users/:id
app.patch('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { full_name, role, is_active, password } = req.body;
    const ROLES = ['admin', 'operador', 'auditor', 'visor'];
    if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido' });

    // Proteger al admin del sistema — no se puede cambiar su clave
    if (password) {
      const target = await pool.query('SELECT email FROM billee_users WHERE id = $1', [req.params.id]);
      if (target.rows[0]?.email === PROTECTED_EMAIL)
        return res.status(403).json({ error: 'No se puede modificar la clave de este usuario' });
    }

    const sets = []; const vals = [];
    if (full_name  !== undefined) { sets.push(`full_name = $${vals.length+1}`);      vals.push(full_name); }
    if (role       !== undefined) { sets.push(`role = $${vals.length+1}`);            vals.push(role); }
    if (is_active  !== undefined) { sets.push(`is_active = $${vals.length+1}`);       vals.push(is_active); }
    if (password)                 { const h = await bcrypt.hash(password, 12);
                                    sets.push(`password_hash = $${vals.length+1}`);   vals.push(h); }
    if (!sets.length) return res.status(400).json({ error: 'Sin cambios' });

    const { rows } = await pool.query(
      `UPDATE billee_users SET ${sets.join(', ')}
       WHERE id = $${vals.length+1}
       RETURNING id, email, full_name, role, is_active, created_at`,
      [...vals, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    // No permitir que el admin se elimine a sí mismo
    if (String(req.user.id) === String(req.params.id))
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    const { rowCount } = await pool.query('DELETE FROM billee_users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/reportes/rechazadas-por-proveedor
// Top proveedores con más facturas rechazadas
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/reportes/rechazadas-por-proveedor', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const { rows } = await pool.query(`
      SELECT
        nombre_proveedor,
        nit_proveedor,
        COUNT(*) AS rechazadas
      FROM facturas_procesadas
      WHERE estado = 'RECHAZADA'
      GROUP BY nombre_proveedor, nit_proveedor
      ORDER BY rechazadas DESC
      LIMIT $1
    `, [limit]);
    res.json(rows.map(r => ({ ...r, rechazadas: Number(r.rechazadas) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/facturas/:id/evidencia  — sube imagen de evidencia aceptación/rechazo
// ═════════════════════════════════════════════════════════════════════════════
app.post('/api/facturas/:id/evidencia', uploadEvidencia.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Se requiere una imagen (jpg, png, webp)' });
  try {
    const { rows } = await pool.query('SELECT id_unico FROM facturas_procesadas WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Factura no encontrada' });

    const ext      = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const fileName = `evidencia_${rows[0].id_unico}${ext}`;
    const filePath = path.join(EVIDENCIA_DIR, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const url = `evidencias/${fileName}`;
    await pool.query('UPDATE facturas_procesadas SET evidencia_aceptacion_url = $1 WHERE id = $2', [url, req.params.id]);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/facturas/:id/evidencia  — elimina imagen de evidencia
app.delete('/api/facturas/:id/evidencia', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT evidencia_aceptacion_url FROM facturas_procesadas WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Factura no encontrada' });
    const url = rows[0].evidencia_aceptacion_url;
    if (url) {
      const filePath = path.join(__dirname, 'uploads', url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('UPDATE facturas_procesadas SET evidencia_aceptacion_url = NULL WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/extract  — extrae campos de un documento sin crear factura
//   Body: multipart/form-data con campo "archivo"
// ═════════════════════════════════════════════════════════════════════════════
app.post('/api/extract', upload.single('archivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Se requiere un archivo' });
  try {
    const resultado = await extractDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/reportes/demoras-por-area
// Días promedio de demora (fecha_registro → hoy) agrupado por área
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/reportes/demoras-por-area', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(area), ''), 'Sin área')          AS area,
        COUNT(*)                                               AS total,
        COUNT(*) FILTER (WHERE estado = 'PENDIENTE')          AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'EN_REVISION')        AS en_revision,
        COUNT(*) FILTER (WHERE estado = 'PROCESADA')          AS procesadas,
        COUNT(*) FILTER (WHERE estado = 'RECHAZADA')          AS rechazadas,
        ROUND(AVG(CURRENT_DATE - fecha_registro), 1)          AS avg_dias,
        MAX(CURRENT_DATE - fecha_registro)                     AS max_dias,
        ROUND(AVG(CURRENT_DATE - fecha_registro)
          FILTER (WHERE estado NOT IN ('PROCESADA','RECHAZADA')), 1) AS avg_dias_activas
      FROM facturas_procesadas
      WHERE fecha_registro IS NOT NULL
      GROUP BY COALESCE(NULLIF(TRIM(area), ''), 'Sin área')
      ORDER BY avg_dias DESC
    `);
    res.json(rows.map(r => ({
      area:             r.area,
      total:            Number(r.total),
      pendientes:       Number(r.pendientes),
      en_revision:      Number(r.en_revision),
      procesadas:       Number(r.procesadas),
      rechazadas:       Number(r.rechazadas),
      avg_dias:         Number(r.avg_dias)         || 0,
      max_dias:         Number(r.max_dias)         || 0,
      avg_dias_activas: Number(r.avg_dias_activas) || 0,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/por-area  — top radicaciones por área
// ═════════════════════════════════════════════════════════════════════════════
// GET /api/reportes/demoras-por-entregado
// Usuarios de la columna entregado con mayor demora frente a alerta de radicado
app.get('/api/reportes/demoras-por-entregado', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH base AS (
        SELECT
          COALESCE(NULLIF(TRIM(entregado), ''), 'Sin asignar') AS entregado,
          estado,
          alerta_radicado,
          CASE
            WHEN EXTRACT(HOUR FROM (created_at AT TIME ZONE 'America/Bogota')) >= 17 THEN
              (created_at AT TIME ZONE 'America/Bogota')::date +
              CASE EXTRACT(ISODOW FROM (created_at AT TIME ZONE 'America/Bogota'))::int
                WHEN 5 THEN 3
                WHEN 6 THEN 2
                WHEN 7 THEN 1
                ELSE 1
              END
            ELSE (created_at AT TIME ZONE 'America/Bogota')::date
          END AS fecha_efectiva
        FROM facturas_procesadas
        WHERE created_at IS NOT NULL
          AND NULLIF(TRIM(entregado), '') IS NOT NULL
      ),
      calculada AS (
        SELECT
          b.*,
          CASE
            WHEN CURRENT_DATE <= b.fecha_efectiva THEN 0
            ELSE (
              SELECT COUNT(*)::int
              FROM generate_series(b.fecha_efectiva + 1, CURRENT_DATE, '1 day') AS d
              WHERE EXTRACT(ISODOW FROM d) <= 5
            )
          END AS dias_habiles
        FROM base b
      )
      SELECT
        entregado,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE alerta_radicado = 'Alerta') AS alertas,
        COUNT(*) FILTER (WHERE alerta_radicado = 'Demorado') AS demoradas,
        COUNT(*) FILTER (WHERE alerta_radicado = 'A tiempo') AS a_tiempo,
        COUNT(*) FILTER (WHERE estado NOT IN ('PROCESADA','RECHAZADA')) AS activas,
        ROUND(AVG(dias_habiles) FILTER (WHERE alerta_radicado IN ('Demorado','Alerta')), 1) AS avg_dias_alerta,
        ROUND(AVG(dias_habiles), 1) AS avg_dias_general,
        MAX(dias_habiles) AS max_dias
      FROM calculada
      GROUP BY entregado
      HAVING COUNT(*) FILTER (WHERE alerta_radicado IN ('Demorado','Alerta')) > 0
      ORDER BY alertas DESC, avg_dias_alerta DESC NULLS LAST, demoradas DESC, total DESC
    `);

    res.json(rows.map(r => ({
      entregado:        r.entregado,
      total:            Number(r.total),
      alertas:          Number(r.alertas),
      demoradas:        Number(r.demoradas),
      a_tiempo:         Number(r.a_tiempo),
      activas:          Number(r.activas),
      avg_dias_alerta:  Number(r.avg_dias_alerta)  || 0,
      avg_dias_general: Number(r.avg_dias_general) || 0,
      max_dias:         Number(r.max_dias)         || 0,
      riesgo_total:     Number(r.alertas) + Number(r.demoradas),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/por-area', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    const { rows } = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(area), ''), 'Sin área') AS area,
        COUNT(*) AS total
      FROM facturas_procesadas
      GROUP BY COALESCE(NULLIF(TRIM(area), ''), 'Sin área')
      ORDER BY total DESC
      LIMIT $1
    `, [limit]);
    res.json(rows.map(r => ({ area: r.area, total: Number(r.total) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback SPA (React Router) ───────────────────────────────────────────────
if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// ── Arranque ──────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIp = 'localhost';
  for (const iface of Object.values(nets)) {
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) { localIp = net.address; break; }
    }
    if (localIp !== 'localhost') break;
  }
  console.log(`🚀 Bill-e corriendo en:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Red:     http://${localIp}:${PORT}`);
});
