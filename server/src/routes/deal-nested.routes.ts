import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import * as checklistController from '../controllers/checklist.controller';
import * as activityController from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Deal-specific document routes
router.get('/:dealId/documents', documentController.getDealDocuments);
router.post('/:dealId/documents', upload.single('file'), documentController.uploadDocument);

// Deal-specific checklist routes
router.get('/:dealId/checklists', checklistController.getDealChecklists);
router.post('/:dealId/checklists', checklistController.createChecklist);

// Deal-specific activity routes
router.get('/:dealId/activities', activityController.getDealActivities);

// Contact-specific activity routes
router.get('/contacts/:contactId/activities', activityController.getContactActivities);

export default router;
