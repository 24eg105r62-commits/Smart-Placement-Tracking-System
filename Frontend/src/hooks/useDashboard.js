import { useQuery } from '@tanstack/react-query';
import { fetchStudentDashboard, fetchRecruiterDashboard, fetchAdminDashboard } from '../api/dashboard.js';

export const useStudentDashboard = () =>
  useQuery({ queryKey: ['dashboard', 'student'], queryFn: fetchStudentDashboard });

export const useRecruiterDashboard = () =>
  useQuery({ queryKey: ['dashboard', 'recruiter'], queryFn: fetchRecruiterDashboard });

export const useAdminDashboard = () =>
  useQuery({ queryKey: ['dashboard', 'admin'], queryFn: fetchAdminDashboard });
