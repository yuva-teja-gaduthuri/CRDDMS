// controllers/departments.controller.js
import pool from '../config/db.js';

export async function listDepartments(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, COUNT(ud.id) AS document_count,
              COALESCE(SUM(ud.file_size), 0) AS total_size_bytes
       FROM departments d
       LEFT JOIN uploaded_documents ud ON ud.department_id = d.id
       GROUP BY d.id ORDER BY d.department_name`
    );
    res.json({ success: true, departments: rows });
  } catch (err) { next(err); }
}
