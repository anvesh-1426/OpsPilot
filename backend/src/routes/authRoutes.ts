import { Router } from 'express';
import * as auth from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', authenticate, auth.logout);
router.get('/me', authenticate, auth.me);
router.put('/change-password', authenticate, auth.changePassword);

export default router;
