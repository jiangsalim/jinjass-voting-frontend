'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UsersIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/api/admin/profile');
      setUsername(res.data.profile.username);
      setCurrentUsername(res.data.profile.username);
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUsername(e: React.FormEvent) {
    e.preventDefault();
    if (!username || username === currentUsername) {
      showToast('No changes to save', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/api/admin/profile', { username });
      setCurrentUsername(res.data.profile.username);
      showToast('Username updated successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to update username', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Current password is required', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put('/api/admin/profile', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading profile...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-navy">Admin Profile</h2>
        <p className="text-gray-medium font-body mt-1">Manage your account credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Username */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-navy">Change Username</h3>
              <p className="text-gray-medium font-body text-sm">Update your display name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateUsername}>
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              required
            />
            <Button type="submit" disabled={saving || username === currentUsername}>
              {saving ? 'Saving...' : 'Update Username'}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-navy">Change Password</h3>
              <p className="text-gray-medium font-body text-sm">Update your login password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword}>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
}