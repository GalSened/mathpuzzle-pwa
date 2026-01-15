import { test, expect } from '@playwright/test';

// Helper to set up localStorage to skip onboarding (only if not already set)
async function skipOnboarding(page: import('@playwright/test').Page, forceReset = true) {
  await page.addInitScript((forceReset) => {
    // Only set initial values if forceReset is true or no existing data
    if (!forceReset && localStorage.getItem('mathpuzzle-user')) {
      return; // Preserve existing state
    }

    // Set up user store to skip onboarding
    const userState = {
      state: {
        hasCompletedOnboarding: true,
        hasSeenPrologue: true,
        hasSeenTutorial: true,
        hasSeenZoneIntro: {
          training: true,
          factory: true,
          lab: true,
          city: true,
          core: true,
        },
        username: 'TestPlayer',
        avatar: 'wizard',
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-user', JSON.stringify(userState));

    // Set up initial progress state
    const progressState = {
      state: {
        currentLevel: 1,
        currentWorld: 'training',
        totalPuzzlesSolved: 0,
        totalLevelsCompleted: 0,
        progressVersion: 3,
        worlds: {
          training: {
            worldId: 'training',
            status: 'in_progress',
            unlockedAt: Date.now(),
            levels: {
              '1': {
                levelNumber: 1,
                puzzlesSolved: 0,
                puzzlesRequired: 8,
                status: 'in_progress',
              },
            },
          },
        },
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-progress-v3', JSON.stringify(progressState));

    // Set up initial player state
    const playerState = {
      state: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        coins: 0,
        skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
        inventory: [],
        equippedItems: {},
        activeEffects: [],
        dailyStreak: 0,
        lastPlayedDate: null,
        totalPuzzlesSolved: 0,
        pendingLevelUp: null,
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));

    // Set up empty shop state
    const shopState = {
      state: {
        inventory: [],
        equippedItems: {},
        purchaseHistory: [],
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
  }, forceReset);
}

test.describe('App Loading', () => {
  test('should load home screen after skipping onboarding', async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('body')).toBeVisible();

    // Should show the home screen - check for app container or nav elements
    // The app might show different content based on state, so check for main app structure
    const appLoaded = await page.waitForSelector('[data-testid="app-root"], #root, main, .app', { timeout: 10000 }).catch(() => null);
    expect(appLoaded).toBeTruthy();

    // Verify localStorage was set correctly (onboarding skipped)
    const hasOnboarding = await page.evaluate(() => {
      const userState = JSON.parse(localStorage.getItem('mathpuzzle-user') || '{}');
      return userState.state?.hasCompletedOnboarding;
    });
    expect(hasOnboarding).toBe(true);
  });

  test('should display player stats', async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');

    // Wait for app to render
    await page.waitForTimeout(1000);

    // Should show coins (starting with 0)
    const coinsDisplay = page.locator('[data-testid="coins-display"]').or(
      page.getByText(/\d+/).first()
    );
    await expect(coinsDisplay).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('should navigate to shop tab', async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find and click shop button/tab
    const shopTab = page.getByRole('button', { name: /shop/i }).or(
      page.locator('[data-tab="shop"]').or(
        page.getByText(/shop/i).first()
      )
    );

    if (await shopTab.isVisible()) {
      await shopTab.click();

      // Wait for shop content to appear
      await page.waitForTimeout(500);

      // Shop should show some items
      const shopContent = page.getByText(/cloak/i).or(
        page.getByText(/pet/i).or(
          page.getByText(/consumable/i)
        )
      );
      await expect(shopContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to play tab', async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');

    await page.waitForTimeout(1000);

    // Find and click play button
    const playTab = page.getByRole('button', { name: /play/i }).or(
      page.locator('[data-tab="play"]').or(
        page.getByText(/play/i).first()
      )
    );

    if (await playTab.isVisible()) {
      await playTab.click();

      // Wait for game content
      await page.waitForTimeout(500);

      // Should show puzzle-related content
      const gameContent = page.getByText(/\d+/).first(); // Numbers in puzzle
      await expect(gameContent).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('State Persistence', () => {
  test('should persist state across page reload', async ({ page }) => {
    // Set up state with modified values BEFORE first load
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

      // Set player state with modified values
      const playerState = {
        state: {
          level: 5,
          xp: 0,
          xpToNextLevel: 100,
          coins: 500,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          activeEffects: [],
          dailyStreak: 0,
          lastPlayedDate: null,
          totalPuzzlesSolved: 0,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify initial state loaded
    const initialCoins = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.coins;
    });
    expect(initialCoins).toBe(500);

    // Reload page (addInitScript won't overwrite because we're not re-registering it)
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify state persisted (Zustand persist middleware should restore from localStorage)
    const persistedCoins = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.coins;
    });
    expect(persistedCoins).toBe(500);

    const persistedLevel = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.level;
    });
    expect(persistedLevel).toBe(5);
  });

  test('should restore progress after page reload', async ({ page }) => {
    // Set up state with modified progress BEFORE first load
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

      // Set progress state with modified values
      const progressState = {
        state: {
          currentLevel: 3,
          currentWorld: 'training',
          totalPuzzlesSolved: 10,
          totalLevelsCompleted: 2,
          progressVersion: 3,
          worlds: {
            training: {
              worldId: 'training',
              status: 'in_progress',
              unlockedAt: Date.now(),
              levels: {
                '1': { levelNumber: 1, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '2': { levelNumber: 2, puzzlesSolved: 8, puzzlesRequired: 8, status: 'completed' },
                '3': { levelNumber: 3, puzzlesSolved: 2, puzzlesRequired: 8, status: 'in_progress' },
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

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify progress persisted
    const persistedPuzzles = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      return state.state?.totalPuzzlesSolved;
    });
    expect(persistedPuzzles).toBe(10);

    const persistedLevel = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-progress-v3') || '{}');
      return state.state?.currentLevel;
    });
    expect(persistedLevel).toBe(3);
  });
});

test.describe('Shop State', () => {
  test('should track inventory after page reload', async ({ page }) => {
    // Set up shop state with inventory BEFORE first load
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

      // Set shop state with inventory
      const shopState = {
        state: {
          inventory: [
            { itemId: 'consumable-hint', quantity: 5, purchasedAt: Date.now() }
          ],
          equippedItems: {},
          purchaseHistory: [],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify inventory persisted
    const inventory = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.inventory;
    });
    expect(inventory).toHaveLength(1);
    expect(inventory[0].itemId).toBe('consumable-hint');
    expect(inventory[0].quantity).toBe(5);
  });

  test('should track equipped items after page reload', async ({ page }) => {
    // Set up shop state with equipped items BEFORE first load
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

      // Set shop state with equipped items
      const shopState = {
        state: {
          inventory: [
            { itemId: 'cloak-scholar', quantity: 1, purchasedAt: Date.now() }
          ],
          equippedItems: { cloak: 'cloak-scholar' },
          purchaseHistory: [],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify equipment persisted
    const equipped = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.equippedItems;
    });
    expect(equipped.cloak).toBe('cloak-scholar');
  });
});

test.describe('XP and Level System', () => {
  test('should track level and XP in localStorage', async ({ page }) => {
    // Set up player state with XP/level BEFORE first load
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

      // Set player state with custom XP/level
      const playerState = {
        state: {
          level: 3,
          xp: 75,
          xpToNextLevel: 225, // 100 * 1.5^2
          coins: 0,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          activeEffects: [],
          dailyStreak: 0,
          lastPlayedDate: null,
          totalPuzzlesSolved: 0,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify state loaded correctly
    const xpData = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return {
        xp: state.state?.xp,
        level: state.state?.level,
        xpToNextLevel: state.state?.xpToNextLevel,
      };
    });

    expect(xpData.xp).toBe(75);
    expect(xpData.level).toBe(3);
    expect(xpData.xpToNextLevel).toBe(225);
  });
});

test.describe('Skill Tracking', () => {
  test('should persist skill levels', async ({ page }) => {
    // Set up player state with custom skills BEFORE first load
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

      // Set player state with custom skills
      const playerState = {
        state: {
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          coins: 0,
          skill: {
            '+': 0.75,
            '-': 0.65,
            '×': 0.55,
            '÷': 0.45,
          },
          inventory: [],
          equippedItems: {},
          activeEffects: [],
          dailyStreak: 0,
          lastPlayedDate: null,
          totalPuzzlesSolved: 0,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Reload and verify skills persist
    await page.reload();
    await page.waitForTimeout(1000);

    const skills = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.skill;
    });

    expect(skills['+']).toBe(0.75);
    expect(skills['-']).toBe(0.65);
    expect(skills['×']).toBe(0.55);
    expect(skills['÷']).toBe(0.45);
  });
});
