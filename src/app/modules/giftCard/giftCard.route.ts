import { Router } from 'express';
import { giftCardController } from './giftCard.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  upload.single('logo'),
  parseData(),
  giftCardController.createGiftCard,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  upload.single('logo'),
  parseData(),
  giftCardController.updateGiftCard,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  giftCardController.deleteGiftCard,
);
router.get(
  '/:id',
  //   auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  giftCardController.getGiftCardById,
);
router.get(
  '/',
  //   auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  giftCardController.getAllGiftCard,
);

export const giftCardRoutes = router;
