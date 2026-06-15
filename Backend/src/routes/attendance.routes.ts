import { Router } from 'express';
import { checkIn, checkOut, getMyAttendance, getMyStats } from '../controllers/attendance.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Staff (and above) routes
router.use(verifyToken);
router.use(authorizeRoles(Role.STAFF, Role.MANAGER, Role.ADMIN));

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/me/stats', getMyStats);

export default router;
