import { Router } from 'express';
import { homeController } from './home.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';

const router = Router();

router.get(
  '/home-calender-data',
  auth(USER_ROLE.user),
  homeController.getMySchedule,
);
router.get('/standby-filter', homeController.standByFilter);
router.get('/dayoff-filter', homeController.dayOfFilter);
router.get('/flight-filter', homeController.flightFilter);
router.get('/dnd-filter', homeController.dndFilter);

export const homeRoutes = router;
