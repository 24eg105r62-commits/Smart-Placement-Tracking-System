import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendNotification,
} from '../api/notifications.js';

export const useMyNotifications = (params) =>
  useQuery({ queryKey: ['notifications', 'mine', params], queryFn: () => fetchMyNotifications(params) });

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'mine'] }),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'mine'] }),
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};
