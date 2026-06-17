'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { LogoutIcon } from '@/components/ui/Icons';
import { motion } from 'framer-motion';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.is_admin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="bg-navy px-8 py-4 flex items-center justify-between shadow-lg"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Jinja<span className="text-teal">SS</span>
          </h1>
          <p className="text-gray-medium text-sm font-body">Voting Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-body">Teacher Portal</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-body"
          >
            <LogoutIcon size={18} />
            Logout
          </button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}