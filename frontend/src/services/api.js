import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle the new format
api.interceptors.response.use(
  (response) => {
    // Convert JSON storage format to match previous MongoDB format
    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          data: response.data,
          total: response.data.length
        }
      };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 