import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  User,
  LoginHistoryEntry,
  ApiResponse
} from './types';

// Update this to match your backend service URL
const API_BASE_URL = 'http://localhost/auth';  // Use API gateway on port 80

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
  // Add withCredentials for CORS
  withCredentials: false,
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request:', config.method, config.url, config.data);
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.response?.data);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Please check if the server is running.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection and if the server is running.');
    }
    throw error;
  }
);

export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<ApiResponse> {
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Registration failed' };
    }
  },

  // Login user
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', data);
      const { token, userInfo } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Login failed' };
    }
  },

  // Check token validity
  async checkToken(): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      const response = await api.get('/check-token');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Token validation failed' };
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Failed to get user profile' };
    }
  },

  // Get login history
  async getLoginHistory(): Promise<ApiResponse<LoginHistoryEntry[]>> {
    try {
      const response = await api.get('/login-history');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Failed to get login history' };
    }
  },

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response = await api.put('/update', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Failed to update profile' };
    }
  },

  // Update password
  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse> {
    try {
      const response = await api.put('/update-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { status: 'error', message: 'Failed to update password' };
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
  }
}; 
