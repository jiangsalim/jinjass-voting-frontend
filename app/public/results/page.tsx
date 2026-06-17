'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ResultsDisplay from '@/components/public/ResultsDisplay';
import api from '@/lib/api';
import { ElectionResults, SystemSettings } from '@/lib/types';

export default function PublicResultsPage() {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchResults() {
    try {
      const res = await api.get('/api/public/results');
      setResults(res.data.results);
      setSettings({
        voting_open: res.data.voting_open,
        display_type: res.data.display_type,
        current_election: res.data.election,
      });
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <p className="text-gray-medium font-body">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="bg-navy px-8 py-6 shadow-lg"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Jinja<span className="text-teal">SS</span> Election Results
          </h1>
          {settings?.current_election && (
            <p className="text-gray-300 font-body">
              {settings.current_election.title} ({settings.current_election.year})
            </p>
          )}
          <div className="mt-3">
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-body font-semibold ${
              settings?.voting_open
                ? 'bg-green-500 text-white'
                : 'bg-teal text-white'
            }`}>
              {settings?.voting_open ? 'VOTING IN PROGRESS' : 'FINAL RESULTS'}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Results */}
      <main className="max-w-5xl mx-auto p-8">
        <ResultsDisplay results={results} settings={settings} />
      </main>

      {/* Footer */}
      <footer className="bg-navy-dark py-4 text-center">
        <p className="text-gray-medium text-sm font-body">
          JinjaSS Voting Portal
        </p>
      </footer>
    </div>
  );
}