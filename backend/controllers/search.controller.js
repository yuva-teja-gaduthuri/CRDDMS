// controllers/search.controller.js
// Full-text search across document metadata and OCR text.

import pool from '../config/db.js';
import { logAction } from '../services/audit.service.js';

// GET /api/search?q=&department_id=&category=&status=&academic_year=&page=
export async function search(req, res, next) {
  try {
    const { q = '', department_id, category, status, academic_year, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const filters = [];

    if (q) {
      params.push(`%${q}%`);
      filters.push(`(ud.title ILIKE $${params.length}
                    OR ud.file_name ILIKE $${params.length}
                    OR ud.tags::text ILIKE $${params.length}
                    OR o.extracted_text ILIKE $${params.length})`);
    }
    if (department_id) { params.push(department_id); filters.push(`ud.department_id = $${params.length}`); }
    if (category)      { params.push(category);      filters.push(`ud.category = $${params.length}`); }
    if (status)        { params.push(status);         filters.push(`ud.status = $${params.length}`); }
    if (academic_year) { params.push(academic_year);  filters.push(`ud.academic_year = $${params.length}`); }

    // Dept-level restriction
    const user = req.user;
    if (['dept_head','faculty','staff'].includes(user.role)) {
      params.push(user.department_id);
      filters.push(`ud.department_id = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM uploaded_documents ud
       LEFT JOIN ocr_extracted_text o ON o.document_id = ud.id ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT ud.*, d.department_code, d.department_name, u.name AS uploader_name,
              o.confidence_score
       FROM uploaded_documents ud
       LEFT JOIN departments d         ON ud.department_id = d.id
       LEFT JOIN users u               ON ud.uploaded_by   = u.id
       LEFT JOIN ocr_extracted_text o  ON o.document_id    = ud.id
       ${where}
       ORDER BY ud.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    await logAction({ userId: user.id, action: 'search', ip: req.ip, details: { query: q, results: total } });
    res.json({ success: true, results: rows, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}
