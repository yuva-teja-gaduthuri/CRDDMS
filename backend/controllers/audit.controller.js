// controllers/audit.controller.js
import pool from '../config/db.js';

// GET /api/audit
export async function listAuditLogs(req, res, next) {
  try {
    const { action, user_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const filters = [];

    if (action)  { params.push(action);  filters.push(`al.action = $${params.length}`); }
    if (user_id) { params.push(user_id); filters.push(`al.user_id = $${params.length}`); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const total    = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT al.*, u.name AS user_name, u.role,
              ud.title AS document_title
       FROM audit_logs al
       LEFT JOIN users u               ON al.user_id    = u.id
       LEFT JOIN uploaded_documents ud ON al.document_id = ud.id
       ${where}
       ORDER BY al.timestamp DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, logs: rows, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}
