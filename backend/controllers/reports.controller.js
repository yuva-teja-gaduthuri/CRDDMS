// controllers/reports.controller.js
// All analytics queries for the dashboard charts.

import pool from '../config/db.js';

export async function getReports(req, res, next) {
  try {
    const [
      byDept, byCategory, ocrStats, storage, monthlyTrend, statusDist
    ] = await Promise.all([
      // Documents by department
      pool.query(`SELECT d.department_code, d.department_name, COUNT(ud.id)::int AS count
                  FROM departments d
                  LEFT JOIN uploaded_documents ud ON ud.department_id = d.id
                  GROUP BY d.id ORDER BY count DESC`),
      // Documents by category
      pool.query(`SELECT category, COUNT(*)::int AS count FROM uploaded_documents GROUP BY category`),
      // OCR stats
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(CASE WHEN confidence_score > 70 THEN 1 END)::int AS success
                  FROM ocr_extracted_text`),
      // Storage by department
      pool.query(`SELECT d.department_name, COALESCE(SUM(ud.file_size),0)::bigint AS bytes
                  FROM departments d
                  LEFT JOIN uploaded_documents ud ON ud.department_id = d.id
                  GROUP BY d.id ORDER BY bytes DESC LIMIT 8`),
      // Monthly upload trend (last 6 months)
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                         COUNT(*)::int AS count
                  FROM uploaded_documents
                  WHERE created_at > NOW() - INTERVAL '6 months'
                  GROUP BY DATE_TRUNC('month', created_at)
                  ORDER BY DATE_TRUNC('month', created_at)`),
      // Status distribution
      pool.query(`SELECT status, COUNT(*)::int AS count FROM uploaded_documents GROUP BY status`),
    ]);

    res.json({
      success: true,
      byDepartment:  byDept.rows,
      byCategory:    byCategory.rows,
      ocr:           ocrStats.rows[0],
      storage:       storage.rows,
      monthlyTrend:  monthlyTrend.rows,
      statusDist:    statusDist.rows,
    });
  } catch (err) { next(err); }
}

export async function getDashboardStats(req, res, next) {
  try {
    const [totalDocs, totalUsers, pendingDocs, totalSize] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM uploaded_documents`),
      pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE is_active=true`),
      pool.query(`SELECT COUNT(*)::int AS count FROM uploaded_documents WHERE status='pending'`),
      pool.query(`SELECT COALESCE(SUM(file_size),0)::bigint AS bytes FROM uploaded_documents`),
    ]);

    res.json({
      success: true,
      totalDocuments: totalDocs.rows[0].count,
      activeUsers:    totalUsers.rows[0].count,
      pendingApproval: pendingDocs.rows[0].count,
      storageUsedBytes: totalSize.rows[0].bytes,
    });
  } catch (err) { next(err); }
}
