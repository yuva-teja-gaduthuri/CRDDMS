import { Router } from 'express';
import { listDocuments, getDocument, uploadDocument, updateDocument, deleteDocument }
  from '../controllers/documents.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/',         listDocuments);
router.get('/:id',      getDocument);
router.post('/upload',  upload.single('file'), uploadDocument);
router.put('/:id',      updateDocument);
router.delete('/:id',   authorize('admin','super_admin'), deleteDocument);

export default router;
