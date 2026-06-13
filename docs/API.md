# vSmart Placement — API Reference

Base URL: `http://localhost:5001/api` (configurable via `PORT` in `Bckend/.env`)

All responses are wrapped in a consistent envelope:

```json
// Success
{ "success": true, "statusCode": 200, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": [] }
```

## Authentication

Two tokens are issued on login/register/refresh:
- **Access token** — short-lived JWT (default 15m), returned in the response body. Send it as `Authorization: Bearer <token>` on every protected request.
- **Refresh token** — longer-lived JWT (default 7d), set as an `httpOnly` cookie. `POST /auth/refresh` reads this cookie and issues a new access token (rotation).

Routes marked **🔒** require a valid access token. Routes marked with a role (`STUDENT` / `RECRUITER` / `ADMIN`) additionally require the authenticated user to have that role — otherwise the API responds `403 Forbidden`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | — | `{ name, email, password, role? }` | Create an account. `role` defaults to `STUDENT`; must be one of `ADMIN`, `STUDENT`, `RECRUITER`. Returns `{ user, accessToken }` and sets the refresh-token cookie. Also creates the matching `Student`/`Recruiter` profile document. |
| POST | `/login` | — | `{ email, password }` | Authenticate and receive `{ user, accessToken }` + refresh cookie. |
| POST | `/refresh` | — (cookie) | — | Reads the refresh cookie, rotates it, and returns a new `{ user, accessToken }`. `401` if missing/expired. |
| POST | `/logout` | — | — | Clears the refresh-token cookie. |
| GET | `/me` | 🔒 | — | Returns the current authenticated user (`{ user }`). |

---

## Students — `/api/students`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/me` | 🔒 STUDENT | — | Get my student profile (populated with user info). |
| PUT | `/me` | 🔒 STUDENT | `{ rollNumber?, branch?, cgpa?, skills?, phone?, graduationYear? }` | Update profile fields. `skills` may be a comma-separated string or array. |
| POST | `/me/picture` | 🔒 STUDENT | multipart `picture` (image) | Upload profile picture → Cloudinary, stores `secure_url` on the user. |
| POST | `/me/resume` | 🔒 STUDENT | multipart `resume` (PDF) | Upload resume → Cloudinary (`resourceType: raw`), stores `resumeUrl`. |
| GET | `/` | 🔒 ADMIN | query: `search, branch, minCgpa, maxCgpa, skills, page, limit` | Paginated, searchable/filterable student list. `search` matches name, email, or roll number; `skills` is comma-separated. Returns `{ students, pagination }`. |
| GET | `/:id` | 🔒 ADMIN | — | Single student profile by id. |

---

## Recruiters — `/api/recruiters`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/me` | 🔒 RECRUITER | — | Get my recruiter profile (with populated `companyId`). |
| PUT | `/me` | 🔒 RECRUITER | `{ companyName?, designation? }` | Update recruiter profile fields. |
| GET | `/` | 🔒 ADMIN | query: `search, page, limit` | Paginated recruiter list. Returns `{ recruiters, pagination }`. |
| GET | `/:id` | 🔒 ADMIN | — | Single recruiter profile by id. |

---

## Companies — `/api/companies`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/` | 🔒 | query: `search, industry, location, page, limit` | Paginated company list (any authenticated role). Returns `{ companies, pagination }`. |
| GET | `/:id` | 🔒 | — | Single company by id. |
| POST | `/` | 🔒 RECRUITER, ADMIN | `{ name, description?, website?, location?, industry? }` | Create a company. If the caller is a recruiter, their profile is linked to the new company automatically. |
| PUT | `/:id` | 🔒 RECRUITER, ADMIN | `{ name?, description?, website?, location?, industry? }` | Update a company. Recruiters may only edit their own company; admins may edit any. |
| POST | `/:id/logo` | 🔒 RECRUITER, ADMIN | multipart `logo` (image) | Upload/replace company logo via Cloudinary. |
| DELETE | `/:id` | 🔒 ADMIN | — | Delete a company (admin only). |

---

## Jobs — `/api/jobs`

> Note: route order matters server-side — `/deadlines/upcoming` and `/recruiter/mine` are registered before the generic `/:id` route.

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/deadlines/upcoming` | 🔒 | query: `days` (default 7) | Active jobs whose deadline falls within the next N days, soonest first. |
| GET | `/recruiter/mine` | 🔒 RECRUITER | — | Jobs posted by the current recruiter. |
| GET | `/` | 🔒 | query: `search, minPackage, maxPackage, location, skills, activeOnly, page, limit` | Paginated, searchable/filterable job list. `search` matches job title or company name; `skills` is comma-separated; `activeOnly=true` restricts to active jobs with a future deadline. Returns `{ jobs, pagination }` (each job populated with `companyId`). |
| POST | `/` | 🔒 RECRUITER, ADMIN | `{ title, description?, package, location?, eligibilityCgpa?, eligibleBranches?, requiredSkills?, deadline, companyId? }` | Create a job posting. Recruiters must already have a company (the job is linked to it automatically); admins must supply `companyId`. Triggers `JOB_POSTED` notifications to every eligible student (matching CGPA/branch). `package`, `title`, and `deadline` are required. |
| GET | `/:id` | 🔒 | — | Single job by id (populated with company). |
| GET | `/:id/eligibility` | 🔒 STUDENT | — | Runs the eligibility checker for the current student against this job. Returns `{ eligible, status, checks: { cgpa, branch, skills }, reasons }` (see [Eligibility shape](#eligibility-result-shape)). |
| PUT | `/:id` | 🔒 RECRUITER, ADMIN | any subset of `{ title, description, package, location, eligibilityCgpa, eligibleBranches, requiredSkills, deadline, isActive }` | Update a job. Recruiters may only edit jobs they posted; admins may edit any job. |
| DELETE | `/:id` | 🔒 RECRUITER, ADMIN | — | Delete a job. Same ownership rule as `PUT`. |

### Eligibility result shape

```json
{
  "eligible": false,
  "status": "Not Eligible",
  "checks": {
    "cgpa":   { "required": 7.5, "actual": 8.9, "passed": true },
    "branch": { "required": ["Computer Science", "Information Technology"], "actual": "Computer Science", "passed": true },
    "skills": { "required": ["React", "Node.js", "C++"], "missing": ["C++"], "passed": false }
  },
  "reasons": ["Missing required skill(s): C++"]
}
```

---

## Applications — `/api/applications`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| POST | `/` | 🔒 STUDENT | `{ jobId }` | Apply to a job. Server re-checks eligibility (`400` with `reasons` if ineligible) and rejects duplicate applications (`409 "You have already applied to this job"`). Creates the application with an initial `statusHistory` entry (`Applied`). |
| GET | `/me` | 🔒 STUDENT | query: `status?` | My applications, populated with job + company + status history. |
| GET | `/job/:jobId` | 🔒 RECRUITER, ADMIN | query: `status?, page, limit` | Applicants for a specific job. Recruiters may only view jobs they posted; admins may view any. Returns `{ job, applications }`. |
| GET | `/` | 🔒 ADMIN | query: `status, jobId, studentId, page, limit` | Every application platform-wide, populated with student (+ user) and job (+ company). Returns `{ applications, pagination }`. |
| PATCH | `/:id/status` | 🔒 RECRUITER, ADMIN | `{ status }` | Move an application to a new status. Only transitions in `ALLOWED_STATUS_TRANSITIONS` are permitted (see below); invalid transitions return `400`. Appends to `statusHistory`, notifies the student, and writes an `APPLICATION_STATUS_CHANGED` activity entry. |

### Status workflow (`ALLOWED_STATUS_TRANSITIONS`)

```
Applied              → Shortlisted | Rejected
Shortlisted          → Interview Scheduled | Rejected
Interview Scheduled  → Selected | Rejected
Selected             → (terminal)
Rejected             → (terminal)
```

---

## Notifications — `/api/notifications`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/me` | 🔒 | query: `unreadOnly?, page, limit` | My notifications, newest first. Returns `{ notifications, unreadCount, pagination }`. |
| PATCH | `/:id/read` | 🔒 | — | Mark a single notification as read. |
| PATCH | `/read-all` | 🔒 | — | Mark all of my notifications as read. |
| POST | `/send` | 🔒 ADMIN | `{ title, message, audience?, userIds? }` | Broadcast a notification. `audience` is one of `ALL` (default), `STUDENT`, `RECRUITER`, `ADMIN`; or pass an explicit `userIds` array to target specific users. Returns `{ recipientCount }` and logs a `NOTIFICATION_SENT` activity entry. |

Notification `type` values: `JOB_POSTED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `SELECTED`, `REJECTED`, `DEADLINE`, `GENERAL`.

---

## Activity — `/api/activity`

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/me` | 🔒 | — | My most recent 50 activity entries. |
| GET | `/` | 🔒 ADMIN | query: `userId?, action?, page, limit` | Platform-wide activity feed, populated with the acting user (`name, email, role`). Returns `{ activity, pagination }`. |

Activity `action` values: `LOGIN`, `REGISTER`, `PROFILE_UPDATED`, `JOB_CREATED`, `JOB_UPDATED`, `APPLICATION_SUBMITTED`, `APPLICATION_STATUS_CHANGED`, `COMPANY_CREATED`, `NOTIFICATION_SENT`.

---

## Dashboard / Analytics — `/api/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/student` | 🔒 STUDENT | Cards (`applied, shortlisted, interviews, selected`), recent applications, and upcoming deadlines for the current student. |
| GET | `/recruiter` | 🔒 RECRUITER | Cards (`activeJobs, totalApplicants, shortlisted, hired`), applicant-pipeline-by-status breakdown, and top jobs by applicant count. |
| GET | `/admin` | 🔒 ADMIN | Platform-wide cards (`totalStudents, totalRecruiters, totalCompanies, totalJobs, totalApplications, placementPercentage, totalSelected`) plus chart series: placements by branch, applications per company, and monthly placements. |

---

## Error reference

| Status | Meaning |
|---|---|
| 400 | Validation error — missing/invalid fields, ineligible application attempt, illegal status transition |
| 401 | Missing/invalid/expired access or refresh token, or bad credentials |
| 403 | Authenticated but not permitted (wrong role, or not the resource owner) |
| 404 | Resource not found |
| 409 | Conflict — e.g. duplicate email on register, duplicate application |
| 500 | Unexpected server error |
