import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyRecruiterProfile, updateMyRecruiterProfile, fetchRecruiters, fetchRecruiterById } from '../api/recruiters.js';

export const RECRUITER_PROFILE_KEY = ['recruiter', 'me'];

export const useMyRecruiterProfile = () =>
  useQuery({ queryKey: RECRUITER_PROFILE_KEY, queryFn: fetchMyRecruiterProfile });

export const useUpdateRecruiterProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyRecruiterProfile,
    onSuccess: (recruiter) => queryClient.setQueryData(RECRUITER_PROFILE_KEY, recruiter),
  });
};

export const useRecruiters = (params) =>
  useQuery({ queryKey: ['recruiters', 'list', params], queryFn: () => fetchRecruiters(params), placeholderData: (prev) => prev });

export const useRecruiter = (id) =>
  useQuery({ queryKey: ['recruiters', 'detail', id], queryFn: () => fetchRecruiterById(id), enabled: Boolean(id) });
