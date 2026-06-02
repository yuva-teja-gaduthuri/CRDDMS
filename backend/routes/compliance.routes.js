import { Router } from 'express';
import { listCompliance, createCompliance, deleteCompliance } from '../controllers/compliance.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/',     listCompliance);
router.post('/',    createCompliance);
router.delete('/:id', deleteCompliance);
export default router;
