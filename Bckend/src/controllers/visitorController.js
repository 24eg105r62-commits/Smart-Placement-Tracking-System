import Visitor from '../models/Visitor.js';
import { ApplicationModel as Application } from '../models/Application.js';
import { CompanyModel as Company } from '../models/Company.js';
import { APPLICATION_STATUS } from '../constants/applicationStatus.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getLiveStats = async () => {
  const [visitorDoc, studentsPlaced, companies] = await Promise.all([
    Visitor.findById('site'),
    Application.countDocuments({ status: APPLICATION_STATUS.SELECTED }),
    Company.countDocuments(),
  ]);
  return {
    visitors: visitorDoc?.count ?? 0,
    studentsPlaced,
    companies,
  };
};

// GET /api/visitors — return all landing-page stats (no side effects)
export const getVisitorCount = asyncHandler(async (_req, res) => {
  const stats = await getLiveStats();
  res.json(new ApiResponse(200, stats));
});

// POST /api/visitors/track — increment visitor count then return all stats
export const trackVisit = asyncHandler(async (_req, res) => {
  await Visitor.findByIdAndUpdate(
    'site',
    { $inc: { count: 1 } },
    { upsert: true }
  );
  const stats = await getLiveStats();
  res.json(new ApiResponse(200, stats));
});
