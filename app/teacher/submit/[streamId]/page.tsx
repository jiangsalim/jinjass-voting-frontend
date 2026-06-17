'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Position, Candidate } from '@/lib/types';
import { formatEAT } from '@/lib/utils';

export default function SubmitVotesPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = Number(params.streamId);

  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Record<number, string>>({});
  const [streamInfo, setStreamInfo] = useState<{ name: string; class_name: string; total_students: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const settingsRes = await api.get('/api/settings');
      if (!settingsRes.data.current_election) {
        showToast('No active election', 'error');
        router.push('/teacher/dashboard');
        return;
      }

      const positionsRes = await api.get(`/api/positions?election_id=${settingsRes.data.current_election.id}`);
      setPositions(positionsRes.data.positions);

      const allCandidates: Candidate[] = [];
      for (const pos of positionsRes.data.positions) {
        const candRes = await api.get(`/api/candidates?position_id=${pos.id}`);
        allCandidates.push(...candRes.data.candidates);
      }
      setCandidates(allCandidates);

      const initialVotes: Record<number, string> = {};
      allCandidates.forEach(c => { initialVotes[c.id] = ''; });
      setVotes(initialVotes);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const voteData: Record<number, number> = {};
    for (const [candidateId, count] of Object.entries(votes)) {
      voteData[Number(candidateId)] = Number(count) || 0;
    }

    try {
      await api.post('/api/votes/submit', {
        stream_id: streamId,
        votes: voteData,
      });
      showToast('Votes submitted successfully!', 'success');
      setTimeout(() => router.push('/teacher/dashboard'), 2000);
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to submit votes', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-medium font-body">Loading vote form...</p>
      </div>
    );
  }

  const candidatesByPosition: Record<number, Candidate[]> = {};
  candidates.forEach(c => {
    if (!candidatesByPosition[c.position_id]) {
      candidatesByPosition[c.position_id] = [];
    }
    candidatesByPosition[c.position_id].push(c);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button
        onClick={() => router.push('/teacher/dashboard')}
        className="flex items-center gap-2 text-navy hover:text-teal transition-colors font-body mb-6"
      >
        <ArrowLeftIcon size={18} />
        Back to Dashboard
      </button>

      <Card className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-navy mb-2">Submit Vote Tally</h2>
        <p className="text-gray-medium font-body">
          Enter the total number of votes each candidate received from this stream.
        </p>
      </Card>

      <form onSubmit={handleSubmit}>
        {positions.map((position, posIdx) => (
          <motion.div
            key={position.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: posIdx * 0.1 }}
          >
            <Card className="mb-6">
              <h3 className="text-xl font-heading font-bold text-navy mb-4 pb-2 border-b border-gray-200">
                {position.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(candidatesByPosition[position.id] || []).map((candidate) => (
                  <Input
                    key={candidate.id}
                    label={candidate.name}
                    type="number"
                    value={votes[candidate.id] || ''}
                    onChange={(e) => setVotes({ ...votes, [candidate.id]: e.target.value })}
                    placeholder="Enter vote count"
                    min={0}
                    required
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        {positions.length > 0 && (
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Vote Tally'}
          </Button>
        )}

        {positions.length === 0 && (
          <Card>
            <p className="text-gray-medium font-body text-center py-8">
              No positions configured for this election. Contact the administrator.
            </p>
          </Card>
        )}
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
}