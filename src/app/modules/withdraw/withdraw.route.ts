import { Router } from 'express';
import { withdrawController } from './withdraw.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { WithdrawValidation } from './withdraw.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(WithdrawValidation.create),
  withdrawController.createWithdraw,
);
router.patch(
  '/accept/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(WithdrawValidation.accept),
  withdrawController.acceptRequest,
);
router.patch(
  '/reject/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(WithdrawValidation.reject),
  withdrawController.rejectRequest,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  withdrawController.deleteWithdraw,
);
router.get(
  '/my-requests',
  auth(USER_ROLE.user),
  withdrawController.getMyWithdraw,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  withdrawController.getWithdrawById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  withdrawController.getAllWithdraw,
);

export const withdrawRoutes = router;
