import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';

const router = Router();

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.post('/', orderController.createOrder);
router.put('/:id/accept', orderController.acceptOrder);
router.put('/:id/status', orderController.updateStatus);
router.post('/:id/photos', orderController.addPhotos);
router.put('/:id/cancel', orderController.cancelOrder);

export default router;
