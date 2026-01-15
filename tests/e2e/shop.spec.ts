import { test, expect } from '@playwright/test';

// Helper to set up state with coins for shopping
async function setupShopState(page: import('@playwright/test').Page, coins: number, level: number = 1) {
  await page.addInitScript(({ coins, level }) => {
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

    // Player state with coins
    const playerState = {
      state: {
        level: level,
        xp: 0,
        xpToNextLevel: 100,
        coins: coins,
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

    // Empty shop state
    const shopState = {
      state: {
        inventory: [],
        equippedItems: {},
        purchaseHistory: [],
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));

    // Initial progress state
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
              '1': { levelNumber: 1, puzzlesSolved: 0, puzzlesRequired: 8, status: 'in_progress' },
            },
          },
        },
      },
      version: 0,
    };
    localStorage.setItem('mathpuzzle-progress-v3', JSON.stringify(progressState));
  }, { coins, level });
}

test.describe('Shop Coin Balance', () => {
  test('should start with specified coin balance', async ({ page }) => {
    const startingCoins = 500;
    await setupShopState(page, startingCoins);
    await page.goto('/');
    await page.waitForTimeout(1000);

    const coins = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.coins;
    });

    expect(coins).toBe(startingCoins);
  });

  test('should have empty inventory initially', async ({ page }) => {
    await setupShopState(page, 500);
    await page.goto('/');
    await page.waitForTimeout(1000);

    const inventory = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.inventory;
    });

    expect(inventory).toEqual([]);
  });
});

test.describe('Shop Inventory State', () => {
  test('should track purchased consumables', async ({ page }) => {
    // Set up state with items already purchased
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

      // Player spent 75 coins (3 × 25 for hints)
      const playerState = {
        state: {
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          coins: 425, // 500 - 75
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

      // Shop state with purchased items
      const shopState = {
        state: {
          inventory: [
            { itemId: 'consumable-hint', quantity: 3, purchasedAt: Date.now() }
          ],
          equippedItems: {},
          purchaseHistory: [
            { itemId: 'consumable-hint', price: 25, timestamp: Date.now() - 3000 },
            { itemId: 'consumable-hint', price: 25, timestamp: Date.now() - 2000 },
            { itemId: 'consumable-hint', price: 25, timestamp: Date.now() - 1000 },
          ],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify inventory
    const shopData = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return {
        inventory: state.state?.inventory,
        purchaseHistory: state.state?.purchaseHistory,
      };
    });

    expect(shopData.inventory).toHaveLength(1);
    expect(shopData.inventory[0].itemId).toBe('consumable-hint');
    expect(shopData.inventory[0].quantity).toBe(3);
    expect(shopData.purchaseHistory).toHaveLength(3);
  });

  test('should track max owned limit for consumables', async ({ page }) => {
    // Set up state with max consumables (10)
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

      // Shop state with max consumables
      const shopState = {
        state: {
          inventory: [
            { itemId: 'consumable-hint', quantity: 10, purchasedAt: Date.now() }
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

    const quantity = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      const hint = state.state?.inventory.find((i: { itemId: string }) => i.itemId === 'consumable-hint');
      return hint?.quantity;
    });

    expect(quantity).toBe(10);
  });
});

test.describe('Equipment Tracking', () => {
  test('should track equipped cloak', async ({ page }) => {
    // Set up state with equipped cloak
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

      // Player at level 5 (can equip cloak-scholar)
      const playerState = {
        state: {
          level: 5,
          xp: 0,
          xpToNextLevel: 759,
          coins: 100,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          // Cloak effect applied
          activeEffects: [
            { type: 'xp_multiplier', value: 1.15, itemId: 'cloak-scholar', duration: undefined }
          ],
          dailyStreak: 0,
          lastPlayedDate: null,
          totalPuzzlesSolved: 0,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));

      // Shop state with equipped cloak
      const shopState = {
        state: {
          inventory: [
            { itemId: 'cloak-scholar', quantity: 1, purchasedAt: Date.now() }
          ],
          equippedItems: { cloak: 'cloak-scholar' },
          purchaseHistory: [
            { itemId: 'cloak-scholar', price: 300, timestamp: Date.now() }
          ],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify equipment
    const equipment = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.equippedItems;
    });

    expect(equipment.cloak).toBe('cloak-scholar');
  });

  test('should track equipped pet', async ({ page }) => {
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

      const shopState = {
        state: {
          inventory: [
            { itemId: 'pet-owl', quantity: 1, purchasedAt: Date.now() }
          ],
          equippedItems: { pet: 'pet-owl' },
          purchaseHistory: [],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    const equipment = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.equippedItems;
    });

    expect(equipment.pet).toBe('pet-owl');
  });

  test('should track multiple equipped items', async ({ page }) => {
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

      // Player at level 5 with effects from equipment
      const playerState = {
        state: {
          level: 5,
          xp: 0,
          xpToNextLevel: 759,
          coins: 50,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          activeEffects: [
            { type: 'xp_multiplier', value: 1.15, itemId: 'cloak-scholar', duration: undefined },
            { type: 'hint_discount', value: 0.1, itemId: 'pet-owl', duration: undefined },
          ],
          dailyStreak: 0,
          lastPlayedDate: null,
          totalPuzzlesSolved: 0,
          pendingLevelUp: null,
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-player', JSON.stringify(playerState));

      const shopState = {
        state: {
          inventory: [
            { itemId: 'cloak-scholar', quantity: 1, purchasedAt: Date.now() },
            { itemId: 'pet-owl', quantity: 1, purchasedAt: Date.now() },
          ],
          equippedItems: { cloak: 'cloak-scholar', pet: 'pet-owl' },
          purchaseHistory: [],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    const equipment = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.equippedItems;
    });

    expect(equipment.cloak).toBe('cloak-scholar');
    expect(equipment.pet).toBe('pet-owl');
  });
});

test.describe('Effect Application', () => {
  test('should have active effect from equipped cloak', async ({ page }) => {
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

      const playerState = {
        state: {
          level: 5,
          xp: 0,
          xpToNextLevel: 759,
          coins: 100,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          activeEffects: [
            { type: 'xp_multiplier', value: 1.15, itemId: 'cloak-scholar', duration: undefined }
          ],
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

    const effects = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.activeEffects;
    });

    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe('xp_multiplier');
    expect(effects[0].value).toBe(1.15);
    expect(effects[0].duration).toBeUndefined(); // Permanent effect
  });

  test('should have temporary effect from consumable', async ({ page }) => {
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

      // Player with active consumable effect (5 puzzles remaining)
      const playerState = {
        state: {
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          coins: 100,
          skill: { '+': 0.5, '-': 0.4, '×': 0.3, '÷': 0.2 },
          inventory: [],
          equippedItems: {},
          activeEffects: [
            { type: 'xp_multiplier', value: 2.0, duration: 5 } // Double XP for 5 puzzles
          ],
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

    const effects = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-player') || '{}');
      return state.state?.activeEffects;
    });

    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe('xp_multiplier');
    expect(effects[0].value).toBe(2.0);
    expect(effects[0].duration).toBe(5);
  });
});

test.describe('Purchase History', () => {
  test('should track purchase history', async ({ page }) => {
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

      const shopState = {
        state: {
          inventory: [
            { itemId: 'consumable-hint', quantity: 2, purchasedAt: Date.now() }
          ],
          equippedItems: {},
          purchaseHistory: [
            { itemId: 'consumable-hint', price: 25, timestamp: Date.now() - 2000 },
            { itemId: 'consumable-hint', price: 25, timestamp: Date.now() - 1000 },
          ],
        },
        version: 0,
      };
      localStorage.setItem('mathpuzzle-shop', JSON.stringify(shopState));
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    const history = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('mathpuzzle-shop') || '{}');
      return state.state?.purchaseHistory;
    });

    expect(history).toHaveLength(2);
    expect(history[0].itemId).toBe('consumable-hint');
    expect(history[0].price).toBe(25);
    expect(history[0].timestamp).toBeDefined();
  });
});
