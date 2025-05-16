export interface User {
  email: string;
  fullName: string;
  organization: string;
  role: number;
}

export interface LoginResponse {
  status: string;
  token: string;
  userInfo: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
  company?: string;
}

export interface UpdatePasswordRequest {
  'current-password': string;
  'new-password': string;
  'confirm-password': string;
}

export interface LoginHistoryEntry {
  ipAddress: string;
  userAgent: string;
  loginAt: number;
}

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
} 