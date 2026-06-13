import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchJobs,
  fetchJobById,
  fetchJobEligibility,
  fetchUpcomingDeadlines,
  fetchMyPostedJobs,
  createJob,
  updateJob,
  deleteJob,
} from '../api/jobs.js';

export const useJobs = (params) =>
  useQuery({ queryKey: ['jobs', 'list', params], queryFn: () => fetchJobs(params), placeholderData: (prev) => prev });

export const useJob = (id) =>
  useQuery({ queryKey: ['jobs', 'detail', id], queryFn: () => fetchJobById(id), enabled: Boolean(id) });

export const useJobEligibility = (id) =>
  useQuery({ queryKey: ['jobs', 'eligibility', id], queryFn: () => fetchJobEligibility(id), enabled: Boolean(id) });

export const useUpcomingDeadlines = (days) =>
  useQuery({ queryKey: ['jobs', 'deadlines', days], queryFn: () => fetchUpcomingDeadlines(days) });

export const useMyPostedJobs = () =>
  useQuery({ queryKey: ['jobs', 'mine'], queryFn: fetchMyPostedJobs });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateJob(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
};
