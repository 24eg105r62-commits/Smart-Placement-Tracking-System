import api from './axios.js';

export const fetchCompanies = async (params) => {
  const { data } = await api.get('/companies', { params });
  return data.data;
};

export const fetchCompanyById = async (id) => {
  const { data } = await api.get(`/companies/${id}`);
  return data.data.company;
};

export const createCompany = async (payload) => {
  const { data } = await api.post('/companies', payload);
  return data.data.company;
};

export const updateCompany = async (id, payload) => {
  const { data } = await api.put(`/companies/${id}`, payload);
  return data.data.company;
};

export const uploadCompanyLogo = async (id, file) => {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await api.post(`/companies/${id}/logo`, form);
  return data.data.logo;
};

export const deleteCompany = async (id) => {
  const { data } = await api.delete(`/companies/${id}`);
  return data;
};
