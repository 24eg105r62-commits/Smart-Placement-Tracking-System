import { Router } from 'express';
import { studentDashboard, recruiterDashboard, adminDashboard } from '../controllers/dashboardController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/student', verifyRoles(ROLES.STUDENT), studentDashboard);
router.get('/recruiter', verifyRoles(ROLES.RECRUITER), recruiterDashboard);
router.get('/admin', verifyRoles(ROLES.ADMIN), adminDashboard);

export default router;
