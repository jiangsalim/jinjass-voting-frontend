'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PlusIcon, TrashIcon, CheckIcon, CloseIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Election } from '@/lib/types';
import { formatEAT } from '@/lib/utils';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchElections();
  }, []);

  async function fetchElections() {
    try {
      const res = await api.get('/api/elections');
      setElections(res.data.elections);
    } catch (err) {
      showToast('Failed to load elections', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/elections', { title, year });
      setTitle('');
      setYear('');
      setShowForm(false);
      showToast('Election created successfully', 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to create election', 'error');
    }
  }

  async function handleActivate(id: number) {
    try {
      await api.put('/api/settings/current-election', { election_id: id });
      showToast('Election activated', 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to activate', 'error');
    }
  }

  async function handleClose(id: number) {
    if (!confirm('Close this election? Results will be finalized.')) return;
    try {
      await api.put(`/api/elections/${id}`, { status: 'closed' });
      await api.post('/api/settings/toggle-voting');
      showToast('Election closed and moved to results', 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to close election', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this election? All associated data will be lost permanently.')) return;
    try {
      await api.delete(`/api/elections/${id}`);
      showToast('Election deleted', 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to delete', 'error');
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading elections...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-navy">Elections</h2>
          <p className="text-gray-medium font-body text-sm mt-1">Manage all elections. Only one can be active at a time.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <span className="flex items-center gap-2">
            <PlusIcon size={18} />
            New Election
          </span>
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <Card>
              <form onSubmit={handleCreate}>
                <h3 className="text-xl font-heading font-bold text-navy mb-4">Create Election</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Election Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Student Council"
                    required
                  />
                  <Input
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2027"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button type="submit">Create Election</Button>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {elections.length === 0 ? (
          <Card>
            <p className="text-gray-medium font-body text-center py-8">
              No elections yet. Create your first election to get started.
            </p>
          </Card>
        ) : (
          elections.map((election, idx) => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`${election.status === 'active' ? 'border-l-4 border-l-teal' : 'border-l-4 border-l-gray-300'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-heading font-bold text-navy">{election.title}</h4>
                    <p className="text-gray-medium font-body text-sm">
                      Year: {election.year}
                      <span className={`ml-3 inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        election.status === 'active' 
                          ? 'bg-teal/10 text-teal' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {election.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-gray-medium font-body mt-1">
                      Created: {formatEAT(election.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {election.status === 'closed' && (
                      <Button
                        variant="primary"
                        onClick={() => handleActivate(election.id)}
                      >
                        <span className="flex items-center gap-1 text-sm">
                          <CheckIcon size={16} />
                          Activate
                        </span>
                      </Button>
                    )}

                    {election.status === 'active' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleClose(election.id)}
                      >
                        <span className="flex items-center gap-1 text-sm">
                          <CloseIcon size={16} />
                          Close
                        </span>
                      </Button>
                    )}

                    <button
                      onClick={() => handleDelete(election.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Election"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
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