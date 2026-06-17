'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, loginUser, logoutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const user = await loginUser(username, password);
    setUser(user);
    if (user.is_admin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/teacher/dashboard');
    }
    return user;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
    router.push('/login');
  }

  return { user, loading, login, logout, checkAuth };
}