import fs from 'fs';
import path from 'path';
import { query } from '../config/db';

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`Applying migration: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await query(sql);
    console.log(`✓ Applied ${file} successfully.`);
  }

  console.log('✨ All migrations applied successfully!');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

