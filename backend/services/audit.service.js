// services/audit.service.js — Writes immutable audit log entries
// Call logAction() anywhere in the codebase after an important event.

import pool from '../config/db.js';

/**
 * @param {object} opts
 * @param {number|null} opts.userId
 * @param {string}      opts.action   — 'login'|'logout'|'upload'|'download'|'view'|'update'|'delete'|'approve'|'search'
 * @param {number|null} opts.documentId
 * @param {string}      opts.ip
 * @param {object}      opts.details  — any extra JSON data
 */
export async function logAction({ userId = null, action, documentId = null, ip = '', details = {} }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, document_id, ip_address, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, documentId, ip, JSON.stringify(details)]
    );
  } catch (err) {
    // Never let audit failure crash the main request
    console.error('Audit log write failed:', err.message);
  }
}
