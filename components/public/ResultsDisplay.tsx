'use client';

import { ElectionResults, SystemSettings } from '@/lib/types';
import BarChart from '@/components/charts/BarChart';
import ResultsTable from '@/components/charts/ResultsTable';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface ResultsDisplayProps {
  results: ElectionResults | null;
  settings: SystemSettings | null;
}

export default function ResultsDisplay({ results, settings }: ResultsDisplayProps) {
  if (!settings?.current_election) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-medium font-body">No active election at this time.</p>
      </div>
    );
  }

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-medium font-body">Results will appear here once voting begins.</p>
      </div>
    );
  }

  const displayType = settings?.display_type || 'graphs';

  return (
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
            {displayType === 'graphs' ? (
              <BarChart data={candidates} positionName={position} />
            ) : (
              <ResultsTable data={candidates} />
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}