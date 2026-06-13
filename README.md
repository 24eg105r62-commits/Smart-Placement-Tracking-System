# vSmart Placement

A full-stack (MERN) placement management platform for colleges. Students browse and apply to job postings with live eligibility checks, recruiters manage their company profile and review applicants through a status pipeline, and admins oversee the entire platform with analytics dashboards, user management, broadcast notifications, and activity logs.

## Tech stack

**Frontend** (`Frontend/`): React + Vite, Tailwind CSS, React Router, Axios, React Query, React Hook Form, Recharts, react-hot-toast, lucide-react, Zustand (theme store)

**Backend** (`Bckend/`): Node.js + Express (ES Modules), MongoDB + Mongoose, JWT (access + refresh tokens), Bcrypt, Multer + Cloudinary

## Project structure

```
Smart-Placement-Tracking-System/
├── Bckend/     — Express API server
├── Frontend/   — React (Vite) client
└── docs/
    └── API.md  — full endpoint reference
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance — either local (`mongod` on `mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for profile picture / resume / company logo uploads

## 1. Backend setup

```bash
cd Bckend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `5001`) |
| `CLIENT_URL` | Frontend origin for CORS + cookies (default `http://localhost:5173`) |
| `MONGODB_URI` | Local (`mongodb://127.0.0.1:27017/vsmart_placement`) or Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES` | Access-token signing secret + lifetime (default `15m`) |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES` | Refresh-token signing secret + lifetime (default `7d`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard — required for any picture/resume/logo upload to succeed |

Generate strong random values for the JWT secrets, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start MongoDB locally if you're not using Atlas:

```bash
mongod --dbpath <your-data-directory>
```

### Seed the database

Populates an admin, ~10 students, ~5 recruiters/companies, ~10 jobs, and a spread of applications/notifications/activity across every status — useful for exploring the app immediately:

```bash
npm run seed
```

```
Seed complete! Sign in with:
  Admin:      admin@vsmart.test      / Admin@123
  Student:    asha.rao@vsmart.test   / Student@123
  Recruiter:  karan.shah@techcorp.test / Recruiter@123
```

> Re-running `npm run seed` wipes and repopulates the configured database — don't point it at a database you care about.

### Run the API

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start       # plain node
```

The API listens on `http://localhost:5001/api` (or whatever `PORT` you set). See [`docs/API.md`](docs/API.md) for the full endpoint reference.

## 2. Frontend setup

In a second terminal:

```bash
cd Frontend
npm install
cp .env.example .env
```

`Frontend/.env` only needs:

```
VITE_API_URL=http://localhost:5001/api
```

(point this at wherever your backend is running)

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with one of the seeded accounts above (or register a new student/recruiter account).

### Production build

```bash
npm run build      # outputs to Frontend/dist
npm run preview    # serve the production build locally
```

## Roles at a glance

- **Student** — build a profile (skills, branch, CGPA, resume), browse companies & jobs, see a per-job eligibility breakdown before applying, track application status through a visual pipeline, and receive notifications.
- **Recruiter** — create/manage a company profile (with logo), post and edit job openings, review applicants per job, and move them through the status pipeline (`Applied → Shortlisted → Interview Scheduled → Selected/Rejected`).
- **Admin** — platform-wide analytics dashboard (placements by branch, applications per company, monthly placement trends), manage every student/recruiter/company/job/application, broadcast notifications to any audience, and audit the full activity log.

## Notes

- Cloudinary credentials are required for uploads (profile pictures, resumes, company logos) to actually succeed — without them the upload endpoints will return an error at runtime, but the rest of the app works fine.
- The access token is kept in memory on the client and refreshed silently via the `httpOnly` refresh-token cookie on `401` responses — no manual re-login needed within the refresh-token's lifetime.
