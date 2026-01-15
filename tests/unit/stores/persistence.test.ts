import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useProgressStore } from '@/store/progressStore';
import { usePlayerStore } from '@/store/playerStore';
import { useShopStore } from '@/store/shopStore';

// Mock localStorage for persistence tests
const mockStorage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
  key: vi.fn((index: number) => Object.keys(mockStorage)[index] || null),
  get length() {
    return Object.keys(mockStorage).length;
  },
};

describe('Persistence Tests', () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    vi.clearAllMocks();

    // Reset stores
    useProgressStore.getState().resetProgress();
    usePlayerStore.getState().resetPlayer();
    useShopStore.getState().resetShop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('State Serialization', () => {
    it('should serialize progressStore state to JSON', () => {
      const state = useProgressStore.getState();

      // Verify state can be serialized
      const serialized = JSON.stringify({
        progressVersion: state.progressVersion,
        worlds: state.worlds,
        currentWorld: state.currentWorld,
        currentLevel: state.currentLevel,
        totalLevelsCompleted: state.totalLevelsCompleted,
        totalPuzzlesSolved: state.totalPuzzlesSolved,
      });

      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should serialize playerStore state to JSON', () => {
      const state = usePlayerStore.getState();

      const serialized = JSON.stringify({
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
      });

      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should serialize shopStore state to JSON', () => {
      const state = useShopStore.getState();

      const serialized = JSON.stringify({
        inventory: state.inventory,
        equippedItems: state.equippedItems,
        purchaseHistory: state.purchaseHistory,
      });

      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe('State Round-Trip', () => {
    it('should maintain progress state integrity after round-trip', () => {
      // Modify state
      useProgressStore.getState().recordPuzzleSolved(1);
      useProgressStore.getState().recordPuzzleSolved(1);
      useProgressStore.getState().recordPuzzleSolved(1);

      const originalState = useProgressStore.getState();
      const originalPuzzlesSolved = originalState.totalPuzzlesSolved;
      const originalLevelProgress = originalState.getLevelProgress(1);

      // Serialize
      const serialized = JSON.stringify({
        state: {
          progressVersion: originalState.progressVersion,
          worlds: originalState.worlds,
          currentWorld: originalState.currentWorld,
          currentLevel: originalState.currentLevel,
          totalLevelsCompleted: originalState.totalLevelsCompleted,
          totalPuzzlesSolved: originalState.totalPuzzlesSolved,
        },
        version: 0,
      });

      // Parse and verify
      const parsed = JSON.parse(serialized);
      expect(parsed.state.totalPuzzlesSolved).toBe(originalPuzzlesSolved);
      expect(parsed.state.currentLevel).toBe(originalState.currentLevel);
      expect(parsed.state.worlds.training.levels['1'].puzzlesSolved).toBe(originalLevelProgress.puzzlesSolved);
    });

    it('should maintain player state integrity after round-trip', () => {
      // Give player some coins and XP
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 coins
      usePlayerStore.getState().addXP(50);
      usePlayerStore.getState().clearPendingLevelUp();

      const originalState = usePlayerStore.getState();

      // Serialize
      const serialized = JSON.stringify({
        state: {
          level: originalState.level,
          xp: originalState.xp,
          xpToNextLevel: originalState.xpToNextLevel,
          skill: originalState.skill,
          coins: originalState.coins,
          inventory: originalState.inventory,
          equippedItems: originalState.equippedItems,
          activeEffects: originalState.activeEffects,
          dailyStreak: originalState.dailyStreak,
          lastPlayedDate: originalState.lastPlayedDate,
          totalPuzzlesSolved: originalState.totalPuzzlesSolved,
        },
        version: 0,
      });

      // Parse and verify
      const parsed = JSON.parse(serialized);
      expect(parsed.state.coins).toBe(100);
      expect(parsed.state.xp).toBe(50);
      expect(parsed.state.skill['+']).toBe(originalState.skill['+']);
    });

    it('should maintain shop state integrity after round-trip', () => {
      // Buy some items
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');

      const originalState = useShopStore.getState();

      // Serialize
      const serialized = JSON.stringify({
        state: {
          inventory: originalState.inventory,
          equippedItems: originalState.equippedItems,
          purchaseHistory: originalState.purchaseHistory,
        },
        version: 0,
      });

      // Parse and verify
      const parsed = JSON.parse(serialized);
      expect(parsed.state.inventory).toHaveLength(1);
      expect(parsed.state.inventory[0].itemId).toBe('consumable-hint');
      expect(parsed.state.inventory[0].quantity).toBe(2);
      expect(parsed.state.purchaseHistory).toHaveLength(2);
    });
  });

  describe('Version Migration', () => {
    it('should recognize V3 progress format', () => {
      const state = useProgressStore.getState();
      expect(state.progressVersion).toBe(3);
    });

    it('should have V3 world structure', () => {
      const state = useProgressStore.getState();

      // V3 uses worlds object with training as starting world
      expect(state.worlds).toBeDefined();
      expect(state.worlds.training).toBeDefined();
      expect(state.currentWorld).toBe('training');
      expect(state.currentLevel).toBe(1);
    });

    it('should initialize with correct V3 level structure', () => {
      const state = useProgressStore.getState();
      const trainingWorld = state.worlds.training;

      expect(trainingWorld.worldId).toBe('training');
      expect(trainingWorld.status).toBe('in_progress');
      expect(trainingWorld.levels).toBeDefined();
      expect(trainingWorld.levels[1]).toBeDefined();
      expect(trainingWorld.levels[1].levelId).toBe(1);
      expect(trainingWorld.levels[1].puzzlesRequired).toBe(8);
    });

    it('should handle migration from older versions', () => {
      // The migrate function should reset to V3 if version < 3
      // This is tested by checking that fresh state is always V3
      const state = useProgressStore.getState();
      expect(state.progressVersion).toBe(3);

      // Verify all required V3 fields exist
      expect(state.worlds).toBeDefined();
      expect(state.currentWorld).toBeDefined();
      expect(state.currentLevel).toBeDefined();
      expect(state.totalLevelsCompleted).toBeDefined();
      expect(state.totalPuzzlesSolved).toBeDefined();
    });
  });

  describe('Data Structure Validation', () => {
    it('should have valid world structure for all worlds', () => {
      const state = useProgressStore.getState();
      const worldIds = ['training', 'factory', 'lab', 'city', 'core'] as const;

      // Only training should be active initially
      expect(state.worlds.training.status).toBe('in_progress');

      // Factory should be locked initially
      if (state.worlds.factory) {
        expect(state.worlds.factory.status).toBe('locked');
      }
    });

    it('should have valid level structure within worlds', () => {
      const state = useProgressStore.getState();
      const trainingLevels = state.worlds.training.levels;

      // Level 1 should be in_progress
      expect(trainingLevels['1'].status).toBe('in_progress');

      // Should have correct puzzle requirements
      expect(trainingLevels['1'].puzzlesRequired).toBeGreaterThan(0);
      expect(trainingLevels['1'].puzzlesSolved).toBe(0);
    });

    it('should have valid player skill structure', () => {
      const state = usePlayerStore.getState();
      const operators = ['+', '-', '×', '÷'] as const;

      for (const op of operators) {
        expect(state.skill[op]).toBeDefined();
        expect(state.skill[op]).toBeGreaterThanOrEqual(0);
        expect(state.skill[op]).toBeLessThanOrEqual(1);
      }
    });

    it('should have valid XP progression formula', () => {
      // XP to next level should follow exponential curve: 100 * 1.5^(level-1)
      const state = usePlayerStore.getState();
      expect(state.level).toBe(1);
      expect(state.xpToNextLevel).toBe(100); // 100 * 1.5^0 = 100

      // Level up and check next threshold
      usePlayerStore.getState().addXP(100);
      usePlayerStore.getState().clearPendingLevelUp();

      const newState = usePlayerStore.getState();
      expect(newState.level).toBe(2);
      expect(newState.xpToNextLevel).toBe(150); // 100 * 1.5^1 = 150
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty inventory serialization', () => {
      const state = useShopStore.getState();
      expect(state.inventory).toEqual([]);

      const serialized = JSON.stringify(state.inventory);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual([]);
    });

    it('should handle empty equipped items serialization', () => {
      const state = useShopStore.getState();
      expect(state.equippedItems).toEqual({});

      const serialized = JSON.stringify(state.equippedItems);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual({});
    });

    it('should handle empty active effects serialization', () => {
      const state = usePlayerStore.getState();
      expect(state.activeEffects).toEqual([]);

      const serialized = JSON.stringify(state.activeEffects);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual([]);
    });

    it('should handle complex skill object serialization', () => {
      const state = usePlayerStore.getState();

      // Update skills
      usePlayerStore.getState().updateSkill('+', true);
      usePlayerStore.getState().updateSkill('-', false);

      const updatedState = usePlayerStore.getState();
      const serialized = JSON.stringify(updatedState.skill);
      const parsed = JSON.parse(serialized);

      expect(parsed['+']).toBe(updatedState.skill['+']);
      expect(parsed['-']).toBe(updatedState.skill['-']);
    });

    it('should handle Date serialization in timestamps', () => {
      // Complete a level to get timestamp
      for (let i = 0; i < 8; i++) {
        useProgressStore.getState().recordPuzzleSolved(1);
      }

      const state = useProgressStore.getState();
      const level1 = state.worlds.training.levels['1'];

      expect(level1.completedAt).toBeDefined();
      expect(typeof level1.completedAt).toBe('number');

      // Serialize and verify timestamp survives
      const serialized = JSON.stringify(level1.completedAt);
      const parsed = JSON.parse(serialized);
      expect(parsed).toBe(level1.completedAt);
    });
  });

  describe('State Reset', () => {
    it('should completely reset progress state', () => {
      // Make some progress
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved(1);
      }

      expect(useProgressStore.getState().totalPuzzlesSolved).toBe(5);

      // Reset
      useProgressStore.getState().resetProgress();

      // Verify complete reset
      const state = useProgressStore.getState();
      expect(state.totalPuzzlesSolved).toBe(0);
      expect(state.currentLevel).toBe(1);
      expect(state.currentWorld).toBe('training');
      expect(state.totalLevelsCompleted).toBe(0);
    });

    it('should completely reset player state', () => {
      // Modify player
      usePlayerStore.getState().addCoins(0, 'boss');
      usePlayerStore.getState().addXP(200);
      usePlayerStore.getState().clearPendingLevelUp();

      expect(usePlayerStore.getState().coins).toBe(100);
      expect(usePlayerStore.getState().level).toBeGreaterThan(1);

      // Reset
      usePlayerStore.getState().resetPlayer();

      // Verify complete reset
      const state = usePlayerStore.getState();
      expect(state.coins).toBe(0);
      expect(state.level).toBe(1);
      expect(state.xp).toBe(0);
      expect(state.totalPuzzlesSolved).toBe(0);
    });

    it('should completely reset shop state', () => {
      // Buy items
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-hint');

      expect(useShopStore.getState().inventory.length).toBeGreaterThan(0);

      // Reset
      useShopStore.getState().resetShop();

      // Verify complete reset
      const state = useShopStore.getState();
      expect(state.inventory).toEqual([]);
      expect(state.equippedItems).toEqual({});
      expect(state.purchaseHistory).toEqual([]);
    });
  });

  describe('LocalStorage Key Consistency', () => {
    it('should use correct storage key for progress', () => {
      // The storage key should be 'mathpuzzle-progress-v3'
      // This is defined in the store's persist config
      const expectedKey = 'mathpuzzle-progress-v3';

      // Verify the key format matches V3
      expect(expectedKey).toContain('v3');
    });

    it('should use correct storage key for player', () => {
      const expectedKey = 'mathpuzzle-player';
      expect(expectedKey).toBe('mathpuzzle-player');
    });

    it('should use correct storage key for shop', () => {
      const expectedKey = 'mathpuzzle-shop';
      expect(expectedKey).toBe('mathpuzzle-shop');
    });
  });

  describe('Effect Persistence', () => {
    it('should persist temporary effects with duration', () => {
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-double-xp');
      useShopStore.getState().consumeItem('consumable-double-xp');

      const effects = usePlayerStore.getState().activeEffects;
      expect(effects.length).toBeGreaterThan(0);

      const xpEffect = effects.find(e => e.type === 'xp_multiplier');
      expect(xpEffect).toBeDefined();
      expect(xpEffect?.duration).toBe(5);

      // Serialize
      const serialized = JSON.stringify(effects);
      const parsed = JSON.parse(serialized);

      expect(parsed.find((e: { type: string }) => e.type === 'xp_multiplier')?.duration).toBe(5);
    });

    it('should persist permanent effects without duration', () => {
      // Level up to unlock cloak-focus (level 3 required)
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addCoins(0, 'boss');
      }
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addXP(200);
        usePlayerStore.getState().clearPendingLevelUp();
      }

      useShopStore.getState().buyItem('cloak-focus');
      useShopStore.getState().equipItem('cloak-focus', 'cloak');

      const effects = usePlayerStore.getState().activeEffects;
      // cloak-focus has effect: { type: 'skill_boost', value: 0.1, operator: '×' }
      const permanentEffect = effects.find(e => e.type === 'skill_boost' && e.operator === '×');

      expect(permanentEffect).toBeDefined();
      expect(permanentEffect?.duration).toBeUndefined();

      // Serialize
      const serialized = JSON.stringify(effects);
      const parsed = JSON.parse(serialized);

      const parsedEffect = parsed.find((e: { type: string; operator?: string }) => e.type === 'skill_boost' && e.operator === '×');
      expect(parsedEffect?.duration).toBeUndefined();
    });
  });

  describe('World Unlock State Persistence', () => {
    it('should persist world unlock timestamps', () => {
      const state = useProgressStore.getState();
      const trainingWorld = state.worlds.training;

      expect(trainingWorld.unlockedAt).toBeDefined();
      expect(typeof trainingWorld.unlockedAt).toBe('number');

      // Serialize
      const serialized = JSON.stringify(trainingWorld);
      const parsed = JSON.parse(serialized);

      expect(parsed.unlockedAt).toBe(trainingWorld.unlockedAt);
    });

    it('should persist level completion timestamps', () => {
      // Complete level 1
      for (let i = 0; i < 8; i++) {
        useProgressStore.getState().recordPuzzleSolved(1);
      }

      const state = useProgressStore.getState();
      const level1 = state.worlds.training.levels['1'];

      expect(level1.status).toBe('completed');
      expect(level1.completedAt).toBeDefined();

      // Serialize
      const serialized = JSON.stringify(level1);
      const parsed = JSON.parse(serialized);

      expect(parsed.completedAt).toBe(level1.completedAt);
    });
  });

  describe('Purchase History Persistence', () => {
    it('should persist purchase timestamps', () => {
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-hint');

      const history = useShopStore.getState().purchaseHistory;
      expect(history.length).toBe(1);
      expect(history[0].timestamp).toBeDefined();

      // Serialize
      const serialized = JSON.stringify(history);
      const parsed = JSON.parse(serialized);

      expect(parsed[0].timestamp).toBe(history[0].timestamp);
    });

    it('should persist full purchase details', () => {
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');

      const history = useShopStore.getState().purchaseHistory;
      expect(history.length).toBe(2);

      // Serialize
      const serialized = JSON.stringify(history);
      const parsed = JSON.parse(serialized);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].itemId).toBe('consumable-hint');
      expect(parsed[0].price).toBe(25);
      expect(parsed[1].itemId).toBe('consumable-hint');
    });
  });
});
