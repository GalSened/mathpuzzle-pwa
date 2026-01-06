'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NumberTileProps {
  value: number;
  state: 'unused' | 'selected' | 'used';
  onClick: () => void;
  disabled?: boolean;
}

export function NumberTile({ value, state, onClick, disabled }: NumberTileProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled || state === 'used'}
      className={cn(
        'w-16 h-16 rounded-xl font-bold text-2xl transition-all duration-200',
        'border-2 shadow-lg',
        state === 'unused' && 'bg-slate-700 border-slate-500 text-white hover:border-blue-400',
        state === 'selected' && 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/50',
        state === 'used' && 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
      )}
    >
      {value}
    </motion.button>
  );
}
