import { Router } from 'express';
import * as dealController from '../controllers/deal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', dealController.getDealStats);
router.get('/', dealController.getAllDeals);
router.post('/', dealController.createDeal);
router.get('/:id', dealController.getDealById);
router.put('/:id', dealController.updateDeal);
router.patch('/:id/stage', dealController.updateDealStage);
router.delete('/:id', dealController.deleteDeal);

export default router;
