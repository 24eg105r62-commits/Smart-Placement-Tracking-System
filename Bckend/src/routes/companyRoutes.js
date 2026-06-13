import { Router } from 'express';
import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  uploadCompanyLogo,
  deleteCompany,
} from '../controllers/companyController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyRoles } from '../middlewares/verifyRoles.js';
import { uploadImage } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(verifyToken);

router.get('/', listCompanies);
router.get('/:id', getCompanyById);

router.post('/', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), createCompany);
router.put('/:id', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), updateCompany);
router.post('/:id/logo', verifyRoles(ROLES.RECRUITER, ROLES.ADMIN), uploadImage.single('logo'), uploadCompanyLogo);
router.delete('/:id', verifyRoles(ROLES.ADMIN), deleteCompany);

export default router;
