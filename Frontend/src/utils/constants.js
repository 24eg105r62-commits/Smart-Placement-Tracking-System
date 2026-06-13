export const ROLES = Object.freeze({ ADMIN: 'ADMIN', STUDENT: 'STUDENT', RECRUITER: 'RECRUITER' });

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
];

export const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
});

export const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUS);

export const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.APPLIED]: [APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.SHORTLISTED]: [APPLICATION_STATUS.INTERVIEW_SCHEDULED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: [APPLICATION_STATUS.SELECTED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.SELECTED]: [],
  [APPLICATION_STATUS.REJECTED]: [],
});

export const BRANCH_OPTIONS = BRANCHES.map((b) => ({ value: b, label: b }));

export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUS_VALUES.map((s) => ({ value: s, label: s }));
