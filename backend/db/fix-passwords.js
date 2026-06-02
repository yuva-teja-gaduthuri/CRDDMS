// db/fix-passwords.js — one-time fix: updates all user passwords to the correct hash
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const CORRECT_HASH = '$2b$10$v7WZgXPGKwZNnuj2xtiEVews.Sebgr6J5mELZ1uZ8PqcV06vBVUsS';

async function fix() {
  try {
    const res = await pool.query('UPDATE users SET password_hash = $1', [CORRECT_HASH]);
    console.log(`✅  Updated ${res.rowCount} user passwords`);

    // Verify
    const check = await pool.query('SELECT email, substring(password_hash, 1, 20) AS hash_prefix FROM users');
    console.log('');
    console.log('Users in database:');
    check.rows.forEach(r => console.log(`   ${r.email}  →  ${r.hash_prefix}...`));
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await pool.end();
  }
}

fix();
