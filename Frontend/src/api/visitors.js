import api from './axios.js';

export const fetchSiteStats = () => api.get('/visitors').then((r) => r.data.data);
export const trackVisit = () => api.post('/visitors/track').then((r) => r.data.data);
