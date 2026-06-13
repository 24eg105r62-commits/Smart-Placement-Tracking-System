import { UserModel } from '../models/User.js';
import { StudentModel } from '../models/Student.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { ROLES, ROLE_VALUES } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../services/activityService.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/generateTokens.js';

const issueTokensAndRespond = async (res, user, statusCode, message) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, { user: user.toSafeObject(), accessToken }, message));
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = ROLES.STUDENT } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (!ROLE_VALUES.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${ROLE_VALUES.join(', ')}`);
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await UserModel.create({ name, email, password, role });

  if (role === ROLES.STUDENT) {
    await StudentModel.create({ userId: user._id });
  } else if (role === ROLES.RECRUITER) {
    await RecruiterModel.create({ userId: user._id });
  }

  await logActivity(user._id, 'REGISTER', `${user.name} registered as ${user.role}`);

  return issueTokensAndRespond(res, user, 201, 'Registration successful');
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await logActivity(user._id, 'LOGIN', `${user.name} logged in`);

  return issueTokensAndRespond(res, user, 200, 'Login successful');
});

// POST /api/auth/refresh — reads the httpOnly refresh cookie, rotates tokens
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'Refresh token missing. Please log in again.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw new ApiError(401, 'Refresh token expired or invalid. Please log in again.');
  }

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw new ApiError(401, 'User no longer exists');
  }

  return issueTokensAndRespond(res, user, 200, 'Token refreshed');
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  return res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Current user'));
});
