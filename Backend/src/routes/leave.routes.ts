import { Router } from 'express';
import { applyLeave, getMyLeaves } from '../controllers/leave.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(Role.STAFF, Role.MANAGER, Role.ADMIN));

router.post('/', applyLeave);
router.get('/me', getMyLeaves);

export default router;
