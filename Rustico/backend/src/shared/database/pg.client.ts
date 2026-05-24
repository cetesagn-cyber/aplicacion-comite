import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no está configurado.');
}

class DatabaseClient {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('💥 Error inesperado en cliente de base de datos inactivo:', err);
    });
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      if (process.env.NODE_ENV === 'development') {
        const dur = Date.now() - start;
        console.log(`[DB] ${text.substring(0, 80)}${text.length > 80 ? '…' : ''} | ${dur}ms | ${res.rowCount} filas`);
      }
      return res;
    } catch (error) {
      console.error('[DB Error]', text, error);
      throw error;
    }
  }

  async transaction<T>(
    callback: (client: { query: <R extends QueryResultRow = any>(text: string, params?: any[]) => Promise<QueryResult<R>> }) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('[DB] Pool cerrado.');
  }
}

export const db = new DatabaseClient();
