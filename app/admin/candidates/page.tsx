'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { PlusIcon, TrashIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Position, Candidate } from '@/lib/types';

export default function CandidatesPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchAllPositions();
  }, []);

  useEffect(() => {
    if (selectedPosition) fetchCandidates();
  }, [selectedPosition]);

  async function fetchAllPositions() {
    try {
      const electionsRes = await api.get('/api/elections');
      const allPositions: Position[] = [];
      for (const e of electionsRes.data.elections) {
        const posRes = await api.get(`/api/positions?election_id=${e.id}`);
        allPositions.push(...posRes.data.positions);
      }
      setPositions(allPositions);
      if (allPositions.length > 0 && !selectedPosition) {
        setSelectedPosition(String(allPositions[0].id));
      }
    } catch (err) {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCandidates() {
    try {
      const res = await api.get(`/api/candidates?position_id=${selectedPosition}`);
      setCandidates(res.data.candidates);
    } catch (err) {
      showToast('Failed to load candidates', 'error');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/candidates', { name, position_id: Number(selectedPosition) });
      setName('');
      setShowForm(false);
      showToast('Candidate added', 'success');
      fetchCandidates();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to add', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this candidate?')) return;
    try {
      await api.delete(`/api/candidates/${id}`);
      showToast('Candidate deleted', 'success');
      fetchCandidates();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to delete', 'error');
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) return <p className="text-gray-medium font-body text-center py-12">Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-heading font-bold text-navy">Candidates</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedPosition}>
          <span className="flex items-center gap-2"><PlusIcon size={18} />Add Candidate</span>
        </Button>
      </div>

      <Select
        label="Select Position"
        value={selectedPosition}
        onChange={(e) => setSelectedPosition(e.target.value)}
        options={positions.map(p => ({ value: p.id, label: p.title }))}
        className="mb-6"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <Card>
              <form onSubmit={handleCreate}>
                <h3 className="text-xl font-heading font-bold text-navy mb-4">Add Candidate</h3>
                <Input label="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Doe" required />
                <div className="flex gap-3 mt-4">
                  <Button type="submit">Add</Button>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {candidates.length === 0 ? (
          <Card><p className="text-gray-medium font-body text-center py-8">No candidates for this position.</p></Card>
        ) : (
          candidates.map((cand, idx) => (
            <motion.div key={cand.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-heading font-bold text-navy">{cand.name}</h4>
                  <button onClick={() => handleDelete(cand.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon size={18} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </motion.div>
  );
}