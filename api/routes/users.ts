import { Router } from 'express';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/:id', userController.getUser);
router.post('/login', userController.login);
router.get('/:id/reviews', userController.getReviews);
router.post('/reviews', userController.addReview);

export default router;
