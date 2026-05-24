import fs from 'fs';
import path from 'path';
import { db } from './pg.client';

async function runMigrations() {
  console.log('🚀 Iniciando migraciones de base de datos...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id             SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      executed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  const migrationsDir = path.join(__dirname, '../../../../database/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Directorio de migraciones no encontrado:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('ℹ️  No hay migraciones pendientes.');
    return;
  }

  for (const file of files) {
    const already = await db.query('SELECT id FROM schema_migrations WHERE migration_name = $1', [file]);
    if (already.rows.length > 0) {
      console.log(`⏭️  ${file} — ya aplicada`);
      continue;
    }

    console.log(`⚙️  Aplicando: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      await db.transaction(async (tx) => {
        await tx.query(sql);
        await tx.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [file]);
      });
      console.log(`✅  ${file} — aplicada`);
    } catch (err) {
      console.error(`💥 Error en migración ${file}:`, err);
      process.exit(1);
    }
  }

  console.log('🎉 Todas las migraciones completadas.');
  await db.close();
}

runMigrations().catch(async (err) => {
  console.error('💥 Migración falló:', err);
  await db.close();
  process.exit(1);
});
