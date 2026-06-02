import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, authorize('admin','super_admin','compliance_reviewer'), listAuditLogs);
export default router;
