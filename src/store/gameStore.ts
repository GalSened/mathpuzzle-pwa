import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puzzle, Expression, PuzzleArchetype, Operator, EvaluationStep } from '@/engine/types';
import { generator } from '@/engine/generator';
import { adjustDifficulty, DIFFICULTY_PRESETS } from '@/engine/difficulty';
import { calculateXPReward, calculateCoinReward, extractUsedOperators } from '@/engine/adaptive';
import { getZoneById, getBossInfo } from '@/engine/story';
import { usePlayerStore } from './playerStore';

// Creates a simple addition puzzle for Addlands zone when generator fails
function createSimpleAdditionPuzzle(difficulty: 1 | 2 | 3 | 4 | 5): Puzzle {
  const difficultyProfile = DIFFICULTY_PRESETS[difficulty];
  const [min, max] = difficultyProfile.numberRange;

  // Generate 3 random numbers
  const a = Math.floor(Math.random() * (max - min + 1)) + min;
  const b = Math.floor(Math.random() * (max - min + 1)) + min;
  const c = Math.floor(Math.random() * (max - min + 1)) + min;

  // Target is sum of two of them
  const target = a + b;

  const solutionStep: EvaluationStep = {
    left: a,
    operator: '+',
    right: b,
    result: target,
    notation: `${a} + ${b} = ${target}`
  };

  return {
    id: `simple-${Date.now()}`,
    numbers: [a, b, c],
    availableOperators: ['+'],
    target,
    constraints: {
      mustUseAllNumbers: false,
      allowParentheses: false,
      allowedOperators: ['+'],
      maxSteps: 2,
      allowNegativeIntermediates: false,
      allowFractions: false
    },
    archetype: 'decision',
    difficulty: difficultyProfile,
    signature: `simple-add-${a}-${b}-${c}`,
    solution: {
      notation: solutionStep.notation,
      tree: { type: 'number', value: target },
      result: target,
      steps: [solutionStep],
      complexity: 1
    },
    traps: [],
    alternativeSolutions: [],
    metadata: {
      generatedAt: Date.now(),
      validatedAt: Date.now(),
      estimatedSolveTime: 30
    }
  };
}

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
  currentZoneId: string | null;
  puzzleStartTime: number | null;
  hintsUsed: number;
  recentResults: PuzzleResult[];
  stats: GameStats;

  // Actions
  startNewPuzzle: (archetype?: PuzzleArchetype, zoneId?: string, isBossMode?: boolean) => void;
  setZone: (zoneId: string) => void;
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
      currentZoneId: 'addlands',
      puzzleStartTime: null,
      hintsUsed: 0,
      recentResults: [],
      stats: initialStats,

      setZone: (zoneId: string) => {
        set({ currentZoneId: zoneId });
      },

      startNewPuzzle: (archetype?: PuzzleArchetype, zoneId?: string, isBossMode?: boolean) => {
        const { currentDifficulty, currentZoneId, recentResults } = get();

        // Get zone operators
        const effectiveZoneId = zoneId || currentZoneId || 'addlands';
        const zone = getZoneById(effectiveZoneId);
        const zoneOperators: Operator[] = zone?.ops || ['+'];

        // Calculate effective difficulty (boss mode increases difficulty)
        let effectiveDifficulty = currentDifficulty;
        if (isBossMode && zone) {
          const bossInfo = getBossInfo(zone);
          // Boss difficulty ranges from 2-5, add (difficulty - 1) to base difficulty
          const bossBonus = bossInfo.difficulty - 1;
          effectiveDifficulty = Math.min(5, currentDifficulty + bossBonus) as 1 | 2 | 3 | 4 | 5;
        }

        // For addition-only zones (Addlands), always use simple guaranteed-solvable puzzles
        // The main generator has issues with single-operator constraints
        console.log('[DEBUG] Zone:', effectiveZoneId, 'Operators:', zoneOperators);
        if (zoneOperators.length === 1 && zoneOperators[0] === '+') {
          console.log('[DEBUG] Using simple addition puzzle');
          const simplePuzzle = createSimpleAdditionPuzzle(effectiveDifficulty);
          set({
            currentPuzzle: simplePuzzle,
            currentZoneId: effectiveZoneId,
            puzzleStartTime: Date.now(),
            hintsUsed: 0,
          });
          return;
        }

        // Calculate excluded archetypes based on recent puzzles
        const recentArchetypes = recentResults.slice(-3).map(r => r.archetype);
        const excludeArchetypes = recentArchetypes.length >= 2
          ? recentArchetypes.filter((a, i, arr) => arr.indexOf(a) !== i)
          : [];

        const puzzle = archetype
          ? generator.generate(archetype, effectiveDifficulty, zoneOperators)
          : generator.generateNext(effectiveDifficulty, excludeArchetypes, zoneOperators);

        if (puzzle) {
          set({
            currentPuzzle: puzzle,
            currentZoneId: effectiveZoneId,
            puzzleStartTime: Date.now(),
            hintsUsed: 0,
          });
        } else {
          // Fallback: try with any archetype but keep zone operators
          let fallbackPuzzle = generator.generateNext(effectiveDifficulty, [], zoneOperators);

          // Ultimate fallback: create a simple addition puzzle manually
          if (!fallbackPuzzle && zoneOperators.length === 1 && zoneOperators[0] === '+') {
            fallbackPuzzle = createSimpleAdditionPuzzle(effectiveDifficulty);
          }

          set({
            currentPuzzle: fallbackPuzzle,
            currentZoneId: effectiveZoneId,
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

        // === Phase 2: Player Progression Integration ===
        const playerStore = usePlayerStore.getState();

        // Extract operators used in the solution
        const usedOperators = extractUsedOperators(expression.notation);

        // Update skills for each operator used
        for (const op of usedOperators) {
          playerStore.updateSkill(op, solved);
        }

        if (solved) {
          newStats.totalSolved++;
          newStats.currentStreak++;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
          newStats.averageTime = Math.round(
            (newStats.averageTime * (newStats.totalSolved - 1) + timeMs) / newStats.totalSolved
          );

          // Award XP
          const xpReward = calculateXPReward(
            currentPuzzle.difficulty.level,
            hintsUsed,
            timeMs / 1000,
            currentPuzzle.metadata.estimatedSolveTime
          );
          playerStore.addXP(xpReward);

          // Award coins
          const coinReward = calculateCoinReward(
            currentPuzzle.difficulty.level,
            hintsUsed,
            newStats.currentStreak
          );
          playerStore.addCoins(coinReward, 'puzzle');

          // Streak bonus (every 5 puzzles)
          if (newStats.currentStreak > 0 && newStats.currentStreak % 5 === 0) {
            playerStore.addCoins(0, 'streak'); // Uses COIN_REWARDS.streak
          }

          // Update daily streak
          playerStore.updateDailyStreak();

          // Increment total puzzles solved
          playerStore.incrementPuzzlesSolved();
        } else {
          newStats.currentStreak = 0;
        }

        // Decrement effect durations after each puzzle
        playerStore.decrementEffectDurations();

        newStats.byArchetype[currentPuzzle.archetype].attempted++;
        if (solved) {
          newStats.byArchetype[currentPuzzle.archetype].solved++;
        }

        // Adjust difficulty based on recent performance
        const recent10 = newRecentResults.slice(-10);

        // Calculate PerformanceMetrics from recent results
        const solvedCount = recent10.filter(r => r.solved).length;
        const totalHints = recent10.reduce((sum, r) => sum + r.hintsUsed, 0);
        const solvedTimes = recent10.filter(r => r.solved).map(r => r.timeMs / 1000);
        const avgSolveTime = solvedTimes.length > 0
          ? solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length
          : 60;

        // Calculate streak from recent results (consecutive solves at end)
        let streak = 0;
        for (let i = recent10.length - 1; i >= 0; i--) {
          if (recent10[i].solved) streak++;
          else break;
        }

        const metrics = {
          recentSolveRate: recent10.length > 0 ? solvedCount / recent10.length : 0,
          averageSolveTime: avgSolveTime,
          averageHintsUsed: recent10.length > 0 ? totalHints / recent10.length : 0,
          recentStreak: streak,
        };

        const newDifficulty = adjustDifficulty(currentDifficulty, metrics);

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
          currentZoneId: 'addlands',
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
        currentZoneId: state.currentZoneId,
        recentResults: state.recentResults,
        stats: state.stats,
      }),
    }
  )
);
