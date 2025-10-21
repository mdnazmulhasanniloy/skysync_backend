import { Router } from 'express';
import { standbyController } from './standby.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { standbyValidation } from './standby.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(standbyValidation.create),
  standbyController.createStandby,
);
router.patch(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  validateRequest(standbyValidation.update),
  standbyController.updateStandby,
);
router.delete(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  standbyController.deleteStandby,
);
router.get('/my-standby', auth(USER_ROLE.user), standbyController.getMyStandby);
router.get(
  '/:id',

  standbyController.getStandbyById,
);
router.get('/', standbyController.getAllStandby);

export const standbyRoutes = router;
