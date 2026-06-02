// middleware/errorHandler.js — Centralized error handling
// All unhandled errors bubble here. Keeps controllers clean.

export function errorHandler(err, req, res, _next) {
  console.error('🔴 Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 25MB.' });
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — this record already exists.' });
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// Helper to create structured errors from controllers
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
