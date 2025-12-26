// User types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Task types
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  is_completed?: boolean;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

// Frontend Todo format
export interface Todo {
  id: number;
  text: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}


