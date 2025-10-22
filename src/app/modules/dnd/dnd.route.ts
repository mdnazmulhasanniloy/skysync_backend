import { Router } from 'express';
import { dndController } from './dnd.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { dndValidation } from './dnd.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(dndValidation.create),
  dndController.createDnd,
);
router.patch(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  validateRequest(dndValidation.update),
  dndController.updateDnd,
);
router.delete(
  '/:id',
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  dndController.deleteDnd,
);
router.get('/my-dnd', auth(USER_ROLE.user), dndController.getMyDnd);
router.get('/:id', dndController.getDndById);
router.get('/', dndController.getAllDnd);

export const dndRoutes = router;
