import { Router } from 'express';
import { processOCR, getOCR } from '../controllers/ocr.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.post('/process/:documentId', processOCR);
router.get('/:documentId',          getOCR);
export default router;
