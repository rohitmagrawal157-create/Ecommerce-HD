import { apiClient } from './client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export async function login(req: LoginRequest): Promise<AuthUser> {
  const res = await apiClient.post<AuthResponse>('/auth/login', req);
  window.localStorage.setItem('access_token', res.data.access_token);
  return res.data.user;
}

export async function register(req: RegisterRequest): Promise<AuthUser> {
  const res = await apiClient.post<AuthResponse>('/auth/register', req);
  window.localStorage.setItem('access_token', res.data.access_token);
  return res.data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    window.localStorage.removeItem('access_token');
  }
}

