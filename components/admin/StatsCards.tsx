'use client';

import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface StatsCardsProps {
  stats: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-medium text-sm font-body">{stat.label}</p>
                <p className="text-2xl font-bold font-heading text-navy">{stat.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}