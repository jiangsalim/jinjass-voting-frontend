'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertIcon, CheckIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.put('/api/notifications/read-all');
      showToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading notifications...</p>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-gray-medium font-body text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <span className="flex items-center gap-2">
              <CheckIcon size={16} />
              Mark All Read
            </span>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <p className="text-gray-medium font-body text-center py-8">No notifications.</p>
          </Card>
        ) : (
          notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={!notification.is_read ? 'border-l-4 border-l-red-500' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100' : 'bg-red-100'}`}>
                      <AlertIcon size={18} className={notification.is_read ? 'text-gray-medium' : 'text-red-500'} />
                    </div>
                    <div>
                      <p className={`font-body ${notification.is_read ? 'text-gray-medium' : 'text-navy font-semibold'}`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-medium font-body mt-1">
                        Position: {notification.position_name}
                        <span className="mx-2">|</span>
                        Attempted: {notification.attempted_total} / Max: {notification.max_allowed}
                      </p>
                      <p className="text-xs text-gray-medium font-body mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="text-teal hover:text-teal-dark font-body text-sm font-semibold flex items-center gap-1 shrink-0"
                    >
                      <CheckIcon size={14} />
                      Mark Read
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
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