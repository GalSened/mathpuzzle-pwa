'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Zone } from '@/engine/types';

interface ZoneBackgroundProps {
  zone: Zone;
  isBossMode?: boolean;
  children: React.ReactNode;
}

// Floating operator symbols for each zone pattern
const ZONE_SYMBOLS: Record<string, string[]> = {
  'plus-signs': ['+', '+', '+', '+', '+'],
  'minus-signs': ['-', '-', '+', '-', '+'],
  'multiplication': ['×', '×', '+', '-', '×'],
  'division': ['÷', '×', '-', '+', '÷'],
};

// Generate random positions for floating symbols
function generateSymbolPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 1 + Math.random() * 1.5,
  }));
}

export function ZoneBackground({ zone, isBossMode = false, children }: ZoneBackgroundProps) {
  const [symbols, setSymbols] = useState<ReturnType<typeof generateSymbolPositions>>([]);

  useEffect(() => {
    setSymbols(generateSymbolPositions(8));
  }, [zone.id]);

  const patternSymbols = ZONE_SYMBOLS[zone.theme.pattern] || ['+'];

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${zone.theme.background}`}>
      {/* Animated floating symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {symbols.map((pos) => (
          <motion.div
            key={pos.id}
            className={`absolute text-${zone.theme.accent}/10 font-bold select-none`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              fontSize: `${pos.size}rem`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, -10, 0],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: pos.duration,
              delay: pos.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {patternSymbols[pos.id % patternSymbols.length]}
          </motion.div>
        ))}
      </div>

      {/* Boss mode overlay */}
      {isBossMode && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(255,0,0,0) 0%, rgba(255,0,0,0.1) 100%)',
              'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0) 100%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      )}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Simple zone banner for home screen
export function ZoneBanner({ zone }: { zone: Zone }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${zone.theme.background} p-4 mb-4`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="flex flex-wrap gap-2 text-4xl font-bold">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className="select-none">
              {zone.ops[i % zone.ops.length]}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-${zone.theme.accent} animate-pulse`} />
          <h3 className="text-lg font-bold">{zone.nameHe}</h3>
        </div>
        <p className="text-sm text-white/70 mt-1">{zone.descriptionHe}</p>
        <div className="flex gap-2 mt-2">
          {zone.ops.map((op) => (
            <span
              key={op}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white font-bold"
            >
              {op}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Zone selector card
export function ZoneCard({
  zone,
  isUnlocked,
  isCurrent,
  onClick,
}: {
  zone: Zone;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`relative overflow-hidden rounded-xl p-4 text-right transition-all ${
        isUnlocked
          ? `bg-gradient-to-br ${zone.theme.background} cursor-pointer`
          : 'bg-gray-800 cursor-not-allowed opacity-50'
      } ${isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
    >
      {/* Lock icon for locked zones */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <span className="text-4xl">🔒</span>
          <span className="text-sm text-white/70 mt-1">שלב {zone.unlockLevel}</span>
        </div>
      )}

      <div className="relative z-10 text-white">
        <h4 className="font-bold text-lg">{zone.nameHe}</h4>
        <p className="text-xs text-white/60">{zone.name}</p>
        <div className="flex gap-1 mt-2 justify-end">
          {zone.ops.map((op) => (
            <span
              key={op}
              className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/20 text-sm font-bold"
            >
              {op}
            </span>
          ))}
        </div>
      </div>

      {isCurrent && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
          נוכחי
        </div>
      )}
    </motion.button>
  );
}
