import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyToJob,
  fetchMyApplications,
  fetchApplicationsForJob,
  fetchAllApplications,
  updateApplicationStatus,
} from '../api/applications.js';

export const useMyApplications = (params) =>
  useQuery({ queryKey: ['applications', 'mine', params], queryFn: () => fetchMyApplications(params) });

export const useApplicationsForJob = (jobId, params) =>
  useQuery({
    queryKey: ['applications', 'job', jobId, params],
    queryFn: () => fetchApplicationsForJob(jobId, params),
    enabled: Boolean(jobId),
  });

export const useAllApplications = (params) =>
  useQuery({ queryKey: ['applications', 'all', params], queryFn: () => fetchAllApplications(params), placeholderData: (prev) => prev });

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
