import { Router } from 'express';
import { listArchives, archiveDocument } from '../controllers/archive.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/',  listArchives);
router.post('/', archiveDocument);
export default router;
