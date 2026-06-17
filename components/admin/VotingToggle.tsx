'use client';

import { motion } from 'framer-motion';

interface VotingToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function VotingToggle({ isOpen, onToggle }: VotingToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className={`font-body font-semibold ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
        Voting: {isOpen ? 'OPEN' : 'CLOSED'}
      </span>
      <motion.button
        onClick={onToggle}
        className={`relative w-16 h-8 rounded-full transition-colors ${
          isOpen ? 'bg-teal' : 'bg-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ x: isOpen ? 32 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        />
      </motion.button>
    </div>
  );
}