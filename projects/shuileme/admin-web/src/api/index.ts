import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Dashboard APIs
export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
  getUserStats: () => api.get('/stats/users'),
  getActivityStats: () => api.get('/stats/activity'),
  getSleepStats: () => api.get('/stats/sleep'),
  getCheckinRateStats: () => api.get('/stats/checkin-rate'),
};

// User APIs
export const userApi = {
  getList: (params: any) => api.get('/users', { params }),
  getDetail: (id: string) => api.get(`/users/${id}`),
  updateStatus: (id: string, isActive: boolean) => 
    api.put(`/users/${id}/status`, { isActive }),
};

// Admin APIs
export const adminApi = {
  getList: () => api.get('/admins'),
  create: (data: any) => api.post('/admins', data),
  update: (id: string, data: any) => api.put(`/admins/${id}`, data),
  delete: (id: string) => api.delete(`/admins/${id}`),
};
