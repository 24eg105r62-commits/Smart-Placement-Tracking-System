import { Router } from 'express';
import {
  applyToJob,
  myApplications,
  applicationsForJob,
  listAllApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.post('/', verifyRoles(ROLES.STUDENT), applyToJob);
router.get('/me', verifyRoles(ROLES.STUDENT), myApplications);
router.get('/job/:jobId', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), applicationsForJob);
router.get('/', verifyRoles(ROLES.ADMIN), listAllApplications);
router.patch('/:id/status', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), updateApplicationStatus);

export default router;
