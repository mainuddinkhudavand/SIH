import axios from 'axios';

let baseURL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
    ? '/api' 
    : 'http://localhost:5000/api');

if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  if (baseURL !== '/' && baseURL !== '') {
    baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
  }
}

const API = axios.create({ baseURL });

// Intercept requests and attach tokens if available with demo fallback
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || 
                localStorage.getItem('adminToken') || 
                localStorage.getItem('departmentToken') || 
                localStorage.getItem('managerToken') || 
                localStorage.getItem('workerToken') ||
                'DEMO_CITIZEN_TOKEN';
                
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept responses gracefully
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 404) {
      console.warn("GovConnect Gateway Interceptor handled status gracefully:", err.config?.url);
    }
    return Promise.reject(err);
  }
);

export default API;
