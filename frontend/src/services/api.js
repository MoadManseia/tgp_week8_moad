import axios from 'axios';

// API configuration for Laravel backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.reload();
    }
    
    // Extract error message
    const message = error.response?.data?.message 
      || error.response?.data?.errors 
      || error.message 
      || 'An error occurred';
    
    // Handle validation errors (422)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
      return Promise.reject(new Error(errorMessages));
    }
    
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Set the auth token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data in localStorage
 */
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// ============================================
// AUTH API
// ============================================

/**
 * Register a new user
 * @param {Object} userData - { username, email, password, password_confirmation }
 */
export const register = async (userData) => {
  const response = await api.post('/register', userData);
  
  // Store token and user data
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
    setStoredUser(response.data.user);
  }
  
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - { username, password }
 */
export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  
  // Store token and user data
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
    setStoredUser(response.data.user);
  }
  
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthData();
  }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await api.get('/user');
  return response.data;
};

// ============================================
// TASKS API
// ============================================

/**
 * Get all tasks for the authenticated user
 */
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

/**
 * Get a single task by ID
 * @param {number} id - Task ID
 */
export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task
 * @param {Object} taskData - { title, description?, is_completed? }
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update a task
 * @param {number} id - Task ID
 * @param {Object} taskData - { title?, description?, is_completed? }
 */
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {number} id - Task ID
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export default api;
