const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET  || 'billee_secret';
const EXPIRY  = process.env.JWT_EXPIRY  || '8h';

// ── Crear tabla de usuarios si no existe ─────────────────────────────────────
async function setupUsersTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS billee_users (
      id              SERIAL PRIMARY KEY,
      email           VARCHAR(255) UNIQUE NOT NULL,
      password_hash   VARCHAR(255) NOT NULL,
      full_name       VARCHAR(200) NOT NULL,
      role            VARCHAR(50)  NOT NULL DEFAULT 'operador',
      is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
      last_login      TIMESTAMPTZ,
      failed_attempts INT          NOT NULL DEFAULT 0,
      locked_until    TIMESTAMPTZ,
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  // Migrar columnas faltantes si la tabla ya existía
  const migrations = [
    `ALTER TABLE billee_users ADD COLUMN IF NOT EXISTS last_login      TIMESTAMPTZ`,
    `ALTER TABLE billee_users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0`,
    `ALTER TABLE billee_users ADD COLUMN IF NOT EXISTS locked_until    TIMESTAMPTZ`,
    `ALTER TABLE billee_users ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  ];
  for (const sql of migrations) await pool.query(sql);
  console.log('✅ Tabla billee_users verificada');
}

// ── Seed: crear usuarios iniciales si no existen ─────────────────────────────
async function seedUsers(pool) {
  const users = [
    {
      email:     'admin@cetesa.com.co',
      password:  'Cetesa.2037',
      full_name: 'Administrador Bill-e',
      role:      'admin',
    },
    {
      email:     'gnino@cetesa.com.co',
      password:  'Cetesa.2030',
      full_name: 'G. Niño — Registro de Facturas',
      role:      'operador',
    },
    {
      email:     'jgalindo@cetesa.com.co',
      password:  'Cetesa.2030',
      full_name: 'J. Galindo',
      role:      'operador',
    },
    {
      email:     'recepcion@cetesa.com.co',
      password:  'Cetesa.2030',
      full_name: 'Recepcion CETESA',
      role:      'operador',
    },
  ];

  for (const u of users) {
    const existing = await pool.query(
      'SELECT id FROM billee_users WHERE email = $1',
      [u.email]
    );
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(u.password, 12);
      await pool.query(
        `INSERT INTO billee_users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)`,
        [u.email, hash, u.full_name, u.role]
      );
      console.log(`✅ Usuario creado: ${u.email} (${u.role})`);
    } else {
      console.log(`ℹ️  Usuario ya existe: ${u.email}`);
    }
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(pool, email, password) {
  const { rows } = await pool.query(
    'SELECT * FROM billee_users WHERE email = $1 AND is_active = TRUE',
    [email.toLowerCase().trim()]
  );

  if (!rows.length) {
    throw new Error('Credenciales incorrectas');
  }

  const user = rows[0];
  const ok   = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Credenciales incorrectas');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    SECRET,
    { expiresIn: EXPIRY }
  );

  return {
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
  };
}

// ── Middleware: verificar JWT ─────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { setupUsersTable, seedUsers, login, requireAuth };
