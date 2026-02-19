import { Router } from 'express';
import * as checklistController from '../controllers/checklist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/checklists/:id', checklistController.getChecklistById);
router.put('/checklists/:id', checklistController.updateChecklist);
router.delete('/checklists/:id', checklistController.deleteChecklist);

router.post('/checklist-items', checklistController.createChecklistItem);
router.patch('/checklist-items/:id', checklistController.updateChecklistItem);
router.delete('/checklist-items/:id', checklistController.deleteChecklistItem);

export default router;
