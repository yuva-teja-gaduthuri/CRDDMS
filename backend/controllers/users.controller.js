// controllers/users.controller.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/users
export async function listUsers(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
              d.department_name, d.department_code
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, users: rows });
  } catch (err) { next(err); }
}

// GET /api/users/:id
export async function getUser(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
              d.department_name, d.department_code
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`, [req.params.id]
    );
    if (!rows[0]) throw new AppError('User not found.', 404);
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
}

// PUT /api/users/:id
export async function updateUser(req, res, next) {
  try {
    const { name, role, department_id, is_active, password } = req.body;
    let hash = undefined;
    if (password) hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `UPDATE users SET
         name          = COALESCE($1, name),
         role          = COALESCE($2, role),
         department_id = COALESCE($3, department_id),
         is_active     = COALESCE($4, is_active),
         password_hash = COALESCE($5, password_hash)
       WHERE id = $6 RETURNING id, name, email, role, is_active`,
      [name, role, department_id, is_active, hash, req.params.id]
    );
    if (!rows[0]) throw new AppError('User not found.', 404);
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
}

// DELETE /api/users/:id
export async function deleteUser(req, res, next) {
  try {
    if (+req.params.id === req.user.id) throw new AppError('Cannot delete your own account.', 400);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
}
