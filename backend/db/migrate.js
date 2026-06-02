// db/migrate.js — Runs schema + seed against your configured database
// Usage: node db/migrate.js

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Build connection config ──────────────────────────────
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'crddms_db',
      user:     process.env.DB_USER     || 'crddms_user',
      password: process.env.DB_PASSWORD || 'crddms_pass',
    };

const pool = new Pool(poolConfig);

// ── Helper: split SQL file into individual statements ────
// Splits on semicolons that are NOT inside $$ ... $$ blocks
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) { continue; } // skip comment-only lines

    if (trimmed.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') statements.push(stmt);
      current = '';
    }
  }
  // Push any remaining content
  if (current.trim()) statements.push(current.trim());

  return statements.filter(s => s.length > 1);
}

async function migrate() {
  console.log('');
  console.log('🔄  CRDDMS Database Migration');
  console.log('─'.repeat(50));

  // Step 1: Test connection
  let client;
  try {
    console.log('📡  Connecting to database…');
    client = await pool.connect();
    const res = await client.query('SELECT current_database(), version()');
    console.log(`✅  Connected to: ${res.rows[0].current_database}`);
    console.log(`    PostgreSQL ${res.rows[0].version.split(' ')[1]}`);
  } catch (err) {
    console.error('');
    console.error('❌  Cannot connect to database!');
    console.error(`    Error: ${err.message}`);
    console.error('');
    console.error('👉  Check your .env file — DATABASE_URL should look like:');
    console.error('    DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require');
    process.exit(1);
  }

  // Step 2: Run schema
  try {
    console.log('');
    console.log('📋  Creating tables…');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅  All tables created (or already exist)');
  } catch (err) {
    console.error(`❌  Schema error: ${err.message}`);
    if (err.detail) console.error(`    Detail: ${err.detail}`);
    client.release();
    await pool.end();
    process.exit(1);
  }

  // Step 3: Run seed (statement by statement for clear error reporting)
  try {
    console.log('');
    console.log('🌱  Inserting seed data…');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    // Run the whole seed in one go (DO $$ blocks need to stay together)
    await client.query(seedSQL);
    console.log('✅  Seed data inserted');
  } catch (err) {
    console.error(`❌  Seed error: ${err.message}`);
    if (err.detail)   console.error(`    Detail:   ${err.detail}`);
    if (err.hint)     console.error(`    Hint:     ${err.hint}`);
    if (err.position) console.error(`    Position: ${err.position}`);
    // Non-fatal — schema is done, seed data is optional
    console.error('    (Seed failed but schema is OK. You can still start the server.)');
  }

  client.release();
  await pool.end();

  console.log('');
  console.log('─'.repeat(50));
  console.log('🎉  Migration complete! Now run:');
  console.log('    npm run dev');
  console.log('');
}

migrate();
