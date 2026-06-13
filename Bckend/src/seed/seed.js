// Wipes and repopulates the local database with realistic test data for manual testing & demos.
// Run with: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { StudentModel } from '../models/Student.js';
import { RecruiterModel } from '../models/Recruiter.js';
import { CompanyModel } from '../models/Company.js';
import { JobModel } from '../models/Job.js';
import { ApplicationModel } from '../models/Application.js';
import { NotificationModel } from '../models/Notification.js';
import { ActivityModel } from '../models/Activity.js';
import { ROLES } from '../constants/roles.js';
import { APPLICATION_STATUS } from '../constants/applicationStatus.js';
import { BRANCHES } from '../constants/branches.js';

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const monthsAgo = (n) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
const pickOne = (arr) => shuffle(arr)[0];
const pickMany = (arr, n) => shuffle(arr).slice(0, n);

const SKILL_POOL = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'AWS', 'Docker', 'C++', 'Machine Learning', 'Data Structures', 'TypeScript', 'Spring Boot', 'Figma'];

const STUDENTS = [
  { name: 'Asha Rao', email: 'asha.rao@vsmart.test', rollNumber: 'CSE2021001', branch: 'Computer Science', cgpa: 8.9 },
  { name: 'Bharath Iyer', email: 'bharath.iyer@vsmart.test', rollNumber: 'ITE2021002', branch: 'Information Technology', cgpa: 7.6 },
  { name: 'Chitra Menon', email: 'chitra.menon@vsmart.test', rollNumber: 'ECE2021003', branch: 'Electronics & Communication', cgpa: 8.2 },
  { name: 'Dev Patel', email: 'dev.patel@vsmart.test', rollNumber: 'CSE2021004', branch: 'Computer Science', cgpa: 6.8 },
  { name: 'Esha Kapoor', email: 'esha.kapoor@vsmart.test', rollNumber: 'MEC2021005', branch: 'Mechanical Engineering', cgpa: 7.1 },
  { name: 'Farhan Sheikh', email: 'farhan.sheikh@vsmart.test', rollNumber: 'CSE2021006', branch: 'Computer Science', cgpa: 9.2 },
  { name: 'Gauri Nair', email: 'gauri.nair@vsmart.test', rollNumber: 'ITE2021007', branch: 'Information Technology', cgpa: 8.5 },
  { name: 'Harsh Verma', email: 'harsh.verma@vsmart.test', rollNumber: 'EEE2021008', branch: 'Electrical Engineering', cgpa: 7.9 },
  { name: 'Isha Joshi', email: 'isha.joshi@vsmart.test', rollNumber: 'CIV2021009', branch: 'Civil Engineering', cgpa: 7.4 },
  { name: 'Jatin Malhotra', email: 'jatin.malhotra@vsmart.test', rollNumber: 'CSE2021010', branch: 'Computer Science', cgpa: 8.7 },
];

const RECRUITERS = [
  { name: 'Karan Shah', email: 'karan.shah@techcorp.test', designation: 'Talent Acquisition Lead', company: { name: 'TechCorp Solutions', industry: 'Information Technology', location: 'Bengaluru', website: 'https://techcorp.test', description: 'A fast-growing software services company building cloud-native products.' } },
  { name: 'Lavanya Pillai', email: 'lavanya.pillai@finedge.test', designation: 'HR Manager', company: { name: 'FinEdge Analytics', industry: 'Financial Services', location: 'Mumbai', website: 'https://finedge.test', description: 'Data-driven fintech analytics and risk modeling.' } },
  { name: 'Manoj Kulkarni', email: 'manoj.kulkarni@buildwise.test', designation: 'Recruitment Specialist', company: { name: 'BuildWise Infra', industry: 'Construction & Infrastructure', location: 'Pune', website: 'https://buildwise.test', description: 'Engineering large-scale infrastructure projects across India.' } },
  { name: 'Neha Bhatt', email: 'neha.bhatt@nimbuscloud.test', designation: 'People Operations', company: { name: 'NimbusCloud', industry: 'Cloud Computing', location: 'Hyderabad', website: 'https://nimbuscloud.test', description: 'Cloud infrastructure and DevOps tooling for modern enterprises.' } },
  { name: 'Omkar Deshmukh', email: 'omkar.deshmukh@autodrive.test', designation: 'Campus Hiring Manager', company: { name: 'AutoDrive Robotics', industry: 'Automotive & Robotics', location: 'Chennai', website: 'https://autodrive.test', description: 'Building the next generation of autonomous mobility systems.' } },
];

const JOB_TEMPLATES = [
  { title: 'Software Engineer Intern', package: 6, location: 'Bengaluru', eligibilityCgpa: 7, eligibleBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['JavaScript', 'React', 'Node.js'] },
  { title: 'Backend Developer', package: 12, location: 'Bengaluru', eligibilityCgpa: 7.5, eligibleBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['Node.js', 'MongoDB', 'SQL'] },
  { title: 'Data Analyst', package: 9, location: 'Mumbai', eligibilityCgpa: 7, eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication'], requiredSkills: ['Python', 'SQL', 'Machine Learning'] },
  { title: 'Site Engineer', package: 7, location: 'Pune', eligibilityCgpa: 6.5, eligibleBranches: ['Civil Engineering'], requiredSkills: ['AutoCAD', 'Data Structures'] },
  { title: 'Cloud Engineer', package: 14, location: 'Hyderabad', eligibilityCgpa: 8, eligibleBranches: ['Computer Science', 'Information Technology', 'Electrical Engineering'], requiredSkills: ['AWS', 'Docker', 'Python'] },
  { title: 'Robotics Software Engineer', package: 16, location: 'Chennai', eligibilityCgpa: 8, eligibleBranches: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering'], requiredSkills: ['C++', 'Python', 'Machine Learning'] },
  { title: 'Frontend Developer', package: 10, location: 'Bengaluru', eligibilityCgpa: 7, eligibleBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['React', 'TypeScript', 'Figma'] },
  { title: 'DevOps Engineer', package: 13, location: 'Hyderabad', eligibilityCgpa: 7.5, eligibleBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['AWS', 'Docker', 'Node.js'] },
  { title: 'QA Engineer', package: 7.5, location: 'Mumbai', eligibilityCgpa: 6.5, eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication'], requiredSkills: ['SQL', 'Java'] },
  { title: 'Embedded Systems Engineer', package: 11, location: 'Chennai', eligibilityCgpa: 7.5, eligibleBranches: ['Electronics & Communication', 'Electrical Engineering'], requiredSkills: ['C++', 'Data Structures'] },
];

const STATUS_ORDER = [APPLICATION_STATUS.APPLIED, APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.INTERVIEW_SCHEDULED, APPLICATION_STATUS.SELECTED];

const buildHistory = (finalStatus) => {
  const history = [];
  let cursor = monthsAgo(3);
  const stepDays = 12;

  if (finalStatus === APPLICATION_STATUS.REJECTED) {
    history.push({ status: APPLICATION_STATUS.APPLIED, changedAt: cursor });
    cursor = new Date(cursor.getTime() + stepDays * 24 * 60 * 60 * 1000);
    history.push({ status: APPLICATION_STATUS.REJECTED, changedAt: cursor });
    return history;
  }

  const finalIndex = STATUS_ORDER.indexOf(finalStatus);
  for (let i = 0; i <= finalIndex; i += 1) {
    history.push({ status: STATUS_ORDER[i], changedAt: cursor });
    cursor = new Date(cursor.getTime() + stepDays * 24 * 60 * 60 * 1000);
  }
  return history;
};

const run = async () => {
  await connectDB();
  console.log('Connected. Wiping existing collections...');

  await Promise.all([
    UserModel.deleteMany({}),
    StudentModel.deleteMany({}),
    RecruiterModel.deleteMany({}),
    CompanyModel.deleteMany({}),
    JobModel.deleteMany({}),
    ApplicationModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    ActivityModel.deleteMany({}),
  ]);

  console.log('Creating admin...');
  const admin = await UserModel.create({
    name: 'Placement Admin',
    email: 'admin@vsmart.test',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    isVerified: true,
  });

  console.log('Creating students...');
  const students = [];
  for (const s of STUDENTS) {
    const user = await UserModel.create({ name: s.name, email: s.email, password: 'Student@123', role: ROLES.STUDENT, isVerified: true });
    const student = await StudentModel.create({
      userId: user._id,
      rollNumber: s.rollNumber,
      branch: s.branch,
      cgpa: s.cgpa,
      skills: pickMany(SKILL_POOL, 5),
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      graduationYear: 2026,
    });
    students.push({ user, student });
  }

  console.log('Creating recruiters & companies...');
  const recruiters = [];
  for (const r of RECRUITERS) {
    const user = await UserModel.create({ name: r.name, email: r.email, password: 'Recruiter@123', role: ROLES.RECRUITER, isVerified: true });
    const company = await CompanyModel.create({ ...r.company, createdBy: user._id });
    const recruiter = await RecruiterModel.create({
      userId: user._id,
      companyName: r.company.name,
      designation: r.designation,
      companyId: company._id,
    });
    recruiters.push({ user, company, recruiter });
  }

  console.log('Creating jobs...');
  const jobs = [];
  for (let i = 0; i < JOB_TEMPLATES.length; i += 1) {
    const tmpl = JOB_TEMPLATES[i];
    const owner = recruiters[i % recruiters.length];
    const job = await JobModel.create({
      ...tmpl,
      companyId: owner.company._id,
      postedBy: owner.user._id,
      description: `${owner.company.name} is hiring for the role of ${tmpl.title}. Join our team and work on impactful, large-scale products.`,
      deadline: daysFromNow(5 + i * 4),
    });
    jobs.push(job);
  }

  console.log('Creating applications across the status pipeline...');
  const finalStatuses = [
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.APPLIED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED,
  ];

  let statusCursor = 0;
  const notifications = [];
  for (const { user, student } of students) {
    const eligibleJobs = jobs.filter((job) => student.cgpa >= job.eligibilityCgpa && job.eligibleBranches.includes(student.branch));
    const targets = pickMany(eligibleJobs.length ? eligibleJobs : jobs, Math.min(3, Math.max(1, eligibleJobs.length)));

    for (const job of targets) {
      const finalStatus = finalStatuses[statusCursor % finalStatuses.length];
      statusCursor += 1;
      const history = buildHistory(finalStatus);

      await ApplicationModel.create({
        studentId: student._id,
        jobId: job._id,
        status: finalStatus,
        appliedAt: history[0].changedAt,
        statusHistory: history,
        createdAt: history[0].changedAt,
        updatedAt: history[history.length - 1].changedAt,
      });

      if (finalStatus !== APPLICATION_STATUS.APPLIED) {
        notifications.push({
          userId: user._id,
          title: `Application status updated: ${finalStatus}`,
          message: `Your application for "${job.title}" is now "${finalStatus}".`,
          type: finalStatus === APPLICATION_STATUS.SHORTLISTED ? 'SHORTLISTED'
            : finalStatus === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'INTERVIEW_SCHEDULED'
            : finalStatus === APPLICATION_STATUS.SELECTED ? 'SELECTED' : 'REJECTED',
          isRead: Math.random() > 0.5,
        });
      }
    }

    notifications.push({
      userId: user._id,
      title: 'New job posted',
      message: `${pickOne(jobs).title} — a new opportunity matching your profile was posted.`,
      type: 'JOB_POSTED',
      isRead: Math.random() > 0.6,
    });
  }

  // Mongoose pre-save timestamps would override our backdated values via {timestamps:true} on create();
  // Force the desired createdAt/updatedAt directly so seeded charts show a spread across months.
  for (const { student } of students) {
    const apps = await ApplicationModel.find({ studentId: student._id });
    for (const app of apps) {
      await ApplicationModel.collection.updateOne(
        { _id: app._id },
        { $set: { createdAt: app.statusHistory[0].changedAt, updatedAt: app.statusHistory[app.statusHistory.length - 1].changedAt } }
      );
    }
  }

  if (notifications.length) await NotificationModel.insertMany(notifications);

  console.log('Seeding activity logs...');
  const activities = [];
  for (const { user } of students) {
    activities.push({ userId: user._id, action: 'REGISTER', description: `${user.name} registered as STUDENT`, timestamp: monthsAgo(3) });
    activities.push({ userId: user._id, action: 'LOGIN', description: `${user.name} logged in`, timestamp: daysFromNow(-1) });
  }
  for (const { user, company } of recruiters) {
    activities.push({ userId: user._id, action: 'REGISTER', description: `${user.name} registered as RECRUITER`, timestamp: monthsAgo(3) });
    activities.push({ userId: user._id, action: 'COMPANY_CREATED', description: `Created company "${company.name}"`, timestamp: monthsAgo(3) });
  }
  await ActivityModel.insertMany(activities);

  console.log('\nSeed complete! Sign in with:');
  console.log('  Admin:      admin@vsmart.test / Admin@123');
  console.log('  Student:    asha.rao@vsmart.test / Student@123');
  console.log('  Recruiter:  karan.shah@techcorp.test / Recruiter@123');
  console.log(`\nCreated: 1 admin, ${students.length} students, ${recruiters.length} recruiters/companies, ${jobs.length} jobs, ${await ApplicationModel.countDocuments()} applications.`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
