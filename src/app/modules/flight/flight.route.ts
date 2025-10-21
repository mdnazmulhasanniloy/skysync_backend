import { Router } from 'express';
import { flightController } from './flight.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { flightValidation } from './flight.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(flightValidation.create),
  flightController.createFlight,
);
router.patch(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  validateRequest(flightValidation.update),
  flightController.updateFlight,
);
router.delete(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  flightController.deleteFlight,
);
router.get('/my-flight', flightController.getMyFlight);
router.get('/:id', flightController.getFlightById);
router.get('/', flightController.getAllFlight);

export const flightRoutes = router;
