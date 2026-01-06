'use client';

import { useEffect } from 'react';
import { Trophy, Flame, Target, Clock, User } from 'lucide-react';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';
import { WelcomePage } from '@/components/onboarding/WelcomePage';
import { Tutorial } from '@/components/onboarding/Tutorial';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { he } from '@/lib/i18n';

const DIFFICULTY_LABELS_HE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: he.tutorial,
  2: he.easy,
  3: he.medium,
  4: he.hard,
  5: he.expert,
};

export default function Home() {
  const {
    currentPuzzle,
    currentDifficulty,
    stats,
    startNewPuzzle,
    recordResult,
    skipPuzzle,
    hintsUsed
  } = useGameStore();

  const {
    name,
    hasCompletedOnboarding,
    hasSeenTutorial,
  } = useUserStore();

  useEffect(() => {
    if (hasCompletedOnboarding && hasSeenTutorial && !currentPuzzle) {
      startNewPuzzle();
    }
  }, [currentPuzzle, startNewPuzzle, hasCompletedOnboarding, hasSeenTutorial]);

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <WelcomePage />;
  }

  // Show tutorial if not seen
  if (!hasSeenTutorial) {
    return <Tutorial />;
  }

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
    if (seconds < 60) return `${seconds}${he.avgTime.includes('שניות') ? '' : 's'}`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Header Stats Bar */}
      <header className="glass sticky top-0 z-10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{he.appName}</h1>
            {name && (
              <span className="text-sm text-purple-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                {name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-amber-400">
              <Target className="w-4 h-4" />
              <span>{DIFFICULTY_LABELS_HE[currentDifficulty]}</span>
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
            key={currentPuzzle.id}
            puzzle={currentPuzzle}
            onSolve={handleSolve}
            onSkip={handleSkip}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">טוען חידה...</div>
          </div>
        )}
      </main>

      {/* Footer Stats */}
      <footer className="glass px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{he.avgTime} {formatTime(stats.averageTime)}</span>
          </div>
          <div>
            {stats.totalSolved}/{stats.totalAttempted} {he.solved}
          </div>
          <div>
            {he.bestStreak} {stats.bestStreak}
          </div>
        </div>
      </footer>
    </div>
  );
}
