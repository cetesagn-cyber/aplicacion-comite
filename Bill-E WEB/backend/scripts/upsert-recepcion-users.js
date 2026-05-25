require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  options: '-c client_encoding=UTF8',
});

const users = [
  { email: 'jgalindo@cetesa.com.co', full_name: 'J Galindo' },
  { email: 'recepcion@cetesa.com.co', full_name: 'Recepcion CETESA' },
];

(async () => {
  const passwordHash = await bcrypt.hash('Cetesa.2030', 12);

  for (const user of users) {
    await pool.query(
      `INSERT INTO billee_users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         is_active = TRUE,
         updated_at = NOW()`,
      [user.email, passwordHash, user.full_name, 'operador']
    );
    console.log(`Usuario listo: ${user.email}`);
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
