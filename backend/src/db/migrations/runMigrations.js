// src/db/migrations/runMigrations.js
const fs = require('fs');
const path = require('path');
const db = require('../../config/db');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      run_on TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const { rows } = await db.query(`SELECT name FROM migrations`);
  return rows.map((r) => r.name);
}

async function applyMigration(fileName, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`➡️  Running migration: ${fileName}`);

  try {
    await db.query('BEGIN');
    await db.query(sql);
    await db.query(
      `INSERT INTO migrations (name) VALUES ($1)`,
      [fileName]
    );
    await db.query('COMMIT');
    console.log(`✔️  Migration applied: ${fileName}`);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(`❌ Migration failed: ${fileName}`);
    console.error(err);
    process.exit(1);
  }
}

async function runMigrations() {
  console.log('🔧 Running database migrations...');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const migrationsDir = path.join(__dirname);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (!applied.includes(file)) {
      const fullPath = path.join(migrationsDir, file);
      await applyMigration(file, fullPath);
    } else {
      console.log(`⏭️  Skipping already applied migration: ${file}`);
    }
  }

  console.log('🎉 All migrations complete.');
  process.exit(0);
}

runMigrations();