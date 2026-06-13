import { ApiError } from '../utils/ApiError.js';

// Usage: router.get('/admin-only', verifyToken, verifyRoles(ROLES.ADMIN), handler)
export const verifyRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied. Required role(s): ${allowedRoles.join(', ')}`));
  }
  next();
};
