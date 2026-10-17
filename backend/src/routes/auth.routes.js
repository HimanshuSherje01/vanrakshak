import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { login, me, updateProfile, changePassword, getDemoUsers, demoLogin } from '../controllers/auth.controller.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, login);
router.get('/demo-users', getDemoUsers);
router.post('/demo-login', demoLogin);
router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;

