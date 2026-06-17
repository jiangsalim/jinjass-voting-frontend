'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { SchoolIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Class, Stream } from '@/lib/types';

export default function TeacherDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchAvailableStreams();
  }, [selectedClass]);

  async function fetchClasses() {
    try {
      const settingsRes = await api.get('/api/settings');
      if (settingsRes.data.current_election) {
        const classesRes = await api.get(`/api/classes?election_id=${settingsRes.data.current_election.id}`);
        setClasses(classesRes.data.classes);
      }
    } catch (err) {
      showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableStreams() {
    try {
      const res = await api.get(`/api/votes/available-streams?class_id=${selectedClass}`);
      setAvailableStreams(res.data.streams);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        showToast('Voting is currently closed', 'error');
      } else {
        showToast('Failed to load streams', 'error');
      }
    }
  }

  function handleSelectStream(streamId: number) {
    router.push(`/teacher/submit/${streamId}`);
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-medium font-body">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-navy mb-2">Enter Vote Tally</h2>
        <p className="text-gray-medium font-body">
          Select a class to see available streams that still need vote tallies submitted.
        </p>
      </Card>

      {/* Class Selector */}
      <Card className="mb-6">
        <Select
          label="Select Class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          options={classes.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Choose a class..."
          required
        />
      </Card>

      {/* Available Streams */}
      {selectedClass && (
        <div>
          <h3 className="text-xl font-heading font-bold text-navy mb-4">
            Available Streams
            <span className="text-gray-medium font-body text-sm ml-2">
              ({availableStreams.length} remaining)
            </span>
          </h3>

          {availableStreams.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <SchoolIcon size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-medium font-body">
                  All streams for this class have been submitted.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableStreams.map((stream, idx) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="cursor-pointer hover:border-teal transition-colors">
                    <div className="text-center">
                      <SchoolIcon size={32} className="mx-auto text-teal mb-3" />
                      <h4 className="text-lg font-heading font-bold text-navy">{stream.name}</h4>
                      <p className="text-gray-medium font-body text-sm mt-1">
                        {stream.total_students} students
                      </p>
                      <Button 
                        className="mt-4 w-full" 
                        variant="primary"
                        onClick={() => handleSelectStream(stream.id)}
                      >
                        Enter Votes
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
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