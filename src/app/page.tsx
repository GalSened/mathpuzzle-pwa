'use client';

import { useEffect } from 'react';
import { Trophy, Flame, Target, Clock } from 'lucide-react';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTY_LABELS } from '@/engine/difficulty';

export default function Home() {
  const {
    currentPuzzle,
    currentDifficulty,
    stats,
    startNewPuzzle,
    recordResult,
    skipPuzzle,
    useHint,
    hintsUsed
  } = useGameStore();

  useEffect(() => {
    if (!currentPuzzle) {
      startNewPuzzle();
    }
  }, [currentPuzzle, startNewPuzzle]);

  const handleSolve = (expression: Parameters<typeof recordResult>[0]) => {
    recordResult(expression, hintsUsed);
    setTimeout(() => startNewPuzzle(), 1500);
  };

  const handleSkip = () => {
    skipPuzzle();
    startNewPuzzle();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Stats Bar */}
      <header className="glass sticky top-0 z-10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">MathPuzzle</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-amber-400">
              <Target className="w-4 h-4" />
              <span>{DIFFICULTY_LABELS[currentDifficulty]}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-4 h-4" />
              <span>{stats.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <Trophy className="w-4 h-4" />
              <span>{stats.totalSolved}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 py-4">
        {currentPuzzle ? (
          <PuzzleBoard
            puzzle={currentPuzzle}
            onSolve={handleSolve}
            onSkip={handleSkip}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading puzzle...</div>
          </div>
        )}
      </main>

      {/* Footer Stats */}
      <footer className="glass px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Avg: {formatTime(stats.averageTime)}</span>
          </div>
          <div>
            {stats.totalSolved}/{stats.totalAttempted} solved
          </div>
          <div>
            Best: {stats.bestStreak} streak
          </div>
        </div>
      </footer>
    </div>
  );
}
