'use client';

import { motion } from 'framer-motion';
import type { ZoneProgressV2 } from '@/engine/types';
import { PUZZLES_PER_LEVEL } from '@/engine/types';

interface LevelProgressDisplayProps {
  progress: ZoneProgressV2;
  showLevelBubbles?: boolean;
}

/**
 * Displays level progress within a zone:
 * - Row of level bubbles (completed, current, locked)
 * - Current level progress bar
 * - Boss defeated indicator
 */
export function LevelProgressDisplay({
  progress,
  showLevelBubbles = true,
}: LevelProgressDisplayProps) {
  const currentLevelNum = progress.currentLevel;
  const currentLevel = progress.levels[currentLevelNum];
  const puzzlesInLevel = currentLevel?.puzzlesSolved || 0;

  // Show up to 5 levels centered around current
  const visibleLevels = getVisibleLevels(currentLevelNum, 5);

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
      {/* Level bubbles */}
      {showLevelBubbles && (
        <div className="flex justify-center gap-2 mb-3">
          {visibleLevels.map((levelNum) => {
            const level = progress.levels[levelNum];
            const isCompleted = level?.status === 'completed';
            const isCurrent = levelNum === currentLevelNum;
            const hasBoss = level?.bossDefeatedAt !== undefined;

            return (
              <LevelBubble
                key={levelNum}
                levelNumber={levelNum}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                hasBoss={hasBoss}
                progress={isCurrent ? (puzzlesInLevel / PUZZLES_PER_LEVEL) : 0}
              />
            );
          })}
        </div>
      )}

      {/* Current level info */}
      <div className="text-center">
        <div className="text-white/60 text-xs mb-1">
          שלב {currentLevelNum}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="flex-1 max-w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(puzzlesInLevel / PUZZLES_PER_LEVEL) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-white text-sm font-medium min-w-[3rem]">
            {puzzlesInLevel}/{PUZZLES_PER_LEVEL}
          </span>
        </div>
      </div>
    </div>
  );
}

interface LevelBubbleProps {
  levelNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  hasBoss: boolean;
  progress: number; // 0-1 for current level
}

function LevelBubble({
  levelNumber,
  isCompleted,
  isCurrent,
  hasBoss,
  progress,
}: LevelBubbleProps) {
  return (
    <div className="relative">
      <motion.div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isCurrent
              ? 'bg-blue-500 text-white ring-2 ring-blue-300'
              : 'bg-slate-700 text-slate-500'
        }`}
        whileHover={{ scale: 1.1 }}
      >
        {isCompleted ? '✓' : levelNumber}

        {/* Progress ring for current level */}
        {isCurrent && progress > 0 && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-blue-300/30"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-cyan-300"
              strokeDasharray={`${progress * 100} 100`}
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${progress * 100} 100` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        )}
      </motion.div>

      {/* Boss crown indicator */}
      {hasBoss && (
        <motion.span
          className="absolute -top-2 -right-1 text-sm"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          👑
        </motion.span>
      )}
    </div>
  );
}

// Helper to get visible level numbers around current
function getVisibleLevels(current: number, count: number): number[] {
  const half = Math.floor(count / 2);
  const start = Math.max(1, current - half);
  const levels: number[] = [];

  for (let i = 0; i < count; i++) {
    levels.push(start + i);
  }

  return levels;
}

// Compact version for in-game display
export function LevelProgressCompact({
  currentLevel,
  puzzlesSolved,
}: {
  currentLevel: number;
  puzzlesSolved: number;
}) {
  return (
    <div className="flex items-center gap-2 bg-slate-800/80 rounded-lg px-3 py-1.5">
      <span className="text-white/60 text-xs">שלב</span>
      <span className="text-white font-bold">{currentLevel}</span>
      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-400 rounded-full"
          animate={{ width: `${(puzzlesSolved / PUZZLES_PER_LEVEL) * 100}%` }}
        />
      </div>
      <span className="text-white/60 text-xs">{puzzlesSolved}/{PUZZLES_PER_LEVEL}</span>
    </div>
  );
}
