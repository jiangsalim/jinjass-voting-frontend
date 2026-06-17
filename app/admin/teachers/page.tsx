'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';

export default function TeachersPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchTeacher();
  }, []);

  async function fetchTeacher() {
    try {
      const res = await api.get('/api/teachers');
      if (res.data.teacher) {
        setCurrentTeacher(res.data.teacher);
        setUsername(res.data.teacher.username);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      showToast('Username and password are required', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put('/api/teachers/credentials', { username, password });
      setPassword('');
      setCurrentTeacher({ username });
      showToast('Teacher credentials updated successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to update credentials', 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-3xl font-heading font-bold text-navy mb-2">Teacher Account</h2>
      <p className="text-gray-medium font-body mb-8">
        All teachers share one account to enter votes. Set the credentials below.
      </p>

      <Card className="max-w-lg">
        <form onSubmit={handleSave}>
          {currentTeacher && (
            <div className="mb-4 p-3 bg-gray-light rounded-lg">
              <p className="text-sm font-body text-gray-medium">
                Current Username: <span className="text-navy font-semibold">{currentTeacher.username}</span>
              </p>
            </div>
          )}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter teacher username"
            required
          />

          <Input
            label={currentTeacher ? 'New Password' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          <Button type="submit" disabled={saving} className="mt-2">
            {saving ? 'Saving...' : 'Save Credentials'}
          </Button>
        </form>
      </Card>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
}