import api from './axios.js';

export const applyToJob = async (jobId) => {
  const { data } = await api.post('/applications', { jobId });
  return data.data.application;
};

export const fetchMyApplications = async (params) => {
  const { data } = await api.get('/applications/me', { params });
  return data.data.applications;
};

export const fetchApplicationsForJob = async (jobId, params) => {
  const { data } = await api.get(`/applications/job/${jobId}`, { params });
  return data.data;
};

export const fetchAllApplications = async (params) => {
  const { data } = await api.get('/applications', { params });
  return data.data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.patch(`/applications/${id}/status`, { status });
  return data.data.application;
};
