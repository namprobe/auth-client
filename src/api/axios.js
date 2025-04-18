import axios from 'axios';
import environment from '../config/environment';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

const refreshApi = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra session revoked từ check-session endpoint
    if (error.config.url.includes('/check-session') && 
        (error.response?.data?.errors?.includes('Session revoked') || 
         error.response?.data?.errors?.includes('Session expired') ||
         error.response?.data?.errors?.includes('Session not found'))) {
      toast.error('Your session is no longer valid. Please login again.');
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;