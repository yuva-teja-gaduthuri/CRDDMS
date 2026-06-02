import { Router } from 'express';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/users.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/',     authorize('admin','super_admin'), listUsers);
router.get('/:id',  getUser);
router.put('/:id',  updateUser);
router.delete('/:id', authorize('super_admin'), deleteUser);
export default router;
