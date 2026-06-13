import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { UserModel } from '../models/User.js';

// Verifies the JWT access token sent as `Authorization: Bearer <token>` and attaches req.user
export const verifyToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  next();
});
