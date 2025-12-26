import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  Task, 
  CreateTaskData, 
  UpdateTaskData,
  PaginatedResponse,
  PaginationParams
} from '../types';

// API configuration for Laravel backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
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
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
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
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data in localStorage
 */
export const setStoredUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// ============================================
// AUTH API
// ============================================

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/register', userData);
  
  // Store token and user data
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
    setStoredUser(response.data.user);
  }
  
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', credentials);
  
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
export const logout = async (): Promise<void> => {
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
export const getProfile = async (): Promise<User> => {
  const response = await api.get<User>('/user');
  return response.data;
};

// ============================================
// TASKS API
// ============================================

/**
 * Get all tasks for the authenticated user with pagination
 */
export const getTasks = async (params?: PaginationParams): Promise<PaginatedResponse<Task>> => {
  const response = await api.get<PaginatedResponse<Task>>('/tasks', {
    params: {
      page: params?.page || 1,
      per_page: params?.per_page || 5,
    }
  });
  return response.data;
};

/**
 * Get a single task by ID
 */
export const getTask = async (id: number): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  const response = await api.post<Task>('/tasks', taskData);
  return response.data;
};

/**
 * Update a task
 */
export const updateTask = async (id: number, taskData: UpdateTaskData): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/tasks/${id}`);
  return response.data;
};

export default api;


