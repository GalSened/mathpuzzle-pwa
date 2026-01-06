import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puzzle, Expression, PuzzleArchetype } from '@/engine/types';
import { generator } from '@/engine/generator';
import { adjustDifficulty } from '@/engine/difficulty';

interface PuzzleResult {
  puzzleId: string;
  archetype: PuzzleArchetype;
  difficulty: number;
  solved: boolean;
  timeMs: number;
  hintsUsed: number;
  timestamp: number;
}

interface GameStats {
  totalSolved: number;
  totalAttempted: number;
  averageTime: number;
  currentStreak: number;
  bestStreak: number;
  byArchetype: Record<PuzzleArchetype, { solved: number; attempted: number }>;
}

interface GameState {
  currentPuzzle: Puzzle | null;
  currentDifficulty: 1 | 2 | 3 | 4 | 5;
  puzzleStartTime: number | null;
  hintsUsed: number;
  recentResults: PuzzleResult[];
  stats: GameStats;

  // Actions
  startNewPuzzle: (archetype?: PuzzleArchetype) => void;
  recordResult: (expression: Expression, hintsUsed: number) => void;
  skipPuzzle: () => void;
  useHint: () => void;
  resetStats: () => void;
}

const initialStats: GameStats = {
  totalSolved: 0,
  totalAttempted: 0,
  averageTime: 0,
  currentStreak: 0,
  bestStreak: 0,
  byArchetype: {
    decision: { solved: 0, attempted: 0 },
    order: { solved: 0, attempted: 0 },
    trap: { solved: 0, attempted: 0 },
    chain: { solved: 0, attempted: 0 },
    constraint: { solved: 0, attempted: 0 },
    precision: { solved: 0, attempted: 0 },
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentPuzzle: null,
      currentDifficulty: 2,
      puzzleStartTime: null,
      hintsUsed: 0,
      recentResults: [],
      stats: initialStats,

      startNewPuzzle: (archetype?: PuzzleArchetype) => {
        const { currentDifficulty, recentResults } = get();

        // Calculate excluded archetypes based on recent puzzles
        const recentArchetypes = recentResults.slice(-3).map(r => r.archetype);
        const excludeArchetypes = recentArchetypes.length >= 2
          ? recentArchetypes.filter((a, i, arr) => arr.indexOf(a) !== i)
          : [];

        const puzzle = archetype
          ? generator.generate(archetype, currentDifficulty)
          : generator.generateNext(currentDifficulty, excludeArchetypes);

        if (puzzle) {
          set({
            currentPuzzle: puzzle,
            puzzleStartTime: Date.now(),
            hintsUsed: 0,
          });
        } else {
          // Fallback: try with any archetype
          const fallbackPuzzle = generator.generateNext(currentDifficulty, []);
          set({
            currentPuzzle: fallbackPuzzle,
            puzzleStartTime: fallbackPuzzle ? Date.now() : null,
            hintsUsed: 0,
          });
        }
      },

      recordResult: (expression: Expression, hintsUsed: number) => {
        const { currentPuzzle, puzzleStartTime, recentResults, stats, currentDifficulty } = get();

        if (!currentPuzzle || !puzzleStartTime) return;

        const timeMs = Date.now() - puzzleStartTime;
        const solved = expression.result === currentPuzzle.target;

        const result: PuzzleResult = {
          puzzleId: currentPuzzle.id,
          archetype: currentPuzzle.archetype,
          difficulty: currentPuzzle.difficulty.level,
          solved,
          timeMs,
          hintsUsed,
          timestamp: Date.now(),
        };

        const newRecentResults = [...recentResults, result].slice(-50);

        // Update stats
        const newStats = { ...stats };
        newStats.totalAttempted++;

        if (solved) {
          newStats.totalSolved++;
          newStats.currentStreak++;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
          newStats.averageTime = Math.round(
            (newStats.averageTime * (newStats.totalSolved - 1) + timeMs) / newStats.totalSolved
          );
        } else {
          newStats.currentStreak = 0;
        }

        newStats.byArchetype[currentPuzzle.archetype].attempted++;
        if (solved) {
          newStats.byArchetype[currentPuzzle.archetype].solved++;
        }

        // Adjust difficulty based on recent performance
        const recent10 = newRecentResults.slice(-10);
        const newDifficulty = adjustDifficulty(
          currentDifficulty,
          recent10.map(r => ({
            solved: r.solved,
            timeMs: r.timeMs,
            hintsUsed: r.hintsUsed,
            difficulty: r.difficulty as 1 | 2 | 3 | 4 | 5,
          }))
        );

        set({
          recentResults: newRecentResults,
          stats: newStats,
          currentDifficulty: newDifficulty,
          currentPuzzle: null,
          puzzleStartTime: null,
        });
      },

      skipPuzzle: () => {
        const { currentPuzzle, puzzleStartTime, recentResults, stats } = get();

        if (!currentPuzzle) return;

        const timeMs = puzzleStartTime ? Date.now() - puzzleStartTime : 0;

        const result: PuzzleResult = {
          puzzleId: currentPuzzle.id,
          archetype: currentPuzzle.archetype,
          difficulty: currentPuzzle.difficulty.level,
          solved: false,
          timeMs,
          hintsUsed: get().hintsUsed,
          timestamp: Date.now(),
        };

        const newRecentResults = [...recentResults, result].slice(-50);

        const newStats = { ...stats };
        newStats.totalAttempted++;
        newStats.currentStreak = 0;
        newStats.byArchetype[currentPuzzle.archetype].attempted++;

        set({
          recentResults: newRecentResults,
          stats: newStats,
          currentPuzzle: null,
          puzzleStartTime: null,
        });
      },

      useHint: () => {
        set(state => ({ hintsUsed: state.hintsUsed + 1 }));
      },

      resetStats: () => {
        generator.clearHistory();
        set({
          stats: initialStats,
          recentResults: [],
          currentDifficulty: 2,
          currentPuzzle: null,
          puzzleStartTime: null,
          hintsUsed: 0,
        });
      },
    }),
    {
      name: 'mathpuzzle-game',
      partialize: (state) => ({
        currentDifficulty: state.currentDifficulty,
        recentResults: state.recentResults,
        stats: state.stats,
      }),
    }
  )
);
