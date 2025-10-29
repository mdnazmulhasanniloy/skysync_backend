import { Router } from 'express';
import { paymentsController } from './payments.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/checkout', auth(USER_ROLE.user), paymentsController.checkout);
router.get('/confirm-payment', paymentsController.confirmPayments);
router.get(
  '/all-transition',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  paymentsController.allTransitions,
);

export const paymentsRoutes = router;
