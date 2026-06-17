import api from './api';
import { User } from './types';

export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await api.post('/api/auth/login', { username, password });
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  return { user, token };
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('token');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}