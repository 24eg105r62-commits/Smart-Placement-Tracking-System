import { Router } from 'express';
import { getMyProfile, updateMyProfile, listRecruiters, getRecruiterById } from '../controllers/recruiterController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/me', verifyRoles(ROLES.RECRUITER), getMyProfile);
router.put('/me', verifyRoles(ROLES.RECRUITER), updateMyProfile);

router.get('/', verifyRoles(ROLES.ADMIN), listRecruiters);
router.get('/:id', verifyRoles(ROLES.ADMIN), getRecruiterById);

export default router;
