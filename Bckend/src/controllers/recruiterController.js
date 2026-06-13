import { RecruiterModel } from '../models/Recruiter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../services/activityService.js';

// GET /api/recruiters/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const recruiter = await RecruiterModel.findOne({ userId: req.user.id })
    .populate('userId', 'name email role profilePicture')
    .populate('companyId');
  if (!recruiter) throw new ApiError(404, 'Recruiter profile not found');
  return res.status(200).json(new ApiResponse(200, { recruiter }, 'Profile fetched'));
});

// PUT /api/recruiters/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const recruiter = await RecruiterModel.findOne({ userId: req.user.id });
  if (!recruiter) throw new ApiError(404, 'Recruiter profile not found');

  const { companyName, designation } = req.body;
  if (companyName !== undefined) recruiter.companyName = companyName;
  if (designation !== undefined) recruiter.designation = designation;

  await recruiter.save();
  await logActivity(req.user.id, 'PROFILE_UPDATED', 'Updated recruiter profile');

  return res.status(200).json(new ApiResponse(200, { recruiter }, 'Profile updated'));
});

// GET /api/recruiters (admin)
export const listRecruiters = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const match = {};
  if (search) {
    match.$or = [
      { companyName: new RegExp(search, 'i') },
      { designation: new RegExp(search, 'i') },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [recruiters, total] = await Promise.all([
    RecruiterModel.find(match)
      .populate('userId', 'name email profilePicture isVerified')
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    RecruiterModel.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      recruiters,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Recruiters fetched')
  );
});

// GET /api/recruiters/:id (admin)
export const getRecruiterById = asyncHandler(async (req, res) => {
  const recruiter = await RecruiterModel.findById(req.params.id)
    .populate('userId', 'name email profilePicture isVerified role')
    .populate('companyId');
  if (!recruiter) throw new ApiError(404, 'Recruiter not found');
  return res.status(200).json(new ApiResponse(200, { recruiter }, 'Recruiter fetched'));
});
