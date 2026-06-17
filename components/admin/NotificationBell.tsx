'use client';

import { BellIcon } from '@/components/ui/Icons';
import Badge from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export default function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative p-2 text-navy hover:text-teal transition-colors"
    >
      <BellIcon size={24} />
      {unreadCount > 0 && (
        <Badge count={unreadCount} className="absolute -top-1 -right-1" />
      )}
    </motion.button>
  );
}