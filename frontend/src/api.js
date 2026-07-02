import axios from "axios";

// Create axios instance with base URL
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Add token automatically to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Optional: handle errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or unauthorized → clear storage and redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;