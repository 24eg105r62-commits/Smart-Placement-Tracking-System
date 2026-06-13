import api from './axios.js';

export const fetchMyRecruiterProfile = async () => {
  const { data } = await api.get('/recruiters/me');
  return data.data.recruiter;
};

export const updateMyRecruiterProfile = async (payload) => {
  const { data } = await api.put('/recruiters/me', payload);
  return data.data.recruiter;
};

export const fetchRecruiters = async (params) => {
  const { data } = await api.get('/recruiters', { params });
  return data.data;
};

export const fetchRecruiterById = async (id) => {
  const { data } = await api.get(`/recruiters/${id}`);
  return data.data.recruiter;
};
