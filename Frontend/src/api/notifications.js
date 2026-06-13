import api from './axios.js';

export const fetchMyNotifications = async (params) => {
  const { data } = await api.get('/notifications/me', { params });
  return data.data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data.notification;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data;
};

export const sendNotification = async (payload) => {
  const { data } = await api.post('/notifications/send', payload);
  return data.data;
};
