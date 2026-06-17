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
import { Class, Election } from '@/lib/types';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchClasses();
  }, [selectedElection]);

  async function fetchElections() {
    try {
      const res = await api.get('/api/elections');
      setElections(res.data.elections);
      if (res.data.elections.length > 0 && !selectedElection) {
        setSelectedElection(String(res.data.elections[0].id));
      }
    } catch (err) {
      showToast('Failed to load elections', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchClasses() {
    try {
      const res = await api.get(`/api/classes?election_id=${selectedElection}`);
      setClasses(res.data.classes);
    } catch (err) {
      showToast('Failed to load classes', 'error');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/classes', { name, election_id: Number(selectedElection) });
      setName('');
      setShowForm(false);
      showToast('Class created successfully', 'success');
      fetchClasses();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to create class', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this class and all its streams?')) return;
    try {
      await api.delete(`/api/classes/${id}`);
      showToast('Class deleted', 'success');
      fetchClasses();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-heading font-bold text-navy">Classes</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedElection}>
          <span className="flex items-center gap-2">
            <PlusIcon size={18} />
            Add Class
          </span>
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
                <h3 className="text-xl font-heading font-bold text-navy mb-4">Add Class</h3>
                <Input label="Class Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Grade 10" required />
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
        {classes.length === 0 ? (
          <Card><p className="text-gray-medium font-body text-center py-8">No classes for this election.</p></Card>
        ) : (
          classes.map((cls, idx) => (
            <motion.div key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-heading font-bold text-navy">{cls.name}</h4>
                  <button onClick={() => handleDelete(cls.id)} className="text-red-500 hover:text-red-700">
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