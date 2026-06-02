import { Router } from 'express';
import { getReports, getDashboardStats } from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/',          getReports);
export default router;
