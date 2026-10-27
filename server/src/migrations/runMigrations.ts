import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDbPool } from '../config/db';
import { ENV } from '../config/env';

function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

async function runMigrations() {
  console.log('====================================================');
  console.log('🛡️  MCL ICCC Database Migration Runner');
  console.log(`🌐 Target: Neon PostgreSQL (${ENV.DATABASE_URL ? 'Configured' : 'MISSING'})`);
  console.log('====================================================');

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    // 1. Safety-Critical Pre-flight Verification
    console.log('🔍 Running pre-flight safety checks...');
    const preflight = await client.query(`
      SELECT 
        current_database() as db_name,
        current_user as db_user,
        inet_server_addr() as server_ip,
        version() as pg_version
    `);
    const dbInfo = preflight.rows[0];
    console.log(`✓ Connected to Database: [${dbInfo.db_name}] as User: [${dbInfo.db_user}]`);
    console.log(`✓ Engine: ${dbInfo.pg_version.split(' on ')[0]}`);

    // 2. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Load all applied migrations
    const appliedRes = await client.query<{ name: string; checksum: string }>(
      'SELECT name, checksum FROM schema_migrations ORDER BY id ASC'
    );
    const appliedMap = new Map<string, string>();
    appliedRes.rows.forEach((r) => appliedMap.set(r.name, r.checksum));

    // 4. Read migration files in deterministic alphabetical order
    const migrationsDir = path.join(__dirname);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`📂 Discovered ${files.length} migration file(s).`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      const currentChecksum = computeChecksum(sqlContent);

      if (appliedMap.has(file)) {
        const recordedChecksum = appliedMap.get(file);
        if (recordedChecksum !== currentChecksum) {
          throw new Error(
            `🚨 CRITICAL MIGRATION DRIFT DETECTED in [${file}]!\nRecorded Checksum: ${recordedChecksum}\nCurrent Checksum:  ${currentChecksum}\nMigration files must never be modified after application. Create a new migration instead.`
          );
        }
        console.log(`⏭️  Skipping already applied migration: [${file}] (Checksum verified)`);
        continue;
      }

      console.log(`⏳ Applying migration: [${file}] (SHA-256: ${currentChecksum.slice(0, 12)}...)...`);

      // Execute within an isolated transaction
      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query(
          'INSERT INTO schema_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW())',
          [file, currentChecksum]
        );
        await client.query('COMMIT');
        console.log(`✅ Successfully applied and ledgered: [${file}]`);
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(`❌ Migration failed in [${file}]:`, err.message);
        throw err;
      }
    }

    console.log('====================================================');
    console.log('✨ All migrations are up to date and verified!');
    console.log('====================================================');
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal migration failure:', err);
    process.exit(1);
  });
