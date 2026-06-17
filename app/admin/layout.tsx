'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import NotificationBell from '@/components/admin/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Notification } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/api/notifications');
      setUnreadCount(res.data.unread_count);
    } catch {
      // ignore
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-white font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light">
      <Sidebar />

      {/* Main content area */}
      <div className="ml-72">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-navy">Admin Panel</h1>
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() => router.push('/admin/notifications')}
          />
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}