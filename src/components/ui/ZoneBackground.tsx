'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Zone, ZoneProgressV2, OperatorSkill } from '@/engine/types';
import { MASTERY_THRESHOLD, PUZZLES_PER_LEVEL } from '@/engine/types';

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
function generateSymbolPositions(count: number, seed: string) {
  // Use zone id as seed for deterministic but varied positions
  const hashCode = seed.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const seededRandom = (i: number) => {
    const x = Math.sin(hashCode + i * 1000) * 10000;
    return x - Math.floor(x);
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i) * 100,
    y: seededRandom(i + 100) * 100,
    delay: seededRandom(i + 200) * 5,
    duration: 10 + seededRandom(i + 300) * 10,
    size: 1 + seededRandom(i + 400) * 1.5,
  }));
}

export function ZoneBackground({ zone, isBossMode = false, children }: ZoneBackgroundProps) {
  const symbols = useMemo(() => generateSymbolPositions(8, zone.id), [zone.id]);

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

// Zone selector card with V2 progress display
export function ZoneCard({
  zone,
  isUnlocked,
  isCurrent,
  onClick,
  progress,
  skillLevels,
}: {
  zone: Zone;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClick: () => void;
  progress?: ZoneProgressV2;
  skillLevels?: OperatorSkill;
}) {
  // Calculate mastery progress for this zone
  const masteryProgress = useMemo(() => {
    if (!skillLevels) return 0;
    const opSkills = zone.ops.map(op => skillLevels[op] || 0);
    const avgSkill = opSkills.reduce((sum, s) => sum + s, 0) / opSkills.length;
    return Math.round(avgSkill * 100);
  }, [zone.ops, skillLevels]);

  const isMastered = progress?.status === 'mastered';
  const currentLevel = progress?.currentLevel || 1;
  const currentLevelProgress = progress?.levels[currentLevel];
  const puzzlesInLevel = currentLevelProgress?.puzzlesSolved || 0;

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
      {/* Lock icon for locked zones - V2 message */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
          <span className="text-4xl mb-1">🔒</span>
          <span className="text-xs text-white/70 text-center px-2">
            השלם את האזור הקודם
          </span>
        </div>
      )}

      {/* Mastery badge */}
      {isMastered && (
        <motion.div
          className="absolute top-2 right-2 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <span className="text-2xl" title="אזור הושלם">🏆</span>
        </motion.div>
      )}

      <div className="relative z-10 text-white">
        <h4 className="font-bold text-lg">{zone.nameHe}</h4>
        <p className="text-xs text-white/60">{zone.name}</p>

        {/* Operator skill indicators */}
        <div className="flex gap-1 mt-2 justify-end">
          {zone.ops.map((op) => {
            const skill = skillLevels?.[op] || 0;
            const isOpMastered = skill >= MASTERY_THRESHOLD;
            return (
              <div key={op} className="relative">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded text-sm font-bold ${
                    isOpMastered ? 'bg-green-500/40 ring-1 ring-green-400' : 'bg-white/20'
                  }`}
                >
                  {op}
                </span>
                {isOpMastered && (
                  <span className="absolute -top-1 -right-1 text-[10px]">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Level progress (only if unlocked and has progress) */}
        {isUnlocked && progress && (
          <div className="mt-3 space-y-1">
            {/* Level indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">
                {puzzlesInLevel}/{PUZZLES_PER_LEVEL} חידות
              </span>
              <span className="text-white/80 font-medium">
                שלב {currentLevel}
              </span>
            </div>
            {/* Level progress bar */}
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(puzzlesInLevel / PUZZLES_PER_LEVEL) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Mastery progress */}
            <div className="flex items-center justify-between text-xs mt-2">
              <span className={`${isMastered ? 'text-green-300' : 'text-white/60'}`}>
                {isMastered ? 'הושלם!' : `${masteryProgress}%`}
              </span>
              <span className="text-white/60">שליטה</span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isMastered ? 'bg-green-400' : 'bg-amber-400/60'}`}
                initial={{ width: 0 }}
                animate={{ width: `${masteryProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {isCurrent && !isMastered && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
          נוכחי
        </div>
      )}
    </motion.button>
  );
}
