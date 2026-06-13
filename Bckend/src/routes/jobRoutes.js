import { Router } from 'express';
import {
  createJob,
  listJobs,
  upcomingDeadlines,
  myJobs,
  getJobById,
  checkJobEligibility,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

// Specific routes first (before /:id)
router.get('/deadlines/upcoming', upcomingDeadlines);
router.get('/recruiter/mine', verifyRoles(ROLES.RECRUITER), myJobs);

router.get('/', listJobs);
router.post('/', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), createJob);

router.get('/:id', getJobById);
router.get('/:id/eligibility', verifyRoles(ROLES.STUDENT), checkJobEligibility);
router.put('/:id', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), updateJob);
router.delete('/:id', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), deleteJob);

export default router;
