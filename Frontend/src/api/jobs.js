import api from './axios.js';

export const fetchJobs = async (params) => {
  const { data } = await api.get('/jobs', { params });
  return data.data;
};

export const fetchJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data.data.job;
};

export const fetchJobEligibility = async (id) => {
  const { data } = await api.get(`/jobs/${id}/eligibility`);
  return data.data;
};

export const fetchUpcomingDeadlines = async (days) => {
  const { data } = await api.get('/jobs/deadlines/upcoming', { params: days ? { days } : undefined });
  return data.data.jobs;
};

export const fetchMyPostedJobs = async () => {
  const { data } = await api.get('/jobs/recruiter/mine');
  return data.data.jobs;
};

export const createJob = async (payload) => {
  const { data } = await api.post('/jobs', payload);
  return data.data.job;
};

export const updateJob = async (id, payload) => {
  const { data } = await api.put(`/jobs/${id}`, payload);
  return data.data.job;
};

export const deleteJob = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};
