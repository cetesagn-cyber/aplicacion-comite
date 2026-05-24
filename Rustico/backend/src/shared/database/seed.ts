import fs from 'fs';
import path from 'path';
import { db } from './pg.client';

async function runSeed() {
  console.log('🌱 Cargando datos semilla...');

  const seedFile = path.join(__dirname, '../../../../database/seeds/001_rustico_seed.sql');

  if (!fs.existsSync(seedFile)) {
    console.error('❌ Archivo de seed no encontrado:', seedFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedFile, 'utf8');
  try {
    await db.query(sql);
    console.log('✅ Seed aplicado correctamente.');
  } catch (err) {
    console.error('💥 Error al aplicar seed:', err);
    process.exit(1);
  }

  await db.close();
}

runSeed().catch(async (err) => {
  console.error('💥 Seed falló:', err);
  await db.close();
  process.exit(1);
});
