/**
 * Run SQL files in db/migrations/ in lexical order.
 * Invoked before `next build` so Vercel (and other hosts) get a fresh schema.
 *
 * Env:
 * - MIGRATE_DATABASE_URL — optional explicit URL for migrations (recommended if pooled URL fails for DDL)
 * - POSTGRES_URL_NON_POOLING — Vercel Postgres direct URL (preferred for DDL)
 * - DATABASE_URL — app default (often set on Vercel when storage is linked)
 * - POSTGRES_URL — Vercel Postgres pooled URL (fallback)
 * - SKIP_DB_MIGRATIONS=1 — skip (e.g. local `next build` without Docker DB)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

/**
 * Load .env.local / .env so `npm run migrate` works without exporting DATABASE_URL manually.
 * Does not override variables already set in the environment.
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getMigrateConnectionString() {
  return (
    process.env.MIGRATE_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL
  );
}

function listMigrationFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Migrations directory missing: ${dir}`);
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

/**
 * Split migration file into statements. Assumes no semicolons inside string literals.
 * (Matches current repo migrations.)
 */
function splitStatements(sql) {
  const withoutBlockComments = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlockComments
    .split(/;\s*\r?\n/g)
    .map((s) => s.trim())
    .filter((s) => {
      const nonCommentLines = s
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('--'));
      return nonCommentLines.length > 0;
    })
    .map((s) => `${s};`);
}

async function main() {
  const root = path.join(__dirname, '..');
  loadEnvFile(path.join(root, '.env.local'));
  loadEnvFile(path.join(root, '.env'));

  if (
    process.env.SKIP_DB_MIGRATIONS === '1' ||
    process.env.SKIP_DB_MIGRATIONS === 'true'
  ) {
    console.log('[migrate] SKIP_DB_MIGRATIONS is set — skipping.');
    return;
  }

  const url = getMigrateConnectionString();
  if (!url) {
    console.log(
      '[migrate] No database URL found — skipping migrations (CI or local build without DB).'
    );
    return;
  }

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  const files = listMigrationFiles(migrationsDir);
  const client = new Client({ connectionString: url });

  await client.connect();
  try {
    for (const file of files) {
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      const statements = splitStatements(sql);
      console.log(`[migrate] ${file} (${statements.length} statement(s))`);
      for (const stmt of statements) {
        await client.query(stmt);
      }
    }
    console.log('[migrate] All migrations applied.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[migrate] Failed:', err.message || err);
  process.exit(1);
});
