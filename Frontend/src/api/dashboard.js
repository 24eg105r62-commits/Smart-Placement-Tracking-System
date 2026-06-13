import api from './axios.js';

export const fetchStudentDashboard = async () => {
  const { data } = await api.get('/dashboard/student');
  return data.data;
};

export const fetchRecruiterDashboard = async () => {
  const { data } = await api.get('/dashboard/recruiter');
  return data.data;
};

export const fetchAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin');
  return data.data;
};
