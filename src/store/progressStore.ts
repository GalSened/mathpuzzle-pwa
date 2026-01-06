import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZONES, getCurrentZone, getNextZoneToUnlock } from '@/engine/story';
import { usePlayerStore } from './playerStore';

interface ZoneProgress {
  solved: number;
  total: number;
  bossDefeated: boolean;
}

interface ProgressState {
  currentZoneId: string;
  zoneProgress: Record<string, ZoneProgress>;
  bossesDefeated: string[];
  unlockedZones: string[];
  puzzlesSinceLastBoss: number;

  // Actions
  initializeProgress: () => void;
  recordPuzzleSolved: (zoneId: string) => void;
  defeatBoss: (zoneId: string) => void;
  checkZoneUnlocks: () => void;
  setCurrentZone: (zoneId: string) => void;
  resetProgress: () => void;
}

const initialZoneProgress: Record<string, ZoneProgress> = {};
ZONES.forEach(zone => {
  initialZoneProgress[zone.id] = {
    solved: 0,
    total: 0,
    bossDefeated: false,
  };
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentZoneId: 'addlands',
      zoneProgress: initialZoneProgress,
      bossesDefeated: [],
      unlockedZones: ['addlands'],
      puzzlesSinceLastBoss: 0,

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
        });
      },
    }),
    {
      name: 'mathpuzzle-progress',
      partialize: (state) => ({
        currentZoneId: state.currentZoneId,
        zoneProgress: state.zoneProgress,
        bossesDefeated: state.bossesDefeated,
        unlockedZones: state.unlockedZones,
        puzzlesSinceLastBoss: state.puzzlesSinceLastBoss,
      }),
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
