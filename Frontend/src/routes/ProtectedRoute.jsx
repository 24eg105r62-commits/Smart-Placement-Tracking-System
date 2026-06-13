import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from '../components/PageLoader.jsx';

const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  STUDENT: '/student/dashboard',
  RECRUITER: '/recruiter/dashboard',
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
export { ROLE_HOME };
