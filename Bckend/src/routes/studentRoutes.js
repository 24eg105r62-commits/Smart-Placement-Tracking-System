import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  uploadResume,
  removeResume,
  listStudents,
  getStudentById,
} from '../controllers/studentController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { uploadImage, uploadResume as uploadResumeMiddleware } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/me', verifyRoles(ROLES.STUDENT), getMyProfile);
router.put('/me', verifyRoles(ROLES.STUDENT), updateMyProfile);
router.post('/me/picture', verifyRoles(ROLES.STUDENT), uploadImage.single('picture'), uploadProfilePicture);
router.post('/me/resume', verifyRoles(ROLES.STUDENT), uploadResumeMiddleware.single('resume'), uploadResume);
router.delete('/me/resume', verifyRoles(ROLES.STUDENT), removeResume);

router.get('/', verifyRoles(ROLES.ADMIN), listStudents);
router.get('/:id', verifyRoles(ROLES.ADMIN), getStudentById);

export default router;
