import { UserModel } from '../models/User.js';
import { StudentModel } from '../models/Student.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { CompanyModel } from '../models/Company.js';
import { JobModel } from '../models/Job.js';
import { ApplicationModel } from '../models/Application.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APPLICATION_STATUS } from '../constants/applicationStatus.js';
import { ROLES } from '../constants/roles.js';

const countByStatus = async (match) => {
  const rows = await ApplicationModel.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = {};
  rows.forEach((r) => { result[r._id] = r.count; });
  return result;
};

// GET /api/dashboard/student
export const studentDashboard = asyncHandler(async (req, res) => {
  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const statusCounts = await countByStatus({ studentId: student._id });

  const cards = {
    applied: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    shortlisted: statusCounts[APPLICATION_STATUS.SHORTLISTED] || 0,
    interviews: statusCounts[APPLICATION_STATUS.INTERVIEW_SCHEDULED] || 0,
    selected: statusCounts[APPLICATION_STATUS.SELECTED] || 0,
  };

  const recentApplications = await ApplicationModel.find({ studentId: student._id })
    .populate({ path: 'jobId', populate: { path: 'companyId', select: 'name logo' } })
    .sort({ createdAt: -1 })
    .limit(5);

  const appliedJobIds = await ApplicationModel.find({ studentId: student._id }).distinct('jobId');
  const now = new Date();
  const upcomingDeadlines = await JobModel.find({
    isActive: true,
    deadline: { $gte: now },
    _id: { $nin: appliedJobIds },
  })
    .populate('companyId', 'name logo')
    .sort({ deadline: 1 })
    .limit(5);

  return res.status(200).json(new ApiResponse(200, { cards, recentApplications, upcomingDeadlines }, 'Student dashboard'));
});

// GET /api/dashboard/recruiter
export const recruiterDashboard = asyncHandler(async (req, res) => {
  const jobs = await JobModel.find({ postedBy: req.user.id }).select('_id title isActive deadline');
  const jobIds = jobs.map((j) => j._id);
  const now = new Date();

  const activeJobs = jobs.filter((j) => j.isActive && j.deadline >= now).length;

  const statusCounts = await countByStatus({ jobId: { $in: jobIds } });
  const totalApplicants = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const cards = {
    activeJobs,
    totalApplicants,
    shortlisted: statusCounts[APPLICATION_STATUS.SHORTLISTED] || 0,
    hired: statusCounts[APPLICATION_STATUS.SELECTED] || 0,
  };

  const applicantStatistics = Object.values(APPLICATION_STATUS).map((status) => ({
    status,
    count: statusCounts[status] || 0,
  }));

  const jobWiseApplicants = await ApplicationModel.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
    { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
    { $unwind: '$job' },
    { $project: { _id: 0, jobId: '$_id', title: '$job.title', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(new ApiResponse(200, { cards, applicantStatistics, jobWiseApplicants }, 'Recruiter dashboard'));
});

// GET /api/dashboard/admin
export const adminDashboard = asyncHandler(async (req, res) => {
  const [totalStudents, totalRecruiters, totalCompanies, totalJobs, totalApplications, selectedCount] = await Promise.all([
    UserModel.countDocuments({ role: ROLES.STUDENT }),
    UserModel.countDocuments({ role: ROLES.RECRUITER }),
    CompanyModel.countDocuments(),
    JobModel.countDocuments(),
    ApplicationModel.countDocuments(),
    ApplicationModel.countDocuments({ status: APPLICATION_STATUS.SELECTED }),
  ]);

  const placedStudentIds = await ApplicationModel.distinct('studentId', { status: APPLICATION_STATUS.SELECTED });
  const placementPercentage = totalStudents > 0
    ? Number(((placedStudentIds.length / totalStudents) * 100).toFixed(1))
    : 0;

  const cards = {
    totalStudents,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    totalApplications,
    placementPercentage,
    totalSelected: selectedCount,
  };

  // Chart 1: Placements (selected applications) grouped by student branch
  const placementsByBranchRaw = await ApplicationModel.aggregate([
    { $match: { status: APPLICATION_STATUS.SELECTED } },
    { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
    { $unwind: '$student' },
    { $group: { _id: '$student.branch', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const placementsByBranch = placementsByBranchRaw.map((r) => ({ branch: r._id || 'Unspecified', count: r.count }));

  // Chart 2: Applications received per company
  const applicationsPerCompanyRaw = await ApplicationModel.aggregate([
    { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
    { $unwind: '$job' },
    { $lookup: { from: 'companies', localField: 'job.companyId', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    { $group: { _id: '$company.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  const applicationsPerCompany = applicationsPerCompanyRaw.map((r) => ({ company: r._id, count: r.count }));

  // Chart 3: Monthly placements (selected applications grouped by month of status change to Selected)
  const monthlyPlacementsRaw = await ApplicationModel.aggregate([
    { $match: { status: APPLICATION_STATUS.SELECTED } },
    { $project: { yearMonth: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } },
    { $group: { _id: '$yearMonth', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const monthlyPlacements = monthlyPlacementsRaw.map((r) => ({ month: r._id, count: r.count }));

  return res.status(200).json(
    new ApiResponse(200, {
      cards,
      charts: { placementsByBranch, applicationsPerCompany, monthlyPlacements },
    }, 'Admin dashboard')
  );
});
