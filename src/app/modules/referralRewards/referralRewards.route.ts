
import { Router } from 'express';
import { referralRewardsController } from './referralRewards.controller';

const router = Router();

router.post('/', referralRewardsController.createReferralRewards);
router.patch('/:id', referralRewardsController.updateReferralRewards);
router.delete('/:id', referralRewardsController.deleteReferralRewards);
router.get('/:id', referralRewardsController.getReferralRewardsById);
router.get('/', referralRewardsController.getAllReferralRewards);

export const referralRewardsRoutes = router;