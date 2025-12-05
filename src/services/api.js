import axios from 'axios';
import { secureStorage } from '../utils/encryption';

// Create axios instance
const api = axios.create({
  baseURL: 'http://91.108.105.15:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const adminInfo = secureStorage.getItem('adminInfo');

    if (adminInfo && adminInfo.token) {
      config.headers.Authorization = `Bearer ${adminInfo.token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Customize the error object with better information
    let customError = new Error();

    if (error.response) {
      // The server responded with a status code outside the 2xx range
      customError.message = error.response.data?.message || 'Server error occurred';
      customError.status = error.response.status;
      customError.data = error.response.data;
      customError.response = error.response;
    } else if (error.request) {
      // The request was made but no response was received
      customError.message = 'No response received from server. Please check your connection.';
      customError.request = error.request;
    } else {
      // Something happened in setting up the request that triggered an Error
      customError.message = error.message || 'Error in request setup';
    }

    return Promise.reject(customError);
  }
);

// Auth API
export const login = async (username, password) => {
  try {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  } catch (error) {
    throw error;
  }
};

export default api;
