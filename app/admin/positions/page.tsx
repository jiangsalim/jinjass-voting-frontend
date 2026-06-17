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
import { Election, Position } from '@/lib/types';

export default function PositionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchPositions();
  }, [selectedElection]);

  async function fetchElections() {
    try {
      const res = await api.get('/api/elections');
      setElections(res.data.elections);
      if (res.data.elections.length > 0 && !selectedElection) {
        setSelectedElection(String(res.data.elections[0].id));
      }
    } catch (err) {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPositions() {
    try {
      const res = await api.get(`/api/positions?election_id=${selectedElection}`);
      setPositions(res.data.positions);
    } catch (err) {
      showToast('Failed to load positions', 'error');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/positions', { title, election_id: Number(selectedElection) });
      setTitle('');
      setShowForm(false);
      showToast('Position created', 'success');
      fetchPositions();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to create', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this position and all candidates?')) return;
    try {
      await api.delete(`/api/positions/${id}`);
      showToast('Position deleted', 'success');
      fetchPositions();
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
        <h2 className="text-3xl font-heading font-bold text-navy">Positions</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedElection}>
          <span className="flex items-center gap-2"><PlusIcon size={18} />Add Position</span>
        </Button>
      </div>

      <Select
        label="Select Election"
        value={selectedElection}
        onChange={(e) => setSelectedElection(e.target.value)}
        options={elections.map(e => ({ value: e.id, label: `${e.title} (${e.year})` }))}
        className="mb-6"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <Card>
              <form onSubmit={handleCreate}>
                <h3 className="text-xl font-heading font-bold text-navy mb-4">Add Position</h3>
                <Input label="Position Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., President" required />
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
        {positions.length === 0 ? (
          <Card><p className="text-gray-medium font-body text-center py-8">No positions for this election.</p></Card>
        ) : (
          positions.map((pos, idx) => (
            <motion.div key={pos.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-heading font-bold text-navy">{pos.title}</h4>
                  <button onClick={() => handleDelete(pos.id)} className="text-red-500 hover:text-red-700">
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