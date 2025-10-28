import { Router } from 'express';
import { bookmarkController } from './bookmark.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.user), bookmarkController.createBookmark);
// router.patch('/:id', bookmarkController.updateBookmark);
// router.delete('/:id', bookmarkController.deleteBookmark);
router.get('/:id', auth(USER_ROLE.user), bookmarkController.getBookmarkById);
router.get('/', auth(USER_ROLE.user), bookmarkController.getMyBookmark);

export const bookmarkRoutes = router;
