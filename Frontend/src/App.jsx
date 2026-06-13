import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PageLoader from './components/PageLoader.jsx';
import ProtectedRoute, { ROLE_HOME } from './routes/ProtectedRoute.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import NotFound from './pages/NotFound.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfile from './pages/student/Profile.jsx';
import StudentCompanies from './pages/student/Companies.jsx';
import StudentJobs from './pages/student/Jobs.jsx';
import StudentJobDetails from './pages/student/JobDetails.jsx';
import StudentApplications from './pages/student/Applications.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';
import RecruiterDashboard from './pages/recruiter/Dashboard.jsx';
import RecruiterCompanyProfile from './pages/recruiter/CompanyProfile.jsx';
import RecruiterJobs from './pages/recruiter/Jobs.jsx';
import RecruiterApplicants from './pages/recruiter/Applicants.jsx';
import RecruiterNotifications from './pages/recruiter/Notifications.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import AdminRecruiters from './pages/admin/Recruiters.jsx';
import AdminCompanies from './pages/admin/Companies.jsx';
import AdminJobs from './pages/admin/Jobs.jsx';
import AdminApplications from './pages/admin/Applications.jsx';
import AdminNotifications from './pages/admin/Notifications.jsx';
import AdminActivityLogs from './pages/admin/ActivityLogs.jsx';

const HomeRoute = () => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
  return <Landing />;
};

const GuestOnly = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  return children;
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      <Route element={<GuestOnly><AuthLayout /></GuestOnly>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/companies" element={<StudentCompanies />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/jobs/:jobId" element={<StudentJobDetails />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
        </Route>
      </Route>

      {/* Recruiter */}
      <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/company" element={<RecruiterCompanyProfile />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterApplicants />} />
          <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
          <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/recruiters" element={<AdminRecruiters />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/activity" element={<AdminActivityLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
