import { JobModel } from '../models/Job.js';
import { CompanyModel } from '../models/Company.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { StudentModel } from '../models/Student.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkEligibility } from '../utils/eligibility.js';
import { logActivity } from '../services/activityService.js';
import { createNotificationsForUsers } from '../services/notificationService.js';
import { ROLES } from '../constants/roles.js';

const assertCanManageJob = async (req, job) => {
  if (req.user.role === ROLES.ADMIN) return;
  if (req.user.role === ROLES.RECRUITER && job.postedBy.toString() === req.user.id) return;
  throw new ApiError(403, 'You do not have permission to manage this job');
};

// POST /api/jobs (recruiter must have a company; admin can post for any company via companyId)
export const createJob = asyncHandler(async (req, res) => {
  const { title, description, package: pkg, location, eligibilityCgpa, eligibleBranches, requiredSkills, deadline } = req.body;
  let { companyId } = req.body;

  if (!title || pkg === undefined || !deadline) {
    throw new ApiError(400, 'title, package and deadline are required');
  }

  if (req.user.role === ROLES.RECRUITER) {
    const recruiter = await RecruiterModel.findOne({ userId: req.user.id });
    if (!recruiter || !recruiter.companyId) {
      throw new ApiError(400, 'Create your company profile before posting jobs');
    }
    companyId = recruiter.companyId;
  }
  if (!companyId) throw new ApiError(400, 'companyId is required');

  const company = await CompanyModel.findById(companyId);
  if (!company) throw new ApiError(404, 'Company not found');

  const job = await JobModel.create({
    companyId,
    postedBy: req.user.id,
    title,
    description,
    package: pkg,
    location,
    eligibilityCgpa: eligibilityCgpa ?? 0,
    eligibleBranches: eligibleBranches || [],
    requiredSkills: requiredSkills || [],
    deadline,
  });

  await logActivity(req.user.id, 'JOB_CREATED', `Posted job "${job.title}" at ${company.name}`);

  // Notify eligible students
  const eligibleQuery = { cgpa: { $gte: job.eligibilityCgpa } };
  if (job.eligibleBranches.length) eligibleQuery.branch = { $in: job.eligibleBranches };
  const eligibleStudents = await StudentModel.find(eligibleQuery).select('userId');
  await createNotificationsForUsers(
    eligibleStudents.map((s) => s.userId),
    {
      title: 'New job posted',
      message: `${company.name} posted a new opening: ${job.title} (${job.package} LPA). Check it out!`,
      type: 'JOB_POSTED',
    }
  );

  return res.status(201).json(new ApiResponse(201, { job }, 'Job created'));
});

// GET /api/jobs — search & filter
// query: search (title/company), minPackage, maxPackage, location, skills, activeOnly, page, limit
export const listJobs = asyncHandler(async (req, res) => {
  const { search, minPackage, maxPackage, location, skills, activeOnly, page = 1, limit = 20 } = req.query;

  const match = {};
  if (location) match.location = new RegExp(location, 'i');
  if (minPackage || maxPackage) {
    match.package = {};
    if (minPackage) match.package.$gte = Number(minPackage);
    if (maxPackage) match.package.$lte = Number(maxPackage);
  }
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length) match.requiredSkills = { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) };
  }
  if (activeOnly === 'true') {
    match.isActive = true;
    match.deadline = { $gte: new Date() };
  }

  let companyIds = null;
  if (search) {
    const regex = new RegExp(search, 'i');
    match.$or = [{ title: regex }];
    const matchingCompanies = await CompanyModel.find({ name: regex }).select('_id');
    companyIds = matchingCompanies.map((c) => c._id);
    if (companyIds.length) match.$or.push({ companyId: { $in: companyIds } });
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [jobs, total] = await Promise.all([
    JobModel.find(match)
      .populate('companyId', 'name logo location industry')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    JobModel.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      jobs,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Jobs fetched')
  );
});

// GET /api/jobs/deadlines/upcoming — jobs whose deadline is within the next N days (default 7)
export const upcomingDeadlines = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const jobs = await JobModel.find({ isActive: true, deadline: { $gte: now, $lte: until } })
    .populate('companyId', 'name logo')
    .sort({ deadline: 1 })
    .limit(20);

  return res.status(200).json(new ApiResponse(200, { jobs }, 'Upcoming deadlines fetched'));
});

// GET /api/jobs/:id
export const getJobById = asyncHandler(async (req, res) => {
  const job = await JobModel.findById(req.params.id).populate('companyId');
  if (!job) throw new ApiError(404, 'Job not found');
  return res.status(200).json(new ApiResponse(200, { job }, 'Job fetched'));
});

// GET /api/jobs/:id/eligibility (student)
export const checkJobEligibility = asyncHandler(async (req, res) => {
  const job = await JobModel.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');

  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const result = checkEligibility(student, job);
  return res.status(200).json(new ApiResponse(200, result, 'Eligibility checked'));
});

// PUT /api/jobs/:id
export const updateJob = asyncHandler(async (req, res) => {
  const job = await JobModel.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  await assertCanManageJob(req, job);

  const fields = ['title', 'description', 'package', 'location', 'eligibilityCgpa', 'eligibleBranches', 'requiredSkills', 'deadline', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  await job.save();
  await logActivity(req.user.id, 'JOB_UPDATED', `Updated job "${job.title}"`);

  return res.status(200).json(new ApiResponse(200, { job }, 'Job updated'));
});

// DELETE /api/jobs/:id
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await JobModel.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  await assertCanManageJob(req, job);

  await job.deleteOne();
  return res.status(200).json(new ApiResponse(200, null, 'Job deleted'));
});

// GET /api/jobs/recruiter/mine (recruiter's own postings)
export const myJobs = asyncHandler(async (req, res) => {
  const jobs = await JobModel.find({ postedBy: req.user.id }).populate('companyId', 'name logo').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, { jobs }, 'Your jobs fetched'));
});
