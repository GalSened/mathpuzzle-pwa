import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore, xpForLevel } from '@/store/playerStore';

describe('playerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.getState().resetPlayer();
  });

  describe('Initial State', () => {
    it('should start at Level 1 with 0 XP', () => {
      const state = usePlayerStore.getState();
      expect(state.level).toBe(1);
      expect(state.xp).toBe(0);
      expect(state.xpToNextLevel).toBe(100); // xpForLevel(1) = 100
    });

    it('should start with 0 coins', () => {
      expect(usePlayerStore.getState().coins).toBe(0);
    });

    it('should have default skill values', () => {
      const state = usePlayerStore.getState();
      expect(state.skill['+']).toBe(0.5);
      expect(state.skill['-']).toBe(0.4);
      expect(state.skill['×']).toBe(0.3);
      expect(state.skill['÷']).toBe(0.2);
    });

    it('should have empty inventory', () => {
      const state = usePlayerStore.getState();
      expect(state.inventory).toEqual([]);
      expect(state.equippedItems).toEqual({});
      expect(state.activeEffects).toEqual([]);
    });

    it('should have no daily streak initially', () => {
      const state = usePlayerStore.getState();
      expect(state.dailyStreak).toBe(0);
      expect(state.lastPlayedDate).toBeNull();
    });
  });

  describe('XP System (addXP)', () => {
    it('should accumulate XP correctly', () => {
      usePlayerStore.getState().addXP(50);
      expect(usePlayerStore.getState().xp).toBe(50);

      usePlayerStore.getState().addXP(25);
      expect(usePlayerStore.getState().xp).toBe(75);
    });

    it('should level up when XP reaches threshold', () => {
      // Level 1 requires 100 XP to level up
      usePlayerStore.getState().addXP(100);

      const state = usePlayerStore.getState();
      expect(state.level).toBe(2);
      expect(state.xp).toBe(0); // Excess XP carried over (100 - 100 = 0)
    });

    it('should carry over excess XP after level up', () => {
      // Level 1 requires 100 XP
      usePlayerStore.getState().addXP(120);

      const state = usePlayerStore.getState();
      expect(state.level).toBe(2);
      expect(state.xp).toBe(20); // 120 - 100 = 20
    });

    it('should handle multiple level ups at once', () => {
      // Level 1: 100 XP, Level 2: 150 XP = 250 total for level 3
      usePlayerStore.getState().addXP(300);

      const state = usePlayerStore.getState();
      expect(state.level).toBeGreaterThan(2);
    });

    it('should update xpToNextLevel after level up', () => {
      usePlayerStore.getState().addXP(100);

      const state = usePlayerStore.getState();
      // Level 2 XP requirement: 100 * 1.5^1 = 150
      expect(state.xpToNextLevel).toBe(150);
    });

    it('should set pendingLevelUp when level increases', () => {
      usePlayerStore.getState().addXP(100);

      expect(usePlayerStore.getState().pendingLevelUp).toBe(2);
    });

    it('should apply XP multiplier from active effects', () => {
      // Add 2x XP multiplier effect
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 2.0,
        duration: 5,
      });

      usePlayerStore.getState().addXP(50);

      // 50 * 2.0 = 100 XP
      expect(usePlayerStore.getState().xp).toBe(0); // Level up from 100
      expect(usePlayerStore.getState().level).toBe(2);
    });
  });

  describe('xpForLevel helper', () => {
    it('should calculate XP requirement correctly', () => {
      expect(xpForLevel(1)).toBe(100);
      expect(xpForLevel(2)).toBe(150); // 100 * 1.5^1
      expect(xpForLevel(3)).toBe(225); // 100 * 1.5^2
    });
  });

  describe('Coin System (addCoins / useCoins)', () => {
    it('should add coins based on source reward', () => {
      usePlayerStore.getState().addCoins(0, 'puzzle');
      expect(usePlayerStore.getState().coins).toBe(10); // puzzle = 10

      usePlayerStore.getState().addCoins(0, 'boss');
      expect(usePlayerStore.getState().coins).toBe(110); // boss = 100
    });

    it('should use coins successfully when sufficient balance', () => {
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 coins

      const result = usePlayerStore.getState().useCoins(50);

      expect(result).toBe(true);
      expect(usePlayerStore.getState().coins).toBe(50);
    });

    it('should reject coin usage when insufficient balance', () => {
      usePlayerStore.getState().addCoins(0, 'puzzle'); // +10 coins

      const result = usePlayerStore.getState().useCoins(50);

      expect(result).toBe(false);
      expect(usePlayerStore.getState().coins).toBe(10); // unchanged
    });

    it('should apply coin multiplier from active effects', () => {
      // Add 1.5x coin multiplier effect
      usePlayerStore.getState().addActiveEffect({
        type: 'coin_multiplier',
        value: 1.5,
        duration: 5,
      });

      usePlayerStore.getState().addCoins(0, 'puzzle'); // base 10 coins

      // 10 * 1.5 = 15 coins
      expect(usePlayerStore.getState().coins).toBe(15);
    });

    it('should handle all coin sources', () => {
      const sources: Array<{ source: 'puzzle' | 'streak' | 'daily' | 'boss' | 'achievement'; expected: number }> = [
        { source: 'puzzle', expected: 10 },
        { source: 'streak', expected: 15 },
        { source: 'daily', expected: 50 },
        { source: 'boss', expected: 100 },
        { source: 'achievement', expected: 25 },
      ];

      let total = 0;
      for (const { source, expected } of sources) {
        usePlayerStore.getState().addCoins(0, source);
        total += expected;
        expect(usePlayerStore.getState().coins).toBe(total);
      }
    });
  });

  describe('Skill System (updateSkill)', () => {
    it('should increase skill on success (+0.05)', () => {
      const initialSkill = usePlayerStore.getState().skill['+'];

      usePlayerStore.getState().updateSkill('+', true);

      expect(usePlayerStore.getState().skill['+']).toBe(initialSkill + 0.05);
    });

    it('should decrease skill on failure (-0.03)', () => {
      const initialSkill = usePlayerStore.getState().skill['-'];

      usePlayerStore.getState().updateSkill('-', false);

      expect(usePlayerStore.getState().skill['-']).toBeCloseTo(initialSkill - 0.03);
    });

    it('should cap skill at 1.0 maximum', () => {
      // Set skill close to max
      for (let i = 0; i < 20; i++) {
        usePlayerStore.getState().updateSkill('+', true);
      }

      expect(usePlayerStore.getState().skill['+']).toBe(1.0);
    });

    it('should cap skill at 0.0 minimum', () => {
      // Set skill close to min
      for (let i = 0; i < 20; i++) {
        usePlayerStore.getState().updateSkill('÷', false);
      }

      expect(usePlayerStore.getState().skill['÷']).toBe(0.0);
    });

    it('should track skills independently per operator', () => {
      usePlayerStore.getState().updateSkill('+', true);
      usePlayerStore.getState().updateSkill('-', false);

      const state = usePlayerStore.getState();
      expect(state.skill['+']).toBe(0.55); // 0.5 + 0.05
      expect(state.skill['-']).toBeCloseTo(0.37); // 0.4 - 0.03
      expect(state.skill['×']).toBe(0.3); // unchanged
    });
  });

  describe('Inventory System', () => {
    it('should add items to inventory', () => {
      usePlayerStore.getState().addToInventory('cloak-scholar');
      usePlayerStore.getState().addToInventory('pet-owl');

      const inventory = usePlayerStore.getState().inventory;
      expect(inventory).toContain('cloak-scholar');
      expect(inventory).toContain('pet-owl');
      expect(inventory.length).toBe(2);
    });

    it('should remove items from inventory', () => {
      usePlayerStore.getState().addToInventory('cloak-scholar');
      usePlayerStore.getState().addToInventory('pet-owl');

      usePlayerStore.getState().removeFromInventory('cloak-scholar');

      const inventory = usePlayerStore.getState().inventory;
      expect(inventory).not.toContain('cloak-scholar');
      expect(inventory).toContain('pet-owl');
    });
  });

  describe('Equipment System', () => {
    it('should equip items to correct slot', () => {
      usePlayerStore.getState().equipItem('cloak-scholar', 'cloak');
      usePlayerStore.getState().equipItem('pet-owl', 'pet');

      const equipped = usePlayerStore.getState().equippedItems;
      expect(equipped.cloak).toBe('cloak-scholar');
      expect(equipped.pet).toBe('pet-owl');
    });

    it('should replace equipped item in same slot', () => {
      usePlayerStore.getState().equipItem('cloak-scholar', 'cloak');
      usePlayerStore.getState().equipItem('cloak-lucky', 'cloak');

      expect(usePlayerStore.getState().equippedItems.cloak).toBe('cloak-lucky');
    });

    it('should unequip items', () => {
      usePlayerStore.getState().equipItem('cloak-scholar', 'cloak');
      usePlayerStore.getState().unequipItem('cloak');

      expect(usePlayerStore.getState().equippedItems.cloak).toBeUndefined();
    });
  });

  describe('Active Effects System', () => {
    it('should add active effects', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 2.0,
        duration: 5,
      });

      const effects = usePlayerStore.getState().activeEffects;
      expect(effects.length).toBe(1);
      expect(effects[0].type).toBe('xp_multiplier');
      expect(effects[0].duration).toBe(5);
    });

    it('should decrement effect durations', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 2.0,
        duration: 3,
      });

      usePlayerStore.getState().decrementEffectDurations();

      expect(usePlayerStore.getState().activeEffects[0].duration).toBe(2);
    });

    it('should remove effects when duration reaches 0', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 2.0,
        duration: 1,
      });

      usePlayerStore.getState().decrementEffectDurations();

      expect(usePlayerStore.getState().activeEffects.length).toBe(0);
    });

    it('should keep permanent effects (undefined duration)', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 1.15,
        duration: undefined, // permanent
      });

      usePlayerStore.getState().decrementEffectDurations();
      usePlayerStore.getState().decrementEffectDurations();

      expect(usePlayerStore.getState().activeEffects.length).toBe(1);
    });

    it('should stack multiple effects', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 1.5,
        duration: 5,
      });
      usePlayerStore.getState().addActiveEffect({
        type: 'xp_multiplier',
        value: 1.2,
        duration: 3,
      });

      // Add XP and check multiplicative stacking: 50 * 1.5 * 1.2 = 89.999... → floor = 89
      // (floating-point precision causes 1.5 * 1.2 = 1.7999... not exactly 1.8)
      usePlayerStore.getState().addXP(50);

      expect(usePlayerStore.getState().xp).toBe(89);
    });
  });

  describe('Skill Multiplier (getSkillMultiplier)', () => {
    it('should return base skill value', () => {
      const multiplier = usePlayerStore.getState().getSkillMultiplier('+');
      expect(multiplier).toBe(0.5);
    });

    it('should apply skill boost effects', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'skill_boost',
        value: 0.2,
        operator: '+',
        duration: 5,
      });

      const multiplier = usePlayerStore.getState().getSkillMultiplier('+');
      expect(multiplier).toBe(0.7); // 0.5 + 0.2
    });

    it('should cap skill multiplier at 1.0', () => {
      usePlayerStore.getState().addActiveEffect({
        type: 'skill_boost',
        value: 0.8,
        operator: '+',
        duration: 5,
      });

      const multiplier = usePlayerStore.getState().getSkillMultiplier('+');
      expect(multiplier).toBe(1.0); // capped
    });
  });

  describe('Daily Streak (updateDailyStreak)', () => {
    it('should start streak at 1 on first play', () => {
      usePlayerStore.getState().updateDailyStreak();

      const state = usePlayerStore.getState();
      expect(state.dailyStreak).toBe(1);
      expect(state.lastPlayedDate).toBeTruthy();
    });

    it('should not change streak if already played today', () => {
      usePlayerStore.getState().updateDailyStreak();
      usePlayerStore.getState().updateDailyStreak();

      expect(usePlayerStore.getState().dailyStreak).toBe(1);
    });
  });

  describe('Puzzles Solved (incrementPuzzlesSolved)', () => {
    it('should increment total puzzles solved', () => {
      usePlayerStore.getState().incrementPuzzlesSolved();
      usePlayerStore.getState().incrementPuzzlesSolved();
      usePlayerStore.getState().incrementPuzzlesSolved();

      expect(usePlayerStore.getState().totalPuzzlesSolved).toBe(3);
    });
  });

  describe('Level Up Notification (clearPendingLevelUp)', () => {
    it('should clear pending level up', () => {
      usePlayerStore.getState().addXP(100); // triggers level up
      expect(usePlayerStore.getState().pendingLevelUp).toBe(2);

      usePlayerStore.getState().clearPendingLevelUp();
      expect(usePlayerStore.getState().pendingLevelUp).toBeNull();
    });
  });

  describe('Reset (resetPlayer)', () => {
    it('should reset all player state to initial values', () => {
      // Make some changes
      usePlayerStore.getState().addXP(200);
      usePlayerStore.getState().addCoins(0, 'boss');
      usePlayerStore.getState().updateSkill('+', true);
      usePlayerStore.getState().addToInventory('cloak-scholar');

      // Reset
      usePlayerStore.getState().resetPlayer();

      // Verify reset
      const state = usePlayerStore.getState();
      expect(state.level).toBe(1);
      expect(state.xp).toBe(0);
      expect(state.coins).toBe(0);
      expect(state.skill['+']).toBe(0.5);
      expect(state.inventory).toEqual([]);
      expect(state.pendingLevelUp).toBeNull();
    });
  });
});
