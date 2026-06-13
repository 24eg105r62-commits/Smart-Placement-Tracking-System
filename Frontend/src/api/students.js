import api from './axios.js';

export const fetchMyStudentProfile = async () => {
  const { data } = await api.get('/students/me');
  return data.data.student;
};

export const updateMyStudentProfile = async (payload) => {
  const { data } = await api.put('/students/me', payload);
  return data.data.student;
};

export const uploadStudentPicture = async (file) => {
  const form = new FormData();
  form.append('picture', file);
  const { data } = await api.post('/students/me/picture', form);
  return data.data.profilePicture;
};

export const uploadStudentResume = async (file) => {
  const form = new FormData();
  form.append('resume', file);
  const { data } = await api.post('/students/me/resume', form);
  return data.data; // { resumeUrl, extracted, profile }
};

export const removeStudentResume = async () => {
  await api.delete('/students/me/resume');
};

export const fetchStudents = async (params) => {
  const { data } = await api.get('/students', { params });
  return data.data;
};

export const fetchStudentById = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  return data.data.student;
};
