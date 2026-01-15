import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puzzle, Expression, PuzzleArchetype, Operator, EvaluationStep } from '@/engine/types';
import { generator } from '@/engine/generator';
import { adjustDifficulty, DIFFICULTY_PRESETS } from '@/engine/difficulty';
import { calculateXPReward, calculateCoinReward, extractUsedOperators } from '@/engine/adaptive';
import { ALL_OPERATORS } from '@/engine/tiers';
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

type PuzzleStatus = 'idle' | 'transitioning' | 'active';

interface GameState {
  // Puzzle identity and status (for atomic transitions)
  puzzleId: string | null;
  puzzleStatus: PuzzleStatus;

  currentPuzzle: Puzzle | null;
  currentDifficulty: 1 | 2 | 3 | 4 | 5;
  currentZoneId: string | null;
  puzzleStartTime: number | null;
  hintsUsed: number;
  recentResults: PuzzleResult[];
  stats: GameStats;

  // V3: Level-based state
  currentLevelNumber: number | null;

  // Actions (V2: Zone-based)
  startNewPuzzle: (archetype?: PuzzleArchetype, zoneId?: string, isBossMode?: boolean) => void;
  setZone: (zoneId: string) => void;
  recordResult: (expression: Expression, hintsUsed: number, puzzleId?: string) => void;
  skipPuzzle: () => void;
  useHint: () => void;
  resetStats: () => void;

  // V3: Level-based actions
  startPuzzleForLevel: (levelNumber: number) => void;
  setLevel: (levelNumber: number) => void;
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
      // Puzzle identity and status (for atomic transitions)
      puzzleId: null,
      puzzleStatus: 'idle' as PuzzleStatus,

      currentPuzzle: null,
      currentDifficulty: 2,
      currentZoneId: 'addlands',
      puzzleStartTime: null,
      hintsUsed: 0,
      recentResults: [],
      stats: initialStats,

      // V3: Level-based state
      currentLevelNumber: null,

      setZone: (zoneId: string) => {
        set({ currentZoneId: zoneId });
      },

      // V3: Set current level number
      setLevel: (levelNumber: number) => {
        set({ currentLevelNumber: levelNumber });
      },

      // V3: Start puzzle for a specific level (1-30)
      startPuzzleForLevel: (levelNumber: number) => {
        const { puzzleStatus } = get();

        // GUARD: Prevent double-advance during transitions
        if (puzzleStatus === 'transitioning') {
          console.warn('[GameStore] Ignoring startPuzzleForLevel - transition in progress');
          return;
        }

        // Step 1: Lock - enter transitioning state
        set({ puzzleStatus: 'transitioning', currentPuzzle: null, puzzleId: null });

        // Generate puzzle using tier-based generation
        const puzzle = generator.generateForLevel(levelNumber);

        if (puzzle) {
          const newPuzzleId = `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          set({
            puzzleId: newPuzzleId,
            puzzleStatus: 'active',
            currentPuzzle: { ...puzzle, id: newPuzzleId },
            currentLevelNumber: levelNumber,
            puzzleStartTime: Date.now(),
            hintsUsed: 0,
          });
        } else {
          console.error('[GameStore] Failed to generate puzzle for level:', levelNumber);
          set({
            puzzleId: null,
            puzzleStatus: 'idle',
            currentPuzzle: null,
            puzzleStartTime: null,
            hintsUsed: 0,
          });
        }
      },

      startNewPuzzle: (archetype?: PuzzleArchetype, zoneId?: string, isBossMode?: boolean) => {
        const { currentDifficulty, currentZoneId, recentResults, puzzleStatus } = get();

        // GUARD: Prevent double-advance during transitions
        if (puzzleStatus === 'transitioning') {
          console.warn('[GameStore] Ignoring startNewPuzzle - transition in progress');
          return;
        }

        // Step 1: Lock - enter transitioning state
        set({ puzzleStatus: 'transitioning', currentPuzzle: null, puzzleId: null });

        // V3: All operators are always available
        const effectiveZoneId = zoneId || currentZoneId || 'addlands';
        const operators: Operator[] = ALL_OPERATORS;

        // Calculate effective difficulty (boss mode increases difficulty)
        let effectiveDifficulty = currentDifficulty;
        if (isBossMode) {
          // Boss difficulty bonus: +2 to current difficulty
          effectiveDifficulty = Math.min(5, currentDifficulty + 2) as 1 | 2 | 3 | 4 | 5;
        }

        console.log('[DEBUG] V3 Puzzle Generation - Operators:', operators, 'Boss:', isBossMode);

        // Calculate excluded archetypes based on recent puzzles
        const recentArchetypes = recentResults.slice(-3).map(r => r.archetype);
        const excludeArchetypes = recentArchetypes.length >= 2
          ? recentArchetypes.filter((a, i, arr) => arr.indexOf(a) !== i)
          : [];

        // BOSS MODE: Use generateBossPuzzle
        let puzzle: Puzzle | null = null;
        if (isBossMode) {
          console.log('[DEBUG] Using BOSS puzzle generator (5 numbers)');
          puzzle = generator.generateBossPuzzle(operators);
        }

        // Normal puzzle generation
        if (!puzzle) {
          puzzle = archetype
            ? generator.generate(archetype, effectiveDifficulty, operators)
            : generator.generateNext(effectiveDifficulty, excludeArchetypes, operators);
        }

        if (puzzle) {
          const newPuzzleId = `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          set({
            puzzleId: newPuzzleId,
            puzzleStatus: 'active',
            currentPuzzle: { ...puzzle, id: newPuzzleId },
            currentZoneId: effectiveZoneId,
            puzzleStartTime: Date.now(),
            hintsUsed: 0,
          });
        } else {
          // Fallback: try with any archetype
          let fallbackPuzzle = generator.generateNext(effectiveDifficulty, [], operators);

          // Ultimate fallback: create a simple addition puzzle manually
          if (!fallbackPuzzle) {
            fallbackPuzzle = createSimpleAdditionPuzzle(effectiveDifficulty);
          }

          if (fallbackPuzzle) {
            const newPuzzleId = `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            set({
              puzzleId: newPuzzleId,
              puzzleStatus: 'active',
              currentPuzzle: { ...fallbackPuzzle, id: newPuzzleId },
              currentZoneId: effectiveZoneId,
              puzzleStartTime: Date.now(),
              hintsUsed: 0,
            });
          } else {
            // No puzzle could be generated - return to idle
            console.error('[GameStore] Failed to generate any puzzle');
            set({
              puzzleId: null,
              puzzleStatus: 'idle',
              currentPuzzle: null,
              puzzleStartTime: null,
              hintsUsed: 0,
            });
          }
        }
      },

      recordResult: (expression: Expression, hintsUsed: number, submittedPuzzleId?: string) => {
        const { currentPuzzle, puzzleStartTime, recentResults, stats, currentDifficulty, puzzleId } = get();

        // GUARD: Validate puzzle identity to prevent stale results
        if (submittedPuzzleId && submittedPuzzleId !== puzzleId) {
          console.warn('[GameStore] Ignoring stale result for puzzle:', submittedPuzzleId, 'current:', puzzleId);
          return;
        }

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
          // Clear puzzle state atomically
          puzzleId: null,
          puzzleStatus: 'idle',
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
          // Clear puzzle state atomically
          puzzleId: null,
          puzzleStatus: 'idle',
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
          // Clear puzzle state
          puzzleId: null,
          puzzleStatus: 'idle',
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
