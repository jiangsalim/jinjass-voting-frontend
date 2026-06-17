'use client';

import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CandidateResult } from '@/lib/types';

const COLORS = ['#00C2BA', '#0A1F3F', '#132D52', '#374151', '#9CA3AF', '#F8F9FA'];

interface BarChartProps {
  data: CandidateResult[];
  positionName: string;
}

export default function BarChart({ data, positionName }: BarChartProps) {
  const chartData = data.map((c, index) => ({
    name: c.candidate_name,
    votes: c.votes,
    rank: c.rank,
    fill: COLORS[index % COLORS.length],
  }));

  if (chartData.length === 0) {
    return <p className="text-gray-medium font-body text-center py-4">No data</p>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} />
          <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
            formatter={(value: number) => [`${value} votes`, 'Total']}
          />
          <Bar dataKey="votes" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}