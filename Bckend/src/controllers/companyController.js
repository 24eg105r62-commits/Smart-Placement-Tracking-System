import { CompanyModel } from '../models/Company.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activityService.js';
import { ROLES } from '../constants/roles.js';

// POST /api/companies (recruiter creates their company; admin can create any)
export const createCompany = asyncHandler(async (req, res) => {
  const { name, description, website, location, industry } = req.body;
  if (!name) throw new ApiError(400, 'Company name is required');

  const company = await CompanyModel.create({
    name,
    description,
    website,
    location,
    industry,
    createdBy: req.user.id,
  });

  if (req.user.role === ROLES.RECRUITER) {
    await RecruiterModel.findOneAndUpdate({ userId: req.user.id }, { companyId: company._id, companyName: company.name });
  }

  await logActivity(req.user.id, 'COMPANY_CREATED', `Created company "${company.name}"`);

  return res.status(201).json(new ApiResponse(201, { company }, 'Company created'));
});

// GET /api/companies — search & filter (any authenticated user)
// query: search (name/industry/location), industry, location, page, limit
export const listCompanies = asyncHandler(async (req, res) => {
  const { search, industry, location, page = 1, limit = 20 } = req.query;
  const match = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    match.$or = [{ name: regex }, { industry: regex }, { location: regex }];
  }
  if (industry) match.industry = new RegExp(`^${industry}$`, 'i');
  if (location) match.location = new RegExp(`^${location}$`, 'i');

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [companies, total] = await Promise.all([
    CompanyModel.find(match).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    CompanyModel.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      companies,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Companies fetched')
  );
});

// GET /api/companies/:id
export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await CompanyModel.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  return res.status(200).json(new ApiResponse(200, { company }, 'Company fetched'));
});

const assertCanManageCompany = async (req, company) => {
  if (req.user.role === ROLES.ADMIN) return;
  if (req.user.role === ROLES.RECRUITER) {
    const recruiter = await RecruiterModel.findOne({ userId: req.user.id });
    if (recruiter && recruiter.companyId && recruiter.companyId.toString() === company._id.toString()) return;
  }
  throw new ApiError(403, 'You do not have permission to manage this company');
};

// PUT /api/companies/:id
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await CompanyModel.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  await assertCanManageCompany(req, company);

  const { name, description, website, location, industry } = req.body;
  if (name !== undefined) company.name = name;
  if (description !== undefined) company.description = description;
  if (website !== undefined) company.website = website;
  if (location !== undefined) company.location = location;
  if (industry !== undefined) company.industry = industry;

  await company.save();

  return res.status(200).json(new ApiResponse(200, { company }, 'Company updated'));
});

// POST /api/companies/:id/logo (multipart form field "logo")
export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  const company = await CompanyModel.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  await assertCanManageCompany(req, company);

  if (!req.file) throw new ApiError(400, 'No logo file uploaded');

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'vsmart/company-logos',
    resourceType: 'image',
  });

  company.logo = result.secure_url;
  await company.save();

  return res.status(200).json(new ApiResponse(200, { logo: company.logo }, 'Logo uploaded'));
});

// DELETE /api/companies/:id (admin only)
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await CompanyModel.findByIdAndDelete(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  return res.status(200).json(new ApiResponse(200, null, 'Company deleted'));
});
