import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ENV } from './env';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    if (!ENV.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL is not set. Database operations will fail until configured.');
    }
    pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: ENV.DATABASE_URL.includes('neon.tech') || ENV.PGSSLMODE === 'require' 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query<T>(text, params);
    const duration = Date.now() - start;
    if (ENV.NODE_ENV === 'development' && duration > 500) {
      console.log('Slow query executed', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query execution error', { text, error });
    throw error;
  }
}

