import axios from 'axios';

let baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Normalize baseURL: ensure it ends with /api if it's a full URL and doesn't have it
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
  if (baseURL !== '/' && baseURL !== '') {
    baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
  }
}

const API = axios.create({ baseURL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired tokens or authorization errors (401) globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
