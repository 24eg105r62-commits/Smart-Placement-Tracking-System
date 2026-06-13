import { Router } from 'express';
import { myActivity, listActivity } from '../controllers/activityController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/me', myActivity);
router.get('/', verifyRoles(ROLES.ADMIN), listActivity);

export default router;
