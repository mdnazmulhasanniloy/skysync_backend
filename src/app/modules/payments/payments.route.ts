
import { Router } from 'express';
import { paymentsController } from './payments.controller';

const router = Router();

router.post('/checkout', paymentsController.checkout); 

export const paymentsRoutes = router;