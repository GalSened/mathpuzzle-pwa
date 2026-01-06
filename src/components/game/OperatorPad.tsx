'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Operator } from '@/engine/types';

interface OperatorPadProps {
  onSelect: (op: Operator) => void;
  disabled?: boolean;
  allowedOperators?: Operator[];
}

const OPERATORS: { symbol: Operator; label: string }[] = [
  { symbol: '+', label: 'Add' },
  { symbol: '-', label: 'Subtract' },
  { symbol: '×', label: 'Multiply' },
  { symbol: '÷', label: 'Divide' },
];

export function OperatorPad({
  onSelect,
  disabled,
  allowedOperators = ['+', '-', '×', '÷']
}: OperatorPadProps) {
  return (
    <div className="flex gap-3 justify-center">
      {OPERATORS.map(({ symbol, label }) => {
        const isAllowed = allowedOperators.includes(symbol);
        return (
          <motion.button
            key={symbol}
            whileHover={!disabled && isAllowed ? { scale: 1.1 } : undefined}
            whileTap={!disabled && isAllowed ? { scale: 0.9 } : undefined}
            onClick={() => onSelect(symbol)}
            disabled={disabled || !isAllowed}
            aria-label={label}
            className={cn(
              'w-14 h-14 rounded-full font-bold text-2xl transition-all duration-200',
              'border-2 shadow-md',
              isAllowed
                ? 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'
                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {symbol}
          </motion.button>
        );
      })}
    </div>
  );
}
