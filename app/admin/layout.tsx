'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/admin/NotificationBell';
import api from '@/lib/api';
import {
  DashboardIcon, ElectionIcon, SchoolIcon, UsersIcon,
  ChartIcon, SettingsIcon, BellIcon, LogoutIcon, VoteIcon,
  CloseIcon
} from '@/components/ui/Icons';
import Badge from '@/components/ui/Badge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } catch {}
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-white font-body">Loading...</p>
      </div>
    );
  }

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/admin/elections', label: 'Elections', icon: ElectionIcon },
    { href: '/admin/classes', label: 'Classes', icon: SchoolIcon },
    { href: '/admin/streams', label: 'Streams', icon: UsersIcon },
    { href: '/admin/positions', label: 'Positions', icon: VoteIcon },
    { href: '/admin/candidates', label: 'Candidates', icon: UsersIcon },
    { href: '/admin/teachers', label: 'Teacher Account', icon: UsersIcon },
    { href: '/admin/results', label: 'Results', icon: ChartIcon },
    { href: '/admin/notifications', label: 'Notifications', icon: BellIcon },
    { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    { href: '/admin/profile', label: 'Profile', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Mobile Header */}
      <header className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white p-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-heading font-bold text-white">
          Jinja<span className="text-teal">SS</span>
        </h1>
        <NotificationBell
          unreadCount={unreadCount}
          onClick={() => {
            setSidebarOpen(false);
            router.push('/admin/notifications');
          }}
        />
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-navy z-50 flex flex-col"
            >
              <div className="p-4 border-b border-navy-light flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-white">
                  Jinja<span className="text-teal">SS</span>
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <CloseIcon size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}>
                      <div className={`sidebar-link ${isActive ? 'active' : ''}`}>
                        <Icon size={20} />
                        <span className="font-body">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-navy-light">
                <button onClick={handleLogout} className="sidebar-link w-full text-left">
                  <LogoutIcon size={20} />
                  <span className="font-body">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-navy flex-col z-40">
        <div className="p-6 border-b border-navy-light">
          <h2 className="text-2xl font-heading font-bold text-white">
            Jinja<span className="text-teal">SS</span>
          </h2>
          <p className="text-gray-medium text-sm font-body mt-1">Voting Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`sidebar-link ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  <span className="font-body">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-navy-light">
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <LogoutIcon size={20} />
            <span className="font-body">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white border-b border-gray-200 px-8 py-4 items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-navy">Admin Panel</h1>
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() => router.push('/admin/notifications')}
          />
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}