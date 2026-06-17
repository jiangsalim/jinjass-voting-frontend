'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import BarChart from '@/components/charts/BarChart';
import ResultsTable from '@/components/charts/ResultsTable';
import { DownloadIcon } from '@/components/ui/Icons';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';
import { Election, ElectionResults } from '@/lib/types';
import { formatEAT } from '@/lib/utils';

export default function ResultsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [electionInfo, setElectionInfo] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) fetchResults();
  }, [selectedElection]);

  async function fetchElections() {
    try {
      const res = await api.get('/api/elections');
      setElections(res.data.elections);
      if (res.data.elections.length > 0) {
        setSelectedElection(String(res.data.elections[0].id));
      }
    } catch (err) {
      showToast('Failed to load elections', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchResults() {
    try {
      const res = await api.get(`/api/results?election_id=${selectedElection}`);
      setResults(res.data.results);
      setElectionInfo(res.data.election);
    } catch (err) {
      showToast('Failed to load results', 'error');
    }
  }

  async function handleExport(format: 'excel' | 'pdf') {
    setExporting(format);
    try {
      const res = await api.get(`/api/results/export?election_id=${selectedElection}&format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`Downloaded as ${format.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Failed to export', 'error');
    } finally {
      setExporting('');
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <p className="text-gray-medium font-body text-center py-12">Loading...</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-heading font-bold text-navy">Results</h2>
        {results && Object.keys(results).length > 0 && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => handleExport('excel')} disabled={exporting === 'excel'}>
              <span className="flex items-center gap-2">
                <DownloadIcon size={16} />
                {exporting === 'excel' ? 'Downloading...' : 'Excel'}
              </span>
            </Button>
            <Button variant="secondary" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
              <span className="flex items-center gap-2">
                <DownloadIcon size={16} />
                {exporting === 'pdf' ? 'Downloading...' : 'PDF'}
              </span>
            </Button>
          </div>
        )}
      </div>

      <Select
        label="Select Election"
        value={selectedElection}
        onChange={(e) => setSelectedElection(e.target.value)}
        options={elections.map(e => ({ value: e.id, label: `${e.title} (${e.year}) - ${e.status.toUpperCase()}` }))}
        className="mb-8"
      />

      {electionInfo && (
        <div className="mb-6 space-y-2">
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-body font-semibold ${
            electionInfo.status === 'closed' ? 'bg-teal text-white' : 'bg-green-500 text-white'
          }`}>
            {electionInfo.status === 'closed' ? 'FINAL RESULTS' : 'IN PROGRESS'}
          </span>
          <p className="text-xs text-gray-medium font-body">
            Created: {formatEAT(electionInfo.created_at)}
            {electionInfo.closed_at && ` | Closed: ${formatEAT(electionInfo.closed_at)}`}
          </p>
        </div>
      )}

      {results && Object.keys(results).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(results).map(([position, candidates], idx) => (
            <motion.div
              key={position}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <h3 className="text-xl font-heading font-bold text-navy mb-4">{position}</h3>
                {electionInfo?.status === 'closed' && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {candidates.filter(c => c.rank === 1).map(c => (
                      <span key={c.candidate_id} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-body font-semibold">
                        Winner: {c.candidate_name}
                      </span>
                    ))}
                  </div>
                )}
                <BarChart data={candidates} positionName={position} />
                <div className="mt-6">
                  <ResultsTable data={candidates} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-gray-medium font-body text-center py-12">
            Select an election to view results.
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