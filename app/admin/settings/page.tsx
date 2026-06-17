'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';

export default function SettingsPage() {
  const [displayType, setDisplayType] = useState<'graphs' | 'counts'>('graphs');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get('/api/settings');
      setDisplayType(res.data.display_type);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/api/settings/display-type', { display_type: displayType });
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading settings...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-3xl font-heading font-bold text-navy mb-2">Settings</h2>
      <p className="text-gray-medium font-body mb-8">
        Configure how results appear on the public school site embed.
      </p>

      <Card className="max-w-lg">
        <h3 className="text-xl font-heading font-bold text-navy mb-4">Public Display Type</h3>
        <p className="text-gray-medium font-body mb-6">
          Choose how results are displayed on the school website during and after voting.
        </p>

        <div className="space-y-3 mb-6">
          <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            displayType === 'graphs' ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="displayType"
              value="graphs"
              checked={displayType === 'graphs'}
              onChange={() => setDisplayType('graphs')}
              className="w-4 h-4 text-teal"
            />
            <div>
              <p className="font-body font-semibold text-navy">Bar Charts (Graphs)</p>
              <p className="text-sm text-gray-medium font-body">Visual bar charts comparing candidates per position</p>
            </div>
          </label>

          <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            displayType === 'counts' ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="displayType"
              value="counts"
              checked={displayType === 'counts'}
              onChange={() => setDisplayType('counts')}
              className="w-4 h-4 text-teal"
            />
            <div>
              <p className="font-body font-semibold text-navy">Number Counts (Table)</p>
              <p className="text-sm text-gray-medium font-body">Simple progress bars with vote numbers</p>
            </div>
          </label>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Card>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
}