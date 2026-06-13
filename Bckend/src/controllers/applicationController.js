import { ApplicationModel } from '../models/Application.js';
import { JobModel } from '../models/Job.js';
import { StudentModel } from '../models/Student.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkEligibility } from '../utils/eligibility.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { APPLICATION_STATUS, ALLOWED_STATUS_TRANSITIONS } from '../constants/applicationStatus.js';
import { ROLES } from '../constants/roles.js';

const STATUS_NOTIFICATION_TYPE = {
  [APPLICATION_STATUS.SHORTLISTED]: 'SHORTLISTED',
  [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: 'INTERVIEW_SCHEDULED',
  [APPLICATION_STATUS.SELECTED]: 'SELECTED',
  [APPLICATION_STATUS.REJECTED]: 'REJECTED',
};

// POST /api/applications  { jobId }  (student)
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) throw new ApiError(400, 'jobId is required');

  const [job, student] = await Promise.all([
    JobModel.findById(jobId).populate('companyId', 'name'),
    StudentModel.findOne({ userId: req.user.id }),
  ]);
  if (!job) throw new ApiError(404, 'Job not found');
  if (!student) throw new ApiError(404, 'Student profile not found');

  if (!job.isActive || job.deadline < new Date()) {
    throw new ApiError(400, 'This job is no longer accepting applications');
  }

  const eligibility = checkEligibility(student, job);
  if (!eligibility.eligible) {
    throw new ApiError(400, `You are not eligible for this job: ${eligibility.reasons.join('; ')}`);
  }

  const existing = await ApplicationModel.findOne({ studentId: student._id, jobId });
  if (existing) throw new ApiError(409, 'You have already applied to this job');

  const application = await ApplicationModel.create({ studentId: student._id, jobId });

  await logActivity(req.user.id, 'APPLICATION_SUBMITTED', `Applied to "${job.title}" at ${job.companyId?.name || 'a company'}`);

  return res.status(201).json(new ApiResponse(201, { application }, 'Application submitted'));
});

// GET /api/applications/me (student) — query: status
export const myApplications = asyncHandler(async (req, res) => {
  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const match = { studentId: student._id };
  if (req.query.status) match.status = req.query.status;

  const applications = await ApplicationModel.find(match)
    .populate({ path: 'jobId', populate: { path: 'companyId', select: 'name logo location' } })
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { applications }, 'Applications fetched'));
});

// GET /api/applications/job/:jobId (recruiter who owns job, or admin)
export const applicationsForJob = asyncHandler(async (req, res) => {
  const job = await JobModel.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  if (req.user.role === ROLES.RECRUITER && job.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to view applicants for this job');
  }

  const match = { jobId: job._id };
  if (req.query.status) match.status = req.query.status;

  const applications = await ApplicationModel.find(match)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email profilePicture' } })
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { job, applications }, 'Applicants fetched'));
});

// GET /api/applications (admin) — query: status, jobId, studentId, page, limit
export const listAllApplications = asyncHandler(async (req, res) => {
  const { status, jobId, studentId, page = 1, limit = 20 } = req.query;
  const match = {};
  if (status) match.status = status;
  if (jobId) match.jobId = jobId;
  if (studentId) match.studentId = studentId;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [applications, total] = await Promise.all([
    ApplicationModel.find(match)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'jobId', populate: { path: 'companyId', select: 'name logo' } })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ApplicationModel.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      applications,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Applications fetched')
  );
});

// PATCH /api/applications/:id/status  { status }  (recruiter who owns job, or admin)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new ApiError(400, 'status is required');

  const application = await ApplicationModel.findById(req.params.id)
    .populate('jobId')
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } });
  if (!application) throw new ApiError(404, 'Application not found');

  if (req.user.role === ROLES.RECRUITER && application.jobId.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to update this application');
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[application.status] || [];
  if (status !== application.status && !allowedNext.includes(status)) {
    throw new ApiError(400, `Cannot move from "${application.status}" to "${status}". Allowed next: ${allowedNext.join(', ') || 'none'}`);
  }

  application.status = status;
  application.statusHistory.push({ status, changedAt: new Date() });
  await application.save();

  await logActivity(
    req.user.id,
    'APPLICATION_STATUS_CHANGED',
    `Moved ${application.studentId?.userId?.name || 'a candidate'}'s application for "${application.jobId.title}" to ${status}`
  );

  const notifType = STATUS_NOTIFICATION_TYPE[status];
  if (notifType && application.studentId?.userId?._id) {
    await createNotification({
      userId: application.studentId.userId._id,
      title: `Application status updated: ${status}`,
      message: `Your application for "${application.jobId.title}" is now "${status}".`,
      type: notifType,
    });
  }

  return res.status(200).json(new ApiResponse(200, { application }, 'Application status updated'));
});
