import { StudentModel } from '../models/Student.js';
import { UserModel } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activityService.js';
import { parseResume } from '../utils/resumeParser.js';

const STUDENT_PROFILE_FIELDS = ['rollNumber', 'branch', 'cgpa', 'skills', 'phone', 'graduationYear'];

const findStudentByUserId = async (userId) => {
  const student = await StudentModel.findOne({ userId }).populate('userId', 'name email role profilePicture isVerified');
  if (!student) throw new ApiError(404, 'Student profile not found');
  return student;
};

// GET /api/students/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const student = await findStudentByUserId(req.user.id);
  return res.status(200).json(new ApiResponse(200, { student }, 'Profile fetched'));
});

// PUT /api/students/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  STUDENT_PROFILE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = field === 'skills' && typeof req.body[field] === 'string'
        ? req.body[field].split(',').map((s) => s.trim()).filter(Boolean)
        : req.body[field];
    }
  });

  await student.save();
  await logActivity(req.user.id, 'PROFILE_UPDATED', 'Updated student profile');

  return res.status(200).json(new ApiResponse(200, { student }, 'Profile updated'));
});

// POST /api/students/me/picture (multipart form field "picture")
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file uploaded');

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'vsmart/profile-pictures',
    resourceType: 'image',
  });

  const user = await UserModel.findByIdAndUpdate(
    req.user.id,
    { profilePicture: result.secure_url },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, { profilePicture: user.profilePicture }, 'Profile picture uploaded'));
});

// POST /api/students/me/resume (multipart form field "resume")
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file uploaded');

  // Parse PDF and upload to Cloudinary in parallel
  const [parsed, result] = await Promise.all([
    parseResume(req.file.buffer),
    uploadBufferToCloudinary(req.file.buffer, { folder: 'vsmart/resumes', resourceType: 'raw' }),
  ]);

  // Build update — only overwrite fields that were blank / zero on the profile
  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const update = { resumeUrl: result.secure_url };
  if (parsed.cgpa           && !student.cgpa)           update.cgpa           = parsed.cgpa;
  if (parsed.phone          && !student.phone)          update.phone          = parsed.phone;
  if (parsed.branch         && !student.branch)         update.branch         = parsed.branch;
  if (parsed.graduationYear && !student.graduationYear) update.graduationYear = parsed.graduationYear;
  // Merge skills — add extracted ones not already in profile
  if (parsed.skills.length) {
    const existing = new Set((student.skills || []).map((s) => s.toLowerCase()));
    const newSkills = parsed.skills.filter((s) => !existing.has(s.toLowerCase()));
    if (newSkills.length) update.skills = [...(student.skills || []), ...newSkills];
  }

  const updated = await StudentModel.findOneAndUpdate({ userId: req.user.id }, update, { new: true });

  await logActivity(req.user.id, 'PROFILE_UPDATED', 'Uploaded resume');

  return res.status(200).json(
    new ApiResponse(200, {
      resumeUrl: updated.resumeUrl,
      extracted: {
        cgpa:           parsed.cgpa,
        phone:          parsed.phone,
        branch:         parsed.branch,
        graduationYear: parsed.graduationYear,
        skills:         parsed.skills,
      },
      profile: {
        cgpa:           updated.cgpa,
        phone:          updated.phone,
        branch:         updated.branch,
        graduationYear: updated.graduationYear,
        skills:         updated.skills,
      },
    }, 'Resume uploaded and profile auto-filled')
  );
});

// DELETE /api/students/me/resume
export const removeResume = asyncHandler(async (req, res) => {
  const student = await StudentModel.findOne({ userId: req.user.id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  if (!student.resumeUrl) throw new ApiError(400, 'No resume on file');

  const urlToDelete = student.resumeUrl;

  // Clear DB first — always succeeds regardless of Cloudinary outcome
  student.resumeUrl = '';
  await student.save();

  // Best-effort Cloudinary deletion — don't let it block the response
  deleteFromCloudinary(urlToDelete, 'raw').catch(() => {});

  await logActivity(req.user.id, 'PROFILE_UPDATED', 'Removed resume');
  return res.status(200).json(new ApiResponse(200, {}, 'Resume removed'));
});

// GET /api/students  (admin only) — search & filter
// query: search (name/email/rollNumber), branch, minCgpa, maxCgpa, skills (comma separated), page, limit
export const listStudents = asyncHandler(async (req, res) => {
  const { search, branch, minCgpa, maxCgpa, skills, page = 1, limit = 20 } = req.query;

  const studentMatch = {};
  if (branch) studentMatch.branch = branch;
  if (minCgpa || maxCgpa) {
    studentMatch.cgpa = {};
    if (minCgpa) studentMatch.cgpa.$gte = Number(minCgpa);
    if (maxCgpa) studentMatch.cgpa.$lte = Number(maxCgpa);
  }
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length) studentMatch.skills = { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) };
  }

  let userIds = null;
  if (search) {
    const regex = new RegExp(search, 'i');
    const matchingUsers = await UserModel.find({ $or: [{ name: regex }, { email: regex }] }).select('_id');
    const matchingByRoll = await StudentModel.find({ rollNumber: regex }).select('userId');
    userIds = [...matchingUsers.map((u) => u._id), ...matchingByRoll.map((s) => s.userId)];
    studentMatch.userId = { $in: userIds };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [students, total] = await Promise.all([
    StudentModel.find(studentMatch)
      .populate('userId', 'name email profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    StudentModel.countDocuments(studentMatch),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      students,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Students fetched')
  );
});

// GET /api/students/:id (admin)
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await StudentModel.findById(req.params.id).populate('userId', 'name email profilePicture isVerified role');
  if (!student) throw new ApiError(404, 'Student not found');
  return res.status(200).json(new ApiResponse(200, { student }, 'Student fetched'));
});
