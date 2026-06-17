'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import StatsCards from '@/components/admin/StatsCards';
import VotingToggle from '@/components/admin/VotingToggle';
import BarChart from '@/components/charts/BarChart';
import ResultsTable from '@/components/charts/ResultsTable';
import { ElectionIcon, SchoolIcon, UsersIcon, ChartIcon } from '@/components/ui/Icons';
import api from '@/lib/api';
import { SystemSettings, ElectionResults } from '@/lib/types';
import Toast from '@/components/ui/Toast';

export default function AdminDashboard() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [stats, setStats] = useState({ classes: 0, streams: 0, submitted: 0, total: 0 });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
  try {
    const settingsRes = await api.get('/api/settings');
    const settingsData = settingsRes.data;
    setSettings(settingsData);

    if (settingsData.current_election) {
      const resultsRes = await api.get(`/api/results?election_id=${settingsData.current_election.id}`);
      setResults(resultsRes.data.results);

      // Get classes
      const classesRes = await api.get(`/api/classes?election_id=${settingsData.current_election.id}`);
      const classList = classesRes.data.classes;

      // Get all streams and their IDs for this election
      let totalStreams = 0;
      const electionStreamIds: number[] = [];
      for (const c of classList) {
        const streamsRes = await api.get(`/api/streams?class_id=${c.id}`);
        const streamList = streamsRes.data.streams;
        totalStreams += streamList.length;
        for (const s of streamList) {
          electionStreamIds.push(s.id);
        }
      }

      // Count submitted streams (only those in this election)
      const submissionsRes = await api.get('/api/votes/submissions');
      const submittedCount = submissionsRes.data.submissions.filter(
        (s: any) => electionStreamIds.includes(s.stream_id)
      ).length;

      setStats({
        classes: classList.length,
        streams: totalStreams,
        submitted: submittedCount,
        total: totalStreams,
      });
    }
  } catch (err) {
    console.error('Failed to fetch data:', err);
  } finally {
    setLoading(false);
  }
}
  async function handleToggleVoting() {
    try {
      const res = await api.post('/api/settings/toggle-voting');
      setSettings((prev) => prev ? { ...prev, voting_open: res.data.voting_open } : null);
      setToast({
        show: true,
        message: res.data.message || 'Voting status updated',
        type: 'success',
      });
      fetchData(); // Refresh results
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.response?.data?.error || 'Failed to toggle voting',
        type: 'error',
      });
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-medium font-body">Loading dashboard...</div>;
  }

  const dashboardStats = [
    { label: 'Classes', value: stats.classes, icon: <SchoolIcon size={24} className="text-white" />, color: 'bg-blue-500' },
    { label: 'Streams', value: stats.streams, icon: <UsersIcon size={24} className="text-white" />, color: 'bg-purple-500' },
    { label: 'Submitted', value: stats.submitted, icon: <ChartIcon size={24} className="text-white" />, color: 'bg-teal' },
    { label: 'Pending', value: stats.total - stats.submitted, icon: <ElectionIcon size={24} className="text-white" />, color: 'bg-orange-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Dashboard</h2>
          {settings?.current_election && (
            <p className="text-gray-medium font-body mt-1">
              {settings.current_election.title} ({settings.current_election.year})
            </p>
          )}
        </div>
        <VotingToggle isOpen={settings?.voting_open || false} onToggle={handleToggleVoting} />
      </div>

      {/* Stats */}
      <StatsCards stats={dashboardStats} />

      {/* Results Section */}
      {results && (
        <div className="mt-8">
          <h3 className="text-2xl font-heading font-bold text-navy mb-6">
            {settings?.voting_open ? 'Live Results' : 'Final Results'}
          </h3>

          <div className="space-y-8">
            {Object.entries(results).map(([position, candidates], idx) => (
              <motion.div
                key={position}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <h4 className="text-xl font-heading font-bold text-navy mb-4">{position}</h4>
                  {settings?.display_type === 'graphs' ? (
                    <BarChart data={candidates} positionName={position} />
                  ) : (
                    <ResultsTable data={candidates} />
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {Object.keys(results).length === 0 && (
            <Card>
              <p className="text-gray-medium font-body text-center py-8">
                No results yet. Waiting for vote submissions.
              </p>
            </Card>
          )}
        </div>
      )}

      {!settings?.current_election && (
        <Card className="mt-8">
          <p className="text-gray-medium font-body text-center py-8">
            No active election. Create an election to get started.
          </p>
        </Card>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
}