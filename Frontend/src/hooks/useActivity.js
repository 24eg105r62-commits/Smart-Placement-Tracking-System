import { useQuery } from '@tanstack/react-query';
import { fetchMyActivity, fetchAllActivity } from '../api/activity.js';

export const useMyActivity = () =>
  useQuery({ queryKey: ['activity', 'mine'], queryFn: fetchMyActivity });

export const useAllActivity = (params) =>
  useQuery({ queryKey: ['activity', 'all', params], queryFn: () => fetchAllActivity(params), placeholderData: (prev) => prev });
