import { ActivityModel } from '../models/Activity.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/activity/me
export const myActivity = asyncHandler(async (req, res) => {
  const activity = await ActivityModel.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
  return res.status(200).json(new ApiResponse(200, { activity }, 'Activity fetched'));
});

// GET /api/activity (admin) — query: userId, action, page, limit
export const listActivity = asyncHandler(async (req, res) => {
  const { userId, action, page = 1, limit = 30 } = req.query;
  const match = {};
  if (userId) match.userId = userId;
  if (action) match.action = action;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [activity, total] = await Promise.all([
    ActivityModel.find(match)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ActivityModel.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      activity,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Activity fetched')
  );
});
