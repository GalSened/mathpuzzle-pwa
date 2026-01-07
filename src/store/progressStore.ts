import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WORLDS, getWorld, getLevel } from '@/engine/worlds';
import { usePlayerStore } from './playerStore';
import type {
  WorldId,
  WorldStatus,
  LevelStatusV3,
  LevelProgressV3,
  WorldProgressV3,
} from '@/engine/types';

// ============== V3 Progress Store ==============
// Designed for 5 Worlds × 6 Levels = 30 Total Levels

interface ProgressStateV3 {
  // Version tracking
  progressVersion: number;  // 3 = V3

  // V3 World/Level State
  worlds: Record<WorldId, WorldProgressV3>;
  currentWorld: WorldId;
  currentLevel: number;           // Global level number (1-30)
  totalLevelsCompleted: number;
  totalPuzzlesSolved: number;

  // Actions
  initializeProgress: () => void;
  recordPuzzleSolved: () => void;
  completeLevel: () => void;
  defeatBoss: () => void;
  setCurrentWorld: (worldId: WorldId) => void;
  setCurrentLevel: (levelNumber: number) => void;
  resetProgress: () => void;

  // Computed / Queries
  getWorldProgress: (worldId: WorldId) => WorldProgressV3 | undefined;
  getLevelProgress: (levelNumber: number) => LevelProgressV3 | undefined;
  isWorldUnlocked: (worldId: WorldId) => boolean;
  isLevelUnlocked: (levelNumber: number) => boolean;
  canAdvanceToNextLevel: () => boolean;
  canAdvanceToNextWorld: () => boolean;
}

// Helper to create initial world progress
function createInitialWorldProgress(worldId: WorldId, isFirstWorld: boolean): WorldProgressV3 {
  const world = getWorld(worldId);
  const levels: Record<number, LevelProgressV3> = {};

  // Initialize first level of the world
  const firstLevel = world.levels[0];
  levels[firstLevel.level] = {
    levelId: firstLevel.level,
    puzzlesSolved: 0,
    puzzlesRequired: firstLevel.puzzlesRequired,
    status: isFirstWorld ? 'in_progress' : 'locked',
    stars: 0,
  };

  return {
    worldId,
    status: isFirstWorld ? 'in_progress' : 'locked',
    levels,
    unlockedAt: isFirstWorld ? Date.now() : undefined,
  };
}

// Build initial V3 progress for all worlds
function buildInitialV3Progress(): Record<WorldId, WorldProgressV3> {
  const progress: Record<WorldId, WorldProgressV3> = {} as Record<WorldId, WorldProgressV3>;
  WORLDS.forEach((world, index) => {
    progress[world.id] = createInitialWorldProgress(world.id, index === 0);
  });
  return progress;
}

export const useProgressStore = create<ProgressStateV3>()(
  persist(
    (set, get) => ({
      // Initial State
      progressVersion: 3,
      worlds: buildInitialV3Progress(),
      currentWorld: 'training',
      currentLevel: 1,
      totalLevelsCompleted: 0,
      totalPuzzlesSolved: 0,

      initializeProgress: () => {
        const state = get();
        if (state.progressVersion >= 3) return;

        set({
          worlds: buildInitialV3Progress(),
          currentWorld: 'training',
          currentLevel: 1,
          totalLevelsCompleted: 0,
          totalPuzzlesSolved: 0,
          progressVersion: 3,
        });
      },

      recordPuzzleSolved: () => {
        set((state) => {
          const levelConfig = getLevel(state.currentLevel);
          const worldProgress = state.worlds[levelConfig.worldId];

          if (!worldProgress || worldProgress.status === 'locked') {
            return {}; // Guard: can't record in locked world
          }

          // Get or initialize level progress
          const levelProgress = worldProgress.levels[state.currentLevel] || {
            levelId: state.currentLevel,
            puzzlesSolved: 0,
            puzzlesRequired: levelConfig.puzzlesRequired,
            status: 'in_progress' as LevelStatusV3,
            stars: 0,
          };

          // Increment puzzle count
          const newPuzzlesSolved = levelProgress.puzzlesSolved + 1;
          const levelComplete = newPuzzlesSolved >= levelConfig.puzzlesRequired;

          const updatedLevel: LevelProgressV3 = {
            ...levelProgress,
            puzzlesSolved: newPuzzlesSolved,
            status: levelComplete ? 'completed' : 'in_progress',
            completedAt: levelComplete ? Date.now() : levelProgress.completedAt,
          };

          // Update world progress
          const updatedWorldProgress: WorldProgressV3 = {
            ...worldProgress,
            levels: {
              ...worldProgress.levels,
              [state.currentLevel]: updatedLevel,
            },
          };

          // Award coins
          const playerStore = usePlayerStore.getState();
          playerStore.addCoins(0, 'puzzle');

          return {
            worlds: {
              ...state.worlds,
              [levelConfig.worldId]: updatedWorldProgress,
            },
            totalPuzzlesSolved: state.totalPuzzlesSolved + 1,
          };
        });
      },

      completeLevel: () => {
        set((state) => {
          const levelConfig = getLevel(state.currentLevel);
          const worldProgress = state.worlds[levelConfig.worldId];

          if (!worldProgress) return {};

          const levelProgress = worldProgress.levels[state.currentLevel];
          if (!levelProgress || levelProgress.status === 'completed') return {};

          // Mark level as complete
          const updatedLevel: LevelProgressV3 = {
            ...levelProgress,
            status: 'completed',
            completedAt: Date.now(),
          };

          // Check if this is the last level in the world
          const world = getWorld(levelConfig.worldId);
          const isLastLevelInWorld = levelConfig.worldLevel === 6;
          const worldComplete = isLastLevelInWorld;

          // Update world status if complete
          const updatedWorldProgress: WorldProgressV3 = {
            ...worldProgress,
            levels: {
              ...worldProgress.levels,
              [state.currentLevel]: updatedLevel,
            },
            status: worldComplete ? 'completed' : 'in_progress',
            completedAt: worldComplete ? Date.now() : worldProgress.completedAt,
          };

          // Determine next level/world
          let newCurrentLevel = state.currentLevel;
          let newCurrentWorld = state.currentWorld;
          const updatedWorlds = {
            ...state.worlds,
            [levelConfig.worldId]: updatedWorldProgress,
          };

          if (worldComplete) {
            // Unlock next world if exists
            const nextWorldIndex = WORLDS.findIndex((w) => w.id === levelConfig.worldId) + 1;
            if (nextWorldIndex < WORLDS.length) {
              const nextWorld = WORLDS[nextWorldIndex];
              const nextWorldProgress = state.worlds[nextWorld.id];

              if (nextWorldProgress && nextWorldProgress.status === 'locked') {
                // Initialize first level of next world
                const firstLevelOfNextWorld = nextWorld.levels[0];
                updatedWorlds[nextWorld.id] = {
                  ...nextWorldProgress,
                  status: 'in_progress',
                  unlockedAt: Date.now(),
                  levels: {
                    ...nextWorldProgress.levels,
                    [firstLevelOfNextWorld.level]: {
                      levelId: firstLevelOfNextWorld.level,
                      puzzlesSolved: 0,
                      puzzlesRequired: firstLevelOfNextWorld.puzzlesRequired,
                      status: 'in_progress',
                      stars: 0,
                    },
                  },
                };

                newCurrentWorld = nextWorld.id;
                newCurrentLevel = firstLevelOfNextWorld.level;
              }
            }
          } else {
            // Move to next level in same world
            const nextLevelInWorld = state.currentLevel + 1;
            const nextLevelConfig = getLevel(nextLevelInWorld);

            // Initialize next level
            updatedWorlds[levelConfig.worldId] = {
              ...updatedWorldProgress,
              levels: {
                ...updatedWorldProgress.levels,
                [nextLevelInWorld]: {
                  levelId: nextLevelInWorld,
                  puzzlesSolved: 0,
                  puzzlesRequired: nextLevelConfig.puzzlesRequired,
                  status: 'in_progress',
                  stars: 0,
                },
              },
            };

            newCurrentLevel = nextLevelInWorld;
          }

          return {
            worlds: updatedWorlds,
            currentWorld: newCurrentWorld,
            currentLevel: newCurrentLevel,
            totalLevelsCompleted: state.totalLevelsCompleted + 1,
          };
        });
      },

      defeatBoss: () => {
        set((state) => {
          const levelConfig = getLevel(state.currentLevel);
          if (!levelConfig.isBoss) return {}; // Guard: not a boss level

          const worldProgress = state.worlds[levelConfig.worldId];
          if (!worldProgress) return {};

          const levelProgress = worldProgress.levels[state.currentLevel];
          if (!levelProgress) return {};

          // Mark boss as defeated
          const updatedLevel: LevelProgressV3 = {
            ...levelProgress,
            bossDefeatedAt: Date.now(),
          };

          const updatedWorldProgress: WorldProgressV3 = {
            ...worldProgress,
            levels: {
              ...worldProgress.levels,
              [state.currentLevel]: updatedLevel,
            },
          };

          // Award boss coins
          const playerStore = usePlayerStore.getState();
          playerStore.addCoins(0, 'boss');

          return {
            worlds: {
              ...state.worlds,
              [levelConfig.worldId]: updatedWorldProgress,
            },
          };
        });
      },

      setCurrentWorld: (worldId: WorldId) => {
        const state = get();
        const worldProgress = state.worlds[worldId];

        if (worldProgress && worldProgress.status !== 'locked') {
          // Find the current active level in this world
          const world = getWorld(worldId);
          let currentLevelInWorld = world.levels[0].level;

          // Find highest unlocked level
          for (const level of world.levels) {
            const progress = worldProgress.levels[level.level];
            if (progress && progress.status !== 'locked') {
              currentLevelInWorld = level.level;
              if (progress.status === 'in_progress') break;
            }
          }

          set({
            currentWorld: worldId,
            currentLevel: currentLevelInWorld,
          });
        }
      },

      setCurrentLevel: (levelNumber: number) => {
        const state = get();
        try {
          const levelConfig = getLevel(levelNumber);
          const worldProgress = state.worlds[levelConfig.worldId];

          if (!worldProgress || worldProgress.status === 'locked') return;

          const levelProgress = worldProgress.levels[levelNumber];
          if (levelProgress && levelProgress.status !== 'locked') {
            set({
              currentWorld: levelConfig.worldId,
              currentLevel: levelNumber,
            });
          }
        } catch {
          // Invalid level number
        }
      },

      resetProgress: () => {
        set({
          worlds: buildInitialV3Progress(),
          currentWorld: 'training',
          currentLevel: 1,
          totalLevelsCompleted: 0,
          totalPuzzlesSolved: 0,
          progressVersion: 3,
        });
      },

      // Query methods
      getWorldProgress: (worldId: WorldId) => {
        return get().worlds[worldId];
      },

      getLevelProgress: (levelNumber: number) => {
        const state = get();
        try {
          const levelConfig = getLevel(levelNumber);
          const worldProgress = state.worlds[levelConfig.worldId];
          return worldProgress?.levels[levelNumber];
        } catch {
          return undefined;
        }
      },

      isWorldUnlocked: (worldId: WorldId) => {
        const worldProgress = get().worlds[worldId];
        return worldProgress ? worldProgress.status !== 'locked' : false;
      },

      isLevelUnlocked: (levelNumber: number) => {
        const state = get();
        try {
          const levelConfig = getLevel(levelNumber);
          const worldProgress = state.worlds[levelConfig.worldId];
          if (!worldProgress || worldProgress.status === 'locked') return false;

          const levelProgress = worldProgress.levels[levelNumber];
          return levelProgress ? levelProgress.status !== 'locked' : false;
        } catch {
          return false;
        }
      },

      canAdvanceToNextLevel: () => {
        const state = get();
        const levelProgress = state.getLevelProgress(state.currentLevel);
        return levelProgress?.status === 'completed';
      },

      canAdvanceToNextWorld: () => {
        const state = get();
        const worldProgress = state.worlds[state.currentWorld];
        return worldProgress?.status === 'completed';
      },
    }),
    {
      name: 'mathpuzzle-progress-v3',
      version: 3,
      partialize: (state) => ({
        progressVersion: state.progressVersion,
        worlds: state.worlds,
        currentWorld: state.currentWorld,
        currentLevel: state.currentLevel,
        totalLevelsCompleted: state.totalLevelsCompleted,
        totalPuzzlesSolved: state.totalPuzzlesSolved,
      }),
      migrate: (persistedState: unknown, version: number) => {
        // Fresh start for V3 - no migration from old zone system
        if (version < 3) {
          return {
            progressVersion: 3,
            worlds: buildInitialV3Progress(),
            currentWorld: 'training' as WorldId,
            currentLevel: 1,
            totalLevelsCompleted: 0,
            totalPuzzlesSolved: 0,
          };
        }
        return persistedState;
      },
    }
  )
);

// ============== Selector Hooks ==============

// Get current world config
export function useCurrentWorld() {
  const currentWorld = useProgressStore((state) => state.currentWorld);
  return getWorld(currentWorld);
}

// Get current level config
export function useCurrentLevel() {
  const currentLevel = useProgressStore((state) => state.currentLevel);
  return getLevel(currentLevel);
}

// Get current level progress
export function useCurrentLevelProgress() {
  const currentLevel = useProgressStore((state) => state.currentLevel);
  const worlds = useProgressStore((state) => state.worlds);

  try {
    const levelConfig = getLevel(currentLevel);
    const worldProgress = worlds[levelConfig.worldId];
    const levelProgress = worldProgress?.levels[currentLevel];

    return {
      levelNumber: currentLevel,
      worldLevel: levelConfig.worldLevel,
      puzzlesSolved: levelProgress?.puzzlesSolved || 0,
      puzzlesRequired: levelConfig.puzzlesRequired,
      status: levelProgress?.status || 'locked',
      isBoss: levelConfig.isBoss,
      tier: levelConfig.tier,
      nameHe: levelConfig.nameHe,
      name: levelConfig.name,
    };
  } catch {
    return null;
  }
}

// Get world progress for display
export function useWorldProgress(worldId: WorldId) {
  const worlds = useProgressStore((state) => state.worlds);
  return worlds[worldId];
}

// Get global progress summary
export function useGlobalProgress() {
  const worlds = useProgressStore((state) => state.worlds);
  const totalLevelsCompleted = useProgressStore((state) => state.totalLevelsCompleted);
  const totalPuzzlesSolved = useProgressStore((state) => state.totalPuzzlesSolved);

  const worldsArray = Object.values(worlds);
  const completedWorlds = worldsArray.filter((w) => w.status === 'completed').length;
  const totalWorlds = WORLDS.length;

  return {
    totalLevelsCompleted,
    totalPuzzlesSolved,
    completedWorlds,
    totalWorlds,
    totalLevels: 30,
    completionPercentage: Math.round((totalLevelsCompleted / 30) * 100),
    worldCompletionPercentage: Math.round((completedWorlds / totalWorlds) * 100),
  };
}

// Check if it's boss time (current level is a boss level)
export function useIsBossLevel() {
  const currentLevel = useProgressStore((state) => state.currentLevel);
  try {
    const levelConfig = getLevel(currentLevel);
    return levelConfig.isBoss;
  } catch {
    return false;
  }
}

// Get all worlds with their status for WorldMap
export function useAllWorldsProgress() {
  const worlds = useProgressStore((state) => state.worlds);

  return WORLDS.map((world) => {
    const progress = worlds[world.id];
    const completedLevels = progress
      ? Object.values(progress.levels).filter((l) => l.status === 'completed').length
      : 0;

    return {
      ...world,
      status: progress?.status || 'locked',
      completedLevels,
      totalLevels: 6,
    };
  });
}

// Get all levels for a world with their status
export function useWorldLevelsProgress(worldId: WorldId) {
  const worlds = useProgressStore((state) => state.worlds);
  const worldProgress = worlds[worldId];
  const world = getWorld(worldId);

  return world.levels.map((level) => {
    const levelProgress = worldProgress?.levels[level.level];

    return {
      ...level,
      status: levelProgress?.status || 'locked',
      puzzlesSolved: levelProgress?.puzzlesSolved || 0,
      stars: levelProgress?.stars || 0,
      completedAt: levelProgress?.completedAt,
      bossDefeatedAt: levelProgress?.bossDefeatedAt,
    };
  });
}
