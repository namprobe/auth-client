import axios from 'axios';
import environment from '../config/environment';

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a new instance for refresh token requests
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

// Add a request interceptor for debugging
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  response => response,
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        // Already tried refreshing token - logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const deviceId = localStorage.getItem('deviceId');

        if (!refreshToken || !deviceId) {
          throw new Error('No refresh token or device ID');
        }

        originalRequest._retry = true;
        const response = await refreshApi.post('/Auth/refresh-token', {
          refreshToken,
          deviceId
        });

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
