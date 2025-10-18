import { Router } from 'express';
import { feedbackController } from './feedback.controller';
import validateRequest from '../../middleware/validateRequest';
import { FeedbackValidator } from './feedback.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(FeedbackValidator.createSchema),
  feedbackController.createFeedback,
);
router.patch(
  '/resolved/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin), 
  feedbackController.makeResolved,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(FeedbackValidator.updateSchema),
  feedbackController.updateFeedback,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  feedbackController.deleteFeedback,
);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  feedbackController.getFeedbackById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  feedbackController.getAllFeedback,
);

export const feedbackRoutes = router;
