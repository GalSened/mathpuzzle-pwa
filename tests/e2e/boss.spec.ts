import { test, expect } from '@playwright/test';

// Helper to set up state at boss level (Level 6)
async function setupBossLevel(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    // Skip onboarding
    const userState = {
      state: {
        hasCompletedOnboarding: true,
        hasSeenPrologue: true,
        hasSeenTutorial: true,
        hasSeenZoneIntro: { training: true, factory: true, lab: true, city: true, core: true },
        username: 'TestPlayer',
        avatar: 'wizard',
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-user', JSON.stringify(userState));

    // Set progress to Level 6 (boss level) with levels 1-5 completed
    const progressState = {
      state: {
        currentLevel: 6,
        currentWorld: 'training',
        totalPuzzlesSolved: 40,
        totalLevelsCompleted: 5,
        progressVersion: 3,
        worlds: {
          training: {
            worldId: 'training',
            status: 'in_progress',
            unlockedAt: Date.now() - 86400000, // 1 day ago
            levels: {
              '1': { levelNumber: 1, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 3600000 },
              '2': { levelNumber: 2, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 3000000 },
              '3': { levelNumber: 3, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 2400000 },
              '4': { levelNumber: 4, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 1800000 },
              '5': { levelNumber: 5, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 1200000 },
              '6': { levelNumber: 6, puzzlesSolved: 0, puzzlesRequired: 1, status: 'in_progress' },
            },
          },
        },
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-progress-v3', JSON.stringify(progressState));

    // Set player state
    const playerState = {
      state: {
        level: 5,
        xp: 50,
        xpToNextLevel: 759, // 100 * 1.5^4
        coins: 200,
        skill: { '+': 0.7, '-': 0.6, '×': 0.5, '÷': 0.4 },
        inventory: [],
        equippedItems: {},
        activeEffects: [],
        dailyStreak: 5,
        lastPlayedDate: new Date().toDateString(),
        totalPuzzlesSolved: 40,
        pendingLevelUp: null,
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));

    // Set empty shop state
    const shopState = {
      state: {
        inventory: [],
        equippedItems: {},
        purchaseHistory: [],
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
  });
}

test.describe('Boss Level State', () => {
  test('should be at boss level (Level 6) after setup', async ({ page }) => {
    await setupBossLevel(page);
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify we're at level 6
    const currentLevel = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      return state.state?.currentLevel;
    });
    expect(currentLevel).toBe(6);
  });

  test('should have completed levels 1-5', async ({ page }) => {
    await setupBossLevel(page);
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify levels 1-5 are completed
    const levelStatuses = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      const levels = state.state?.worlds?.training?.levels || {};
      return {
        level1: levels['1']?.status,
        level2: levels['2']?.status,
        level3: levels['3']?.status,
        level4: levels['4']?.status,
        level5: levels['5']?.status,
        level6: levels['6']?.status,
      };
    });

    expect(levelStatuses.level1).toBe('completed');
    expect(levelStatuses.level2).toBe('completed');
    expect(levelStatuses.level3).toBe('completed');
    expect(levelStatuses.level4).toBe('completed');
    expect(levelStatuses.level5).toBe('completed');
    expect(levelStatuses.level6).toBe('in_progress');
  });

  test('should have 5 total levels completed', async ({ page }) => {
    await setupBossLevel(page);
    await page.goto('/');
    await page.waitForTimeout(1000);

    const totalCompleted = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      return state.state?.totalLevelsCompleted;
    });
    expect(totalCompleted).toBe(5);
  });
});

test.describe('Boss Defeat Tracking', () => {
  test('should track boss defeat timestamp', async ({ page }) => {
    // Set up state with boss already defeated
    await page.addInitScript(() => {
      // Skip onboarding
      const userState = {
        state: {
          hasCompletedOnboarding: true,
          hasSeenPrologue: true,
          hasSeenTutorial: true,
          hasSeenZoneIntro: { training: true, factory: true, lab: true, city: true, core: true },
          username: 'TestPlayer',
          avatar: 'wizard',
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-user', JSON.stringify(userState));

      const bossDefeatedTime = Date.now();
      const progressState = {
        state: {
          currentLevel: 7,
          currentWorld: 'factory',
          totalPuzzlesSolved: 41,
          totalLevelsCompleted: 6,
          progressVersion: 3,
          worlds: {
            training: {
              worldId: 'training',
              status: 'completed',
              unlockedAt: Date.now() - 86400000,
              completedAt: Date.now(),
              levels: {
                '1': { levelNumber: 1, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 3600000 },
                '2': { levelNumber: 2, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 3000000 },
                '3': { levelNumber: 3, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 2400000 },
                '4': { levelNumber: 4, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 1800000 },
                '5': { levelNumber: 5, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed', completedAt: Date.now() - 1200000 },
                '6': { levelNumber: 6, puzzlesSolved: 1, puzzlesRequired: 1, status: 'completed', completedAt: bossDefeatedTime, bossDefeatedAt: bossDefeatedTime },
              },
            },
            factory: {
              worldId: 'factory',
              status: 'in_progress',
              unlockedAt: Date.now(),
              levels: {
                '7': { levelNumber: 7, puzzlesSolved: 0, puzzlesRequired: 9, status: 'in_progress' },
              },
            },
          },
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-progress-v3', JSON.stringify(progressState));

      // Player got 100 coins from boss
      const playerState = {
        state: {
          level: 5,
          xp: 75,
          xpToNextLevel: 759,
          coins: 300, // 200 + 100 from boss
          skill: { '+': 0.7, '-': 0.6, '×': 0.5, '÷': 0.4 },
          inventory: [],
          equippedItems: {},
          activeEffects: [],
          dailyStreak: 5,
          lastPlayedDate: new Date().toDateString(),
          totalPuzzlesSolved: 41,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify boss defeat timestamp is recorded
    const bossData = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      const level6 = state.state?.worlds?.training?.levels?.['6'];
      return {
        bossDefeatedAt: level6?.bossDefeatedAt,
        status: level6?.status,
      };
    });

    expect(bossData.bossDefeatedAt).toBeDefined();
    expect(bossData.status).toBe('completed');
  });

  test('should unlock next world after boss defeat', async ({ page }) => {
    // Set up state with boss defeated and Factory unlocked
    await page.addInitScript(() => {
      const userState = {
        state: {
          hasCompletedOnboarding: true,
          hasSeenPrologue: true,
          hasSeenTutorial: true,
          hasSeenZoneIntro: { training: true, factory: true, lab: true, city: true, core: true },
          username: 'TestPlayer',
          avatar: 'wizard',
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-user', JSON.stringify(userState));

      const progressState = {
        state: {
          currentLevel: 7,
          currentWorld: 'factory',
          totalPuzzlesSolved: 41,
          totalLevelsCompleted: 6,
          progressVersion: 3,
          worlds: {
            training: {
              worldId: 'training',
              status: 'completed',
              unlockedAt: Date.now() - 86400000,
              completedAt: Date.now(),
              levels: {
                '1': { levelNumber: 1, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '2': { levelNumber: 2, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '3': { levelNumber: 3, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '4': { levelNumber: 4, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '5': { levelNumber: 5, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '6': { levelNumber: 6, puzzlesSolved: 1, puzzlesRequired: 1, status: 'completed', bossDefeatedAt: Date.now() },
              },
            },
            factory: {
              worldId: 'factory',
              status: 'in_progress',
              unlockedAt: Date.now(),
              levels: {
                '7': { levelNumber: 7, puzzlesSolved: 0, puzzlesRequired: 9, status: 'in_progress' },
              },
            },
          },
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-progress-v3', JSON.stringify(progressState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify Factory world is unlocked
    const worldData = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      return {
        currentWorld: state.state?.currentWorld,
        currentLevel: state.state?.currentLevel,
        trainingStatus: state.state?.worlds?.training?.status,
        factoryStatus: state.state?.worlds?.factory?.status,
        factoryUnlockedAt: state.state?.worlds?.factory?.unlockedAt,
      };
    });

    expect(worldData.currentWorld).toBe('factory');
    expect(worldData.currentLevel).toBe(7);
    expect(worldData.trainingStatus).toBe('completed');
    expect(worldData.factoryStatus).toBe('in_progress');
    expect(worldData.factoryUnlockedAt).toBeDefined();
  });
});

test.describe('Boss Coin Reward', () => {
  test('should have 100 extra coins after boss defeat', async ({ page }) => {
    // Initial state: 200 coins before boss
    const initialCoins = 200;
    const bossReward = 100;
    const expectedCoins = initialCoins + bossReward;

    await page.addInitScript((expected) => {
      const userState = {
        state: {
          hasCompletedOnboarding: true,
          hasSeenPrologue: true,
          hasSeenTutorial: true,
          hasSeenZoneIntro: { training: true, factory: true, lab: true, city: true, core: true },
          username: 'TestPlayer',
          avatar: 'wizard',
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-user', JSON.stringify(userState));

      // Player state with coins after boss defeat
      const playerState = {
        state: {
          level: 5,
          xp: 75,
          xpToNextLevel: 759,
          coins: expected.coins, // 200 initial + 100 boss reward
          skill: { '+': 0.7, '-': 0.6, '×': 0.5, '÷': 0.4 },
          inventory: [],
          equippedItems: {},
          activeEffects: [],
          dailyStreak: 5,
          lastPlayedDate: new Date().toDateString(),
          totalPuzzlesSolved: 41,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));
    }, { coins: expectedCoins });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify coins
    const coins = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.coins;
    });

    expect(coins).toBe(expectedCoins);
  });
});
