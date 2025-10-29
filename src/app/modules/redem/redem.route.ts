import { Router } from 'express';
import { redemController } from './redem.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { RedemValidation } from './redem.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(RedemValidation.create),
  redemController.createRedem,
);
router.patch(
  '/complete/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(RedemValidation.complete),
  redemController.completeRedem,
);
router.patch(
  '/reject/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(RedemValidation.reject),
  redemController.rejectRedem,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  redemController.deleteRedem,
);
router.get('/my-redem', auth(USER_ROLE.user), redemController.getMyRedem);
router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  redemController.getRedemById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  redemController.getAllRedem,
);

export const redemRoutes = router;
