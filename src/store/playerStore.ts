import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OperatorSkill,
  Operator,
  PlayerState,
  ItemEffect,
  CoinSource
} from '@/engine/types';

// XP required for each level (exponential curve)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Coin rewards by source
const COIN_REWARDS: Record<CoinSource, number> = {
  puzzle: 10,
  streak: 15,
  daily: 50,
  boss: 100,
  achievement: 25,
};

interface PlayerStore extends PlayerState {
  // Level-up notification (set when level increases, cleared when modal shown)
  pendingLevelUp: number | null;
  // Actions
  updateSkill: (op: Operator, success: boolean) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number, source: CoinSource) => void;
  useCoins: (amount: number) => boolean;
  addToInventory: (itemId: string) => void;
  removeFromInventory: (itemId: string) => void;
  equipItem: (itemId: string, slot: 'cloak' | 'pet') => void;
  unequipItem: (slot: 'cloak' | 'pet') => void;
  addActiveEffect: (effect: ItemEffect) => void;
  decrementEffectDurations: () => void;
  updateDailyStreak: () => void;
  incrementPuzzlesSolved: () => void;
  getSkillMultiplier: (op: Operator) => number;
  clearPendingLevelUp: () => void;
  resetPlayer: () => void;
}

const DEFAULT_SKILLS: OperatorSkill = {
  '+': 0.5,
  '-': 0.4,
  '×': 0.3,
  '÷': 0.2,
};

const initialState: PlayerState = {
  level: 1,
  xp: 0,
  xpToNextLevel: xpForLevel(1),
  skill: { ...DEFAULT_SKILLS },
  coins: 0,
  inventory: [],
  equippedItems: {},
  activeEffects: [],
  dailyStreak: 0,
  lastPlayedDate: null,
  totalPuzzlesSolved: 0,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      pendingLevelUp: null,

      updateSkill: (op: Operator, success: boolean) => {
        set((state) => {
          const delta = success ? 0.05 : -0.03;
          const currentSkill = state.skill[op];
          const newSkill = Math.max(0, Math.min(1, currentSkill + delta));

          return {
            skill: {
              ...state.skill,
              [op]: newSkill,
            },
          };
        });
      },

      addXP: (amount: number) => {
        set((state) => {
          // Apply XP multiplier from effects
          const xpMultiplier = state.activeEffects
            .filter(e => e.type === 'xp_multiplier')
            .reduce((acc, e) => acc * e.value, 1);

          const actualXP = Math.floor(amount * xpMultiplier);
          let newXP = state.xp + actualXP;
          let newLevel = state.level;
          let newXPToNext = state.xpToNextLevel;
          const oldLevel = state.level;

          // Level up loop
          while (newXP >= newXPToNext && newLevel < 100) {
            newXP -= newXPToNext;
            newLevel++;
            newXPToNext = xpForLevel(newLevel);
          }

          return {
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newXPToNext,
            // Set pendingLevelUp if level increased
            pendingLevelUp: newLevel > oldLevel ? newLevel : state.pendingLevelUp,
          };
        });
      },

      addCoins: (amount: number, source: CoinSource) => {
        set((state) => {
          // Apply coin multiplier from effects
          const coinMultiplier = state.activeEffects
            .filter(e => e.type === 'coin_multiplier')
            .reduce((acc, e) => acc * e.value, 1);

          const baseAmount = COIN_REWARDS[source] || amount;
          const actualCoins = Math.floor(baseAmount * coinMultiplier);

          return {
            coins: state.coins + actualCoins,
          };
        });
      },

      useCoins: (amount: number) => {
        const state = get();
        if (state.coins < amount) return false;

        set({ coins: state.coins - amount });
        return true;
      },

      addToInventory: (itemId: string) => {
        set((state) => ({
          inventory: [...state.inventory, itemId],
        }));
      },

      removeFromInventory: (itemId: string) => {
        set((state) => ({
          inventory: state.inventory.filter(id => id !== itemId),
        }));
      },

      equipItem: (itemId: string, slot: 'cloak' | 'pet') => {
        set((state) => ({
          equippedItems: {
            ...state.equippedItems,
            [slot]: itemId,
          },
        }));
      },

      unequipItem: (slot: 'cloak' | 'pet') => {
        set((state) => {
          const newEquipped = { ...state.equippedItems };
          delete newEquipped[slot];
          return { equippedItems: newEquipped };
        });
      },

      addActiveEffect: (effect: ItemEffect) => {
        set((state) => ({
          activeEffects: [...state.activeEffects, effect],
        }));
      },

      decrementEffectDurations: () => {
        set((state) => ({
          activeEffects: state.activeEffects
            .map(effect => ({
              ...effect,
              duration: effect.duration !== undefined ? effect.duration - 1 : undefined,
            }))
            .filter(effect => effect.duration === undefined || effect.duration > 0),
        }));
      },

      updateDailyStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastPlayed = state.lastPlayedDate;

          if (lastPlayed === today) {
            // Already played today, no change
            return {};
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastPlayed === yesterdayStr) {
            // Played yesterday, increment streak
            return {
              dailyStreak: state.dailyStreak + 1,
              lastPlayedDate: today,
            };
          }

          // Streak broken, reset to 1
          return {
            dailyStreak: 1,
            lastPlayedDate: today,
          };
        });
      },

      incrementPuzzlesSolved: () => {
        set((state) => ({
          totalPuzzlesSolved: state.totalPuzzlesSolved + 1,
        }));
      },

      getSkillMultiplier: (op: Operator) => {
        const state = get();
        const baseSkill = state.skill[op];

        // Apply skill boost from effects
        const skillBoost = state.activeEffects
          .filter(e => e.type === 'skill_boost' && (e.operator === op || !e.operator))
          .reduce((acc, e) => acc + e.value, 0);

        return Math.min(1, baseSkill + skillBoost);
      },

      clearPendingLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      resetPlayer: () => {
        set({ ...initialState, pendingLevelUp: null });
      },
    }),
    {
      name: 'mathpuzzle-player',
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        xpToNextLevel: state.xpToNextLevel,
        skill: state.skill,
        coins: state.coins,
        inventory: state.inventory,
        equippedItems: state.equippedItems,
        activeEffects: state.activeEffects,
        dailyStreak: state.dailyStreak,
        lastPlayedDate: state.lastPlayedDate,
        totalPuzzlesSolved: state.totalPuzzlesSolved,
      }),
    }
  )
);
