import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const RESUME_TYPES = ['application/pdf'];

const fileFilterFor = (allowedTypes, label) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, `Invalid file type for ${label}. Allowed: ${allowedTypes.join(', ')}`));
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

export const uploadImage = multer({ storage, limits, fileFilter: fileFilterFor(IMAGE_TYPES, 'image') });
export const uploadResume = multer({ storage, limits, fileFilter: fileFilterFor(RESUME_TYPES, 'resume') });
