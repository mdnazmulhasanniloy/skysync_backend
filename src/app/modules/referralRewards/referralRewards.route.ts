import { Router } from 'express';
import { referralRewardsController } from './referralRewards.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

// router.post('/', referralRewardsController.createReferralRewards);
// router.patch('/:id', auth(USER_ROLE?.admin) referralRewardsController.updateReferralRewards);
router.delete(
  '/:id',
  auth(USER_ROLE.user),
  referralRewardsController.deleteReferralRewards,
);
router.get(
  '/my-referral',
  auth(USER_ROLE.user),
  referralRewardsController.getAllReferralRewards,
);
router.get(
  '/:id',
  auth(USER_ROLE.user),
  referralRewardsController.getReferralRewardsById,
);
// router.get('/', referralRewardsController.getAllReferralRewards);

export const referralRewardsRoutes = router;
