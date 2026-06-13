import { Router } from 'express';
import { myNotifications, markAsRead, markAllAsRead, sendNotification } from '../controllers/notificationController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/me', myNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/send', verifyRoles(ROLES.ADMIN), sendNotification);

export default router;
