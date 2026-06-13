import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompanies,
  fetchCompanyById,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
  deleteCompany,
} from '../api/companies.js';

export const useCompanies = (params) =>
  useQuery({ queryKey: ['companies', 'list', params], queryFn: () => fetchCompanies(params), placeholderData: (prev) => prev });

export const useCompany = (id) =>
  useQuery({ queryKey: ['companies', 'detail', id], queryFn: () => fetchCompanyById(id), enabled: Boolean(id) });

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCompany(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => uploadCompanyLogo(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
};
