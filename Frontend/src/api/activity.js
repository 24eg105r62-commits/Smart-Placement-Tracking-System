import api from './axios.js';

export const fetchMyActivity = async (params) => {
  const { data } = await api.get('/activity/me', { params });
  return data.data;
};

export const fetchAllActivity = async (params) => {
  const { data } = await api.get('/activity', { params });
  return data.data;
};
