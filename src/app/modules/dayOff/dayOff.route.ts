import { Router } from 'express';
import { dayOffController } from './dayOff.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.user), dayOffController.createDayOff);
router.patch('/:id', auth(USER_ROLE.user), dayOffController.updateDayOff);
router.delete('/:id', auth(USER_ROLE.user), dayOffController.deleteDayOff);
router.get(
  '/my-day-off',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  dayOffController.getMyDayOff,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  dayOffController.getDayOffById,
);
router.get(
  '/',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  dayOffController.getAllDayOff,
);

export const dayOffRoutes = router;
