import api from './api';
import { User } from './types';

export async function loginUser(username: string, password: string): Promise<User> {
  const response = await api.post('/api/auth/login', { username, password });
  return response.data.user;
}

export async function logoutUser(): Promise<void> {
  await api.post('/api/auth/logout');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
}