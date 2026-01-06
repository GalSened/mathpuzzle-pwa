import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZONES, getCurrentZone, getNextZoneToUnlock } from '@/engine/story';
import { usePlayerStore } from './playerStore';
import type { ZoneProgressV2, LevelProgress, ZoneStatus } from '@/engine/types';
import { MASTERY_THRESHOLD, PUZZLES_PER_LEVEL } from '@/engine/types';

// V1 Zone Progress (legacy)
interface ZoneProgress {
  solved: number;
  total: number;
  bossDefeated: boolean;
}

interface ProgressState {
  // V1 State (legacy - kept for migration)
  currentZoneId: string;
  zoneProgress: Record<string, ZoneProgress>;
  bossesDefeated: string[];
  unlockedZones: string[];
  puzzlesSinceLastBoss: number;

  // V2 State - comprehensive progress tracking
  zoneProgressV2: Record<string, ZoneProgressV2>;
  globalLevelCount: number;        // Total levels completed across all zones
  currentLevelInZone: number;      // Current level number in active zone
  progressVersion: number;         // For migration detection (2 = V2)

  // V1 Actions (legacy)
  initializeProgress: () => void;
  recordPuzzleSolved: (zoneId: string) => void;
  defeatBoss: (zoneId: string) => void;
  checkZoneUnlocks: () => void;
  setCurrentZone: (zoneId: string) => void;
  resetProgress: () => void;

  // V2 Actions
  initializeProgressV2: () => void;
  recordPuzzleSolvedV2: (zoneId: string) => void;
  defeatBossV2: (zoneId: string) => void;
  checkZoneMastery: (zoneId: string) => boolean;
  checkAndUnlockNextZone: () => void;
  migrateFromV1: () => void;
}

const initialZoneProgress: Record<string, ZoneProgress> = {};
ZONES.forEach(zone => {
  initialZoneProgress[zone.id] = {
    solved: 0,
    total: 0,
    bossDefeated: false,
  };
});

// Helper to create initial V2 zone progress
function createInitialZoneProgressV2(zoneId: string, isFirstZone: boolean): ZoneProgressV2 {
  const status: ZoneStatus = isFirstZone ? 'in_progress' : 'locked';
  const initialLevel: LevelProgress = {
    levelNumber: 1,
    puzzlesSolved: 0,
    status: isFirstZone ? 'in_progress' : 'locked',
  };

  return {
    zoneId,
    status,
    currentLevel: 1,
    levels: { 1: initialLevel },
    totalPuzzlesSolved: 0,
    totalBossesDefeated: 0,
    unlockedAt: isFirstZone ? Date.now() : undefined,
  };
}

// Build initial V2 progress for all zones
const initialZoneProgressV2: Record<string, ZoneProgressV2> = {};
ZONES.forEach((zone, index) => {
  initialZoneProgressV2[zone.id] = createInitialZoneProgressV2(zone.id, index === 0);
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // V1 State (legacy)
      currentZoneId: 'addlands',
      zoneProgress: initialZoneProgress,
      bossesDefeated: [],
      unlockedZones: ['addlands'],
      puzzlesSinceLastBoss: 0,

      // V2 State
      zoneProgressV2: initialZoneProgressV2,
      globalLevelCount: 0,
      currentLevelInZone: 1,
      progressVersion: 1,  // Will be set to 2 after migration

      initializeProgress: () => {
        const playerStore = usePlayerStore.getState();
        const currentZone = getCurrentZone(playerStore);

        // Unlock all zones the player's level qualifies for
        const unlockedZones = ZONES
          .filter(zone => playerStore.level >= zone.unlockLevel)
          .map(zone => zone.id);

        set({
          currentZoneId: currentZone.id,
          unlockedZones,
        });
      },

      recordPuzzleSolved: (zoneId: string) => {
        set((state) => {
          const currentProgress = state.zoneProgress[zoneId] || {
            solved: 0,
            total: 0,
            bossDefeated: false,
          };

          const newProgress = {
            ...currentProgress,
            solved: currentProgress.solved + 1,
            total: currentProgress.total + 1,
          };

          // Check if it's time for a boss fight
          const zone = ZONES.find(z => z.id === zoneId);
          const newPuzzlesSinceLastBoss = state.puzzlesSinceLastBoss + 1;
          const isBossTime = zone && newPuzzlesSinceLastBoss >= zone.bossEvery;

          return {
            zoneProgress: {
              ...state.zoneProgress,
              [zoneId]: newProgress,
            },
            puzzlesSinceLastBoss: isBossTime ? 0 : newPuzzlesSinceLastBoss,
          };
        });
      },

      defeatBoss: (zoneId: string) => {
        set((state) => {
          const currentProgress = state.zoneProgress[zoneId];

          // Award boss coins
          const playerStore = usePlayerStore.getState();
          playerStore.addCoins(0, 'boss'); // Uses COIN_REWARDS.boss

          return {
            bossesDefeated: [...state.bossesDefeated, zoneId],
            zoneProgress: {
              ...state.zoneProgress,
              [zoneId]: {
                ...currentProgress,
                bossDefeated: true,
              },
            },
            puzzlesSinceLastBoss: 0,
          };
        });
      },

      checkZoneUnlocks: () => {
        const playerStore = usePlayerStore.getState();
        const nextZone = getNextZoneToUnlock(playerStore);

        if (nextZone && playerStore.level >= nextZone.unlockLevel) {
          set((state) => {
            if (!state.unlockedZones.includes(nextZone.id)) {
              return {
                unlockedZones: [...state.unlockedZones, nextZone.id],
              };
            }
            return {};
          });
        }
      },

      setCurrentZone: (zoneId: string) => {
        const state = get();
        if (state.unlockedZones.includes(zoneId)) {
          set({ currentZoneId: zoneId });
        }
      },

      resetProgress: () => {
        set({
          currentZoneId: 'addlands',
          zoneProgress: initialZoneProgress,
          bossesDefeated: [],
          unlockedZones: ['addlands'],
          puzzlesSinceLastBoss: 0,
          // Also reset V2 state
          zoneProgressV2: initialZoneProgressV2,
          globalLevelCount: 0,
          currentLevelInZone: 1,
          progressVersion: 2,
        });
      },

      // ============== V2 Actions ==============

      initializeProgressV2: () => {
        const state = get();
        // Only initialize if not already at V2
        if (state.progressVersion >= 2) return;

        // Build fresh V2 progress with first zone unlocked
        const freshV2Progress: Record<string, ZoneProgressV2> = {};
        ZONES.forEach((zone, index) => {
          freshV2Progress[zone.id] = createInitialZoneProgressV2(zone.id, index === 0);
        });

        set({
          zoneProgressV2: freshV2Progress,
          globalLevelCount: 0,
          currentLevelInZone: 1,
          progressVersion: 2,
        });
      },

      recordPuzzleSolvedV2: (zoneId: string) => {
        set((state) => {
          const zoneProgress = state.zoneProgressV2[zoneId];
          if (!zoneProgress || zoneProgress.status === 'locked') {
            return {}; // Guard: can't record progress in locked zone
          }

          const currentLevelNum = zoneProgress.currentLevel;
          const currentLevel = zoneProgress.levels[currentLevelNum] || {
            levelNumber: currentLevelNum,
            puzzlesSolved: 0,
            status: 'in_progress' as const,
          };

          // Increment puzzle count
          const newPuzzlesSolved = currentLevel.puzzlesSolved + 1;
          const levelComplete = newPuzzlesSolved >= PUZZLES_PER_LEVEL;

          const updatedLevel: LevelProgress = {
            ...currentLevel,
            puzzlesSolved: newPuzzlesSolved,
            status: levelComplete ? 'completed' : 'in_progress',
            completedAt: levelComplete ? Date.now() : currentLevel.completedAt,
          };

          // If level complete, prepare next level
          let newLevels = { ...zoneProgress.levels, [currentLevelNum]: updatedLevel };
          let newCurrentLevel = currentLevelNum;
          let newGlobalCount = state.globalLevelCount;

          if (levelComplete) {
            newCurrentLevel = currentLevelNum + 1;
            newGlobalCount += 1;
            // Initialize next level
            newLevels[newCurrentLevel] = {
              levelNumber: newCurrentLevel,
              puzzlesSolved: 0,
              status: 'in_progress',
            };
          }

          const updatedZoneProgress: ZoneProgressV2 = {
            ...zoneProgress,
            currentLevel: newCurrentLevel,
            levels: newLevels,
            totalPuzzlesSolved: zoneProgress.totalPuzzlesSolved + 1,
          };

          return {
            zoneProgressV2: {
              ...state.zoneProgressV2,
              [zoneId]: updatedZoneProgress,
            },
            currentLevelInZone: newCurrentLevel,
            globalLevelCount: newGlobalCount,
          };
        });
      },

      defeatBossV2: (zoneId: string) => {
        set((state) => {
          const zoneProgress = state.zoneProgressV2[zoneId];
          if (!zoneProgress || zoneProgress.status === 'locked') {
            return {}; // Guard: can't defeat boss in locked zone
          }

          const currentLevelNum = zoneProgress.currentLevel;
          const currentLevel = zoneProgress.levels[currentLevelNum];

          if (!currentLevel) return {};

          // Record boss defeat on current level
          const updatedLevel: LevelProgress = {
            ...currentLevel,
            bossDefeatedAt: Date.now(),
          };

          const updatedZoneProgress: ZoneProgressV2 = {
            ...zoneProgress,
            levels: { ...zoneProgress.levels, [currentLevelNum]: updatedLevel },
            totalBossesDefeated: zoneProgress.totalBossesDefeated + 1,
          };

          // Award boss coins
          const playerStore = usePlayerStore.getState();
          playerStore.addCoins(0, 'boss');

          return {
            zoneProgressV2: {
              ...state.zoneProgressV2,
              [zoneId]: updatedZoneProgress,
            },
          };
        });
      },

      checkZoneMastery: (zoneId: string) => {
        const state = get();
        const zoneProgress = state.zoneProgressV2[zoneId];

        if (!zoneProgress || zoneProgress.status === 'mastered') {
          return zoneProgress?.status === 'mastered';
        }

        // Get zone operators
        const zone = ZONES.find(z => z.id === zoneId);
        if (!zone) return false;

        // Check skill mastery for all zone operators
        const playerStore = usePlayerStore.getState();
        const allOperatorsMastered = zone.ops.every(
          op => playerStore.skill[op] >= MASTERY_THRESHOLD
        );

        if (allOperatorsMastered) {
          // Mark zone as mastered
          set((s) => ({
            zoneProgressV2: {
              ...s.zoneProgressV2,
              [zoneId]: {
                ...s.zoneProgressV2[zoneId],
                status: 'mastered',
                masteredAt: Date.now(),
              },
            },
          }));
          return true;
        }

        return false;
      },

      checkAndUnlockNextZone: () => {
        const state = get();
        const currentZoneId = state.currentZoneId;
        const currentZoneProgress = state.zoneProgressV2[currentZoneId];

        // Guard: only unlock if current zone is mastered
        if (!currentZoneProgress || currentZoneProgress.status !== 'mastered') {
          return;
        }

        // Find next zone in sequence
        const currentZoneIndex = ZONES.findIndex(z => z.id === currentZoneId);
        const nextZone = ZONES[currentZoneIndex + 1];

        if (!nextZone) return; // No more zones to unlock

        const nextZoneProgress = state.zoneProgressV2[nextZone.id];
        if (nextZoneProgress && nextZoneProgress.status === 'locked') {
          // Unlock next zone
          set((s) => ({
            zoneProgressV2: {
              ...s.zoneProgressV2,
              [nextZone.id]: {
                ...s.zoneProgressV2[nextZone.id],
                status: 'in_progress',
                unlockedAt: Date.now(),
                levels: {
                  1: {
                    levelNumber: 1,
                    puzzlesSolved: 0,
                    status: 'in_progress',
                  },
                },
              },
            },
            // Also update V1 for backwards compatibility
            unlockedZones: [...s.unlockedZones, nextZone.id],
          }));
        }
      },

      migrateFromV1: () => {
        const state = get();

        // Skip if already migrated
        if (state.progressVersion >= 2) return;

        // Build V2 progress from V1 data
        const migratedV2Progress: Record<string, ZoneProgressV2> = {};

        ZONES.forEach((zone, index) => {
          const v1Progress = state.zoneProgress[zone.id];
          const isUnlocked = state.unlockedZones.includes(zone.id);
          const bossDefeated = state.bossesDefeated.includes(zone.id);

          // Calculate levels from V1 puzzles solved
          const puzzlesSolved = v1Progress?.solved || 0;
          const completedLevels = Math.floor(puzzlesSolved / PUZZLES_PER_LEVEL);
          const puzzlesInCurrentLevel = puzzlesSolved % PUZZLES_PER_LEVEL;
          const currentLevel = completedLevels + 1;

          // Build levels record
          const levels: Record<number, LevelProgress> = {};
          for (let i = 1; i <= completedLevels; i++) {
            levels[i] = {
              levelNumber: i,
              puzzlesSolved: PUZZLES_PER_LEVEL,
              status: 'completed',
              completedAt: Date.now(), // Approximate
            };
          }
          // Current level
          levels[currentLevel] = {
            levelNumber: currentLevel,
            puzzlesSolved: puzzlesInCurrentLevel,
            status: puzzlesInCurrentLevel > 0 ? 'in_progress' : (isUnlocked ? 'in_progress' : 'locked'),
          };

          // Check mastery status based on skills
          const playerStore = usePlayerStore.getState();
          const allOpsMastered = zone.ops.every(
            op => playerStore.skill[op] >= MASTERY_THRESHOLD
          );

          const status: ZoneStatus = allOpsMastered
            ? 'mastered'
            : (isUnlocked ? 'in_progress' : 'locked');

          migratedV2Progress[zone.id] = {
            zoneId: zone.id,
            status,
            currentLevel,
            levels,
            totalPuzzlesSolved: puzzlesSolved,
            totalBossesDefeated: bossDefeated ? 1 : 0,
            masteredAt: allOpsMastered ? Date.now() : undefined,
            unlockedAt: isUnlocked ? Date.now() : undefined,
          };
        });

        // Calculate global level count
        const globalLevelCount = Object.values(migratedV2Progress)
          .reduce((sum, zp) => sum + Math.floor(zp.totalPuzzlesSolved / PUZZLES_PER_LEVEL), 0);

        set({
          zoneProgressV2: migratedV2Progress,
          globalLevelCount,
          currentLevelInZone: migratedV2Progress[state.currentZoneId]?.currentLevel || 1,
          progressVersion: 2,
        });
      },
    }),
    {
      name: 'mathpuzzle-progress',
      version: 2,
      partialize: (state) => ({
        // V1 State (kept for backwards compatibility)
        currentZoneId: state.currentZoneId,
        zoneProgress: state.zoneProgress,
        bossesDefeated: state.bossesDefeated,
        unlockedZones: state.unlockedZones,
        puzzlesSinceLastBoss: state.puzzlesSinceLastBoss,
        // V2 State
        zoneProgressV2: state.zoneProgressV2,
        globalLevelCount: state.globalLevelCount,
        currentLevelInZone: state.currentLevelInZone,
        progressVersion: state.progressVersion,
      }),
      // Migration function to handle upgrading from old storage versions
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<ProgressState>;

        // Migrate from version 0 or 1 (before V2 progress tracking)
        if (version < 2) {
          // Build V2 progress from V1 data
          const migratedV2Progress: Record<string, ZoneProgressV2> = {};

          ZONES.forEach((zone) => {
            const v1Progress = state.zoneProgress?.[zone.id];
            const isUnlocked = state.unlockedZones?.includes(zone.id) || zone.id === 'addlands';
            const bossDefeated = state.bossesDefeated?.includes(zone.id) || false;

            // Calculate levels from V1 puzzles solved
            const puzzlesSolved = v1Progress?.solved || 0;
            const completedLevels = Math.floor(puzzlesSolved / PUZZLES_PER_LEVEL);
            const puzzlesInCurrentLevel = puzzlesSolved % PUZZLES_PER_LEVEL;
            const currentLevel = completedLevels + 1;

            // Build levels record
            const levels: Record<number, LevelProgress> = {};
            for (let i = 1; i <= completedLevels; i++) {
              levels[i] = {
                levelNumber: i,
                puzzlesSolved: PUZZLES_PER_LEVEL,
                status: 'completed',
                completedAt: Date.now(),
              };
            }
            // Current level
            levels[currentLevel] = {
              levelNumber: currentLevel,
              puzzlesSolved: puzzlesInCurrentLevel,
              status: isUnlocked ? 'in_progress' : 'locked',
            };

            // Determine zone status
            const status: ZoneStatus = isUnlocked ? 'in_progress' : 'locked';

            migratedV2Progress[zone.id] = {
              zoneId: zone.id,
              status,
              currentLevel,
              levels,
              totalPuzzlesSolved: puzzlesSolved,
              totalBossesDefeated: bossDefeated ? 1 : 0,
              unlockedAt: isUnlocked ? Date.now() : undefined,
            };
          });

          // Calculate global level count
          const globalLevelCount = Object.values(migratedV2Progress)
            .reduce((sum, zp) => sum + Math.floor(zp.totalPuzzlesSolved / PUZZLES_PER_LEVEL), 0);

          return {
            ...state,
            zoneProgressV2: migratedV2Progress,
            globalLevelCount,
            currentLevelInZone: migratedV2Progress[state.currentZoneId || 'addlands']?.currentLevel || 1,
            progressVersion: 2,
          };
        }

        return state;
      },
    }
  )
);

// Helper hooks
export function useCurrentZone() {
  const currentZoneId = useProgressStore((state) => state.currentZoneId);
  return ZONES.find(z => z.id === currentZoneId) || ZONES[0];
}

export function useZoneProgress(zoneId: string) {
  return useProgressStore((state) => state.zoneProgress[zoneId]);
}

export function useIsBossTime() {
  const puzzlesSinceLastBoss = useProgressStore((state) => state.puzzlesSinceLastBoss);
  const currentZoneId = useProgressStore((state) => state.currentZoneId);
  const zone = ZONES.find(z => z.id === currentZoneId);
  return zone ? puzzlesSinceLastBoss >= zone.bossEvery - 1 : false;
}

// ============== V2 Selector Hooks ==============

// Get V2 progress for a specific zone
export function useZoneProgressV2(zoneId: string) {
  return useProgressStore((state) => state.zoneProgressV2[zoneId]);
}

// Get current level progress in the active zone
export function useCurrentLevelProgress() {
  const currentZoneId = useProgressStore((state) => state.currentZoneId);
  const zoneProgressV2 = useProgressStore((state) => state.zoneProgressV2);
  const zoneProgress = zoneProgressV2[currentZoneId];

  if (!zoneProgress) return null;

  const currentLevel = zoneProgress.levels[zoneProgress.currentLevel];
  return {
    levelNumber: zoneProgress.currentLevel,
    puzzlesSolved: currentLevel?.puzzlesSolved || 0,
    puzzlesRequired: PUZZLES_PER_LEVEL,
    status: currentLevel?.status || 'locked',
  };
}

// Get global progress summary
export function useGlobalProgress() {
  const zoneProgressV2 = useProgressStore((state) => state.zoneProgressV2);
  const globalLevelCount = useProgressStore((state) => state.globalLevelCount);

  const zones = Object.values(zoneProgressV2);
  const masteredZones = zones.filter(z => z.status === 'mastered').length;
  const totalZones = zones.length;
  const totalPuzzlesSolved = zones.reduce((sum, z) => sum + z.totalPuzzlesSolved, 0);

  return {
    totalLevelsCompleted: globalLevelCount,
    masteredZones,
    totalZones,
    totalPuzzlesSolved,
    completionPercentage: totalZones > 0 ? Math.round((masteredZones / totalZones) * 100) : 0,
  };
}

// Check if a zone is unlocked (V2)
export function useIsZoneUnlocked(zoneId: string) {
  const zoneProgress = useProgressStore((state) => state.zoneProgressV2[zoneId]);
  return zoneProgress ? zoneProgress.status !== 'locked' : false;
}

// Check if progress has been migrated to V2
export function useIsProgressV2() {
  return useProgressStore((state) => state.progressVersion >= 2);
}
