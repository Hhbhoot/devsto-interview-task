import { Router } from 'express';
import { login, me, updateProfile } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me as any);
router.put('/profile', verifyToken, updateProfile as any);

export default router;
