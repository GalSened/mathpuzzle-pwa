import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from '@/store/progressStore';
import { usePlayerStore } from '@/store/playerStore';

describe('progressStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    useProgressStore.getState().resetProgress();
    usePlayerStore.getState().resetPlayer();
  });

  describe('Initial State', () => {
    it('should start at Level 1 in Training World', () => {
      const state = useProgressStore.getState();
      expect(state.currentLevel).toBe(1);
      expect(state.currentWorld).toBe('training');
      expect(state.totalPuzzlesSolved).toBe(0);
      expect(state.totalLevelsCompleted).toBe(0);
    });

    it('should have Training World unlocked by default', () => {
      const state = useProgressStore.getState();
      expect(state.isWorldUnlocked('training')).toBe(true);
      expect(state.isLevelUnlocked(1)).toBe(true);
    });

    it('should have other worlds locked', () => {
      const state = useProgressStore.getState();
      expect(state.isWorldUnlocked('factory')).toBe(false);
      expect(state.isWorldUnlocked('lab')).toBe(false);
      expect(state.isWorldUnlocked('city')).toBe(false);
      expect(state.isWorldUnlocked('core')).toBe(false);
    });

    it('should have Level 1 in_progress status', () => {
      const state = useProgressStore.getState();
      const levelProgress = state.getLevelProgress(1);
      expect(levelProgress?.status).toBe('in_progress');
      expect(levelProgress?.puzzlesSolved).toBe(0);
      expect(levelProgress?.puzzlesRequired).toBe(8);
    });
  });

  describe('Puzzle Solving (recordPuzzleSolved)', () => {
    it('should increment puzzlesSolved for current level', () => {
      useProgressStore.getState().recordPuzzleSolved();

      const levelProgress = useProgressStore.getState().getLevelProgress(1);
      expect(levelProgress?.puzzlesSolved).toBe(1);
    });

    it('should increment totalPuzzlesSolved', () => {
      useProgressStore.getState().recordPuzzleSolved();
      useProgressStore.getState().recordPuzzleSolved();
      useProgressStore.getState().recordPuzzleSolved();

      expect(useProgressStore.getState().totalPuzzlesSolved).toBe(3);
    });

    it('should track progress correctly up to level completion', () => {
      // Solve 7 puzzles (1 short of level 1 completion)
      for (let i = 0; i < 7; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }

      const levelProgress = useProgressStore.getState().getLevelProgress(1);
      expect(levelProgress?.puzzlesSolved).toBe(7);
      expect(levelProgress?.status).toBe('in_progress');
    });

    it('should auto-complete level when puzzlesRequired reached', () => {
      // Solve all 8 puzzles for Level 1
      for (let i = 0; i < 8; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }

      const levelProgress = useProgressStore.getState().getLevelProgress(1);
      expect(levelProgress?.puzzlesSolved).toBe(8);
      expect(levelProgress?.status).toBe('completed');
      expect(levelProgress?.completedAt).toBeDefined();
    });
  });

  describe('Level Completion (completeLevel)', () => {
    // Note: recordPuzzleSolved auto-completes the level when puzzlesRequired reached,
    // but does NOT advance currentLevel. completeLevel() handles advancement but
    // returns early if level is already completed. So we test completeLevel()
    // by calling it BEFORE auto-completion happens (solving fewer puzzles).

    it('should mark level as completed and advance', () => {
      // Solve some puzzles but not all (Level 1 requires 8)
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }

      // Force complete (this will mark complete AND advance)
      useProgressStore.getState().completeLevel();

      const levelProgress = useProgressStore.getState().getLevelProgress(1);
      expect(levelProgress?.status).toBe('completed');
    });

    it('should unlock next level in same world', () => {
      // Solve some puzzles
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }
      useProgressStore.getState().completeLevel();

      // Check Level 2 is now unlocked and in_progress
      const state = useProgressStore.getState();
      expect(state.isLevelUnlocked(2)).toBe(true);
      const level2Progress = state.getLevelProgress(2);
      expect(level2Progress?.status).toBe('in_progress');
    });

    it('should advance currentLevel after completion', () => {
      // Solve some puzzles
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }
      useProgressStore.getState().completeLevel();

      expect(useProgressStore.getState().currentLevel).toBe(2);
    });

    it('should increment totalLevelsCompleted', () => {
      // Solve some puzzles
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }
      useProgressStore.getState().completeLevel();

      expect(useProgressStore.getState().totalLevelsCompleted).toBe(1);
    });
  });

  describe('Boss Battle (defeatBoss)', () => {
    beforeEach(() => {
      // Progress to boss level (Level 6) using completeLevel() before auto-complete
      for (let level = 1; level <= 5; level++) {
        // Solve a few puzzles (not all) then force complete
        for (let i = 0; i < 3; i++) {
          useProgressStore.getState().recordPuzzleSolved();
        }
        useProgressStore.getState().completeLevel();
      }
    });

    it('should be on boss level (Level 6) after completing Levels 1-5', () => {
      expect(useProgressStore.getState().currentLevel).toBe(6);
    });

    it('should record bossDefeatedAt when defeating boss', () => {
      // Solve some boss puzzles
      for (let i = 0; i < 3; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }
      useProgressStore.getState().defeatBoss();

      const levelProgress = useProgressStore.getState().getLevelProgress(6);
      expect(levelProgress?.bossDefeatedAt).toBeDefined();
    });
  });

  describe('World Unlocking', () => {
    it('should unlock Factory World after completing Training World', () => {
      // Complete all 6 levels of Training World using completeLevel() before auto-complete
      for (let level = 1; level <= 6; level++) {
        // Solve a few puzzles
        for (let i = 0; i < 3; i++) {
          useProgressStore.getState().recordPuzzleSolved();
        }

        // Defeat boss on level 6
        if (level === 6) {
          useProgressStore.getState().defeatBoss();
        }
        useProgressStore.getState().completeLevel();
      }

      // Check Factory is unlocked
      const state = useProgressStore.getState();
      expect(state.isWorldUnlocked('factory')).toBe(true);
      expect(state.currentWorld).toBe('factory');
      expect(state.currentLevel).toBe(7);
    });

    it('should keep Training World as completed after unlocking Factory', () => {
      // Complete Training World
      for (let level = 1; level <= 6; level++) {
        // Solve a few puzzles
        for (let i = 0; i < 3; i++) {
          useProgressStore.getState().recordPuzzleSolved();
        }
        if (level === 6) useProgressStore.getState().defeatBoss();
        useProgressStore.getState().completeLevel();
      }

      const trainingProgress = useProgressStore.getState().getWorldProgress('training');
      expect(trainingProgress?.status).toBe('completed');
      expect(trainingProgress?.completedAt).toBeDefined();
    });
  });

  describe('Reset Progress', () => {
    it('should reset all progress to initial state', () => {
      // Make some progress
      for (let i = 0; i < 5; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }

      // Reset
      useProgressStore.getState().resetProgress();

      // Verify reset
      const state = useProgressStore.getState();
      expect(state.currentLevel).toBe(1);
      expect(state.currentWorld).toBe('training');
      expect(state.totalPuzzlesSolved).toBe(0);
      expect(state.totalLevelsCompleted).toBe(0);

      const levelProgress = state.getLevelProgress(1);
      expect(levelProgress?.puzzlesSolved).toBe(0);
    });
  });

  describe('Navigation (setCurrentLevel / setCurrentWorld)', () => {
    beforeEach(() => {
      // Complete Level 1 to unlock Level 2 (using completeLevel before auto-complete)
      for (let i = 0; i < 3; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }
      useProgressStore.getState().completeLevel();
    });

    it('should allow navigating to unlocked level', () => {
      useProgressStore.getState().setCurrentLevel(1);
      expect(useProgressStore.getState().currentLevel).toBe(1);

      useProgressStore.getState().setCurrentLevel(2);
      expect(useProgressStore.getState().currentLevel).toBe(2);
    });

    it('should not allow navigating to locked level', () => {
      const originalLevel = useProgressStore.getState().currentLevel;

      // Try to navigate to Level 10 (locked)
      useProgressStore.getState().setCurrentLevel(10);

      // Should remain at current level
      expect(useProgressStore.getState().currentLevel).toBe(originalLevel);
    });
  });

  describe('Query Methods', () => {
    it('isLevelUnlocked should return false for future levels', () => {
      const state = useProgressStore.getState();
      expect(state.isLevelUnlocked(5)).toBe(false);
      expect(state.isLevelUnlocked(10)).toBe(false);
      expect(state.isLevelUnlocked(30)).toBe(false);
    });

    it('canAdvanceToNextLevel should return true when level completed', () => {
      expect(useProgressStore.getState().canAdvanceToNextLevel()).toBe(false);

      // Complete Level 1
      for (let i = 0; i < 8; i++) {
        useProgressStore.getState().recordPuzzleSolved();
      }

      expect(useProgressStore.getState().canAdvanceToNextLevel()).toBe(true);
    });

    it('getWorldProgress should return correct data', () => {
      const trainingProgress = useProgressStore.getState().getWorldProgress('training');
      expect(trainingProgress).toBeDefined();
      expect(trainingProgress?.worldId).toBe('training');
      expect(trainingProgress?.status).toBe('in_progress');
    });

    it('getWorldProgress should return undefined for invalid world', () => {
      // @ts-expect-error Testing invalid input
      const progress = useProgressStore.getState().getWorldProgress('invalid');
      expect(progress).toBeUndefined();
    });
  });
});
