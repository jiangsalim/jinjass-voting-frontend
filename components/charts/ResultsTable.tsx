'use client';

import { CandidateResult } from '@/lib/types';

interface ResultsTableProps {
  data: CandidateResult[];
}

export default function ResultsTable({ data }: ResultsTableProps) {
  if (data.length === 0) {
    return <p className="text-gray-medium font-body text-center py-4">No data</p>;
  }

  const maxVotes = Math.max(...data.map(d => d.votes));

  return (
    <div className="space-y-3">
      {data.map((candidate) => (
        <div key={candidate.candidate_id}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-body text-navy font-semibold">
              {candidate.rank}. {candidate.candidate_name}
            </span>
            <span className="font-body text-gray-medium text-sm">
              {candidate.votes} votes
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-500"
              style={{ width: maxVotes > 0 ? `${(candidate.votes / maxVotes) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}