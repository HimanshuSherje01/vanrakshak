import { Router } from 'express';
import { restrictTo } from '../middleware/auth.js';
import { listUsers, createUser, setUserActive } from '../controllers/user.controller.js';

const router = Router();
router.use(restrictTo('admin'));
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/active', setUserActive);

export default router;
