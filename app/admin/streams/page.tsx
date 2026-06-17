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
import { Class, Stream } from '@/lib/types';

export default function StreamsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [totalStudents, setTotalStudents] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchAllClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchStreams();
  }, [selectedClass]);

  async function fetchAllClasses() {
    try {
      const electionsRes = await api.get('/api/elections');
      const allClasses: Class[] = [];
      for (const e of electionsRes.data.elections) {
        const classesRes = await api.get(`/api/classes?election_id=${e.id}`);
        allClasses.push(...classesRes.data.classes);
      }
      setClasses(allClasses);
      if (allClasses.length > 0 && !selectedClass) {
        setSelectedClass(String(allClasses[0].id));
      }
    } catch (err) {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStreams() {
    try {
      const res = await api.get(`/api/streams?class_id=${selectedClass}`);
      setStreams(res.data.streams);
    } catch (err) {
      showToast('Failed to load streams', 'error');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/streams', {
        name,
        class_id: Number(selectedClass),
        total_students: Number(totalStudents),
      });
      setName('');
      setTotalStudents('');
      setShowForm(false);
      showToast('Stream created', 'success');
      fetchStreams();
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to create stream', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this stream?')) return;
    try {
      await api.delete(`/api/streams/${id}`);
      showToast('Stream deleted', 'success');
      fetchStreams();
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
        <h2 className="text-3xl font-heading font-bold text-navy">Streams</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedClass}>
          <span className="flex items-center gap-2"><PlusIcon size={18} />Add Stream</span>
        </Button>
      </div>

      <Select
        label="Select Class"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        options={classes.map(c => ({ value: c.id, label: c.name }))}
        className="mb-6"
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <Card>
              <form onSubmit={handleCreate}>
                <h3 className="text-xl font-heading font-bold text-navy mb-4">Add Stream</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Stream Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., A" required />
                  <Input label="Total Students" type="number" value={totalStudents} onChange={(e) => setTotalStudents(e.target.value)} placeholder="e.g., 45" required min={1} />
                </div>
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
        {streams.length === 0 ? (
          <Card><p className="text-gray-medium font-body text-center py-8">No streams for this class.</p></Card>
        ) : (
          streams.map((stream, idx) => (
            <motion.div key={stream.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-heading font-bold text-navy">{stream.name}</h4>
                    <p className="text-gray-medium font-body text-sm">Students: {stream.total_students}</p>
                  </div>
                  <button onClick={() => handleDelete(stream.id)} className="text-red-500 hover:text-red-700">
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