import { describe, it, expect, beforeEach } from 'vitest';
import { useShopStore } from '@/store/shopStore';
import { usePlayerStore } from '@/store/playerStore';

describe('shopStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    useShopStore.getState().resetShop();
    usePlayerStore.getState().resetPlayer();
  });

  describe('Initial State', () => {
    it('should start with empty inventory', () => {
      const state = useShopStore.getState();
      expect(state.inventory).toEqual([]);
    });

    it('should start with no equipped items', () => {
      const state = useShopStore.getState();
      expect(state.equippedItems).toEqual({});
    });

    it('should start with empty purchase history', () => {
      const state = useShopStore.getState();
      expect(state.purchaseHistory).toEqual([]);
    });
  });

  describe('canAfford', () => {
    it('should return true when player has enough coins', () => {
      // Give player 100 coins
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 coins

      expect(useShopStore.getState().canAfford(50)).toBe(true);
      expect(useShopStore.getState().canAfford(100)).toBe(true);
    });

    it('should return false when player lacks coins', () => {
      // Player starts with 0 coins
      expect(useShopStore.getState().canAfford(50)).toBe(false);
    });
  });

  describe('canBuy', () => {
    beforeEach(() => {
      // Give player enough coins and level
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 coins
      usePlayerStore.getState().addCoins(0, 'boss'); // +200 total
      usePlayerStore.getState().addCoins(0, 'boss'); // +300 total
      usePlayerStore.getState().addCoins(0, 'boss'); // +400 total
    });

    it('should return success for affordable unlocked item', () => {
      const result = useShopStore.getState().canBuy('consumable-hint'); // 25 coins, no level req
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent item', () => {
      const result = useShopStore.getState().canBuy('invalid-item');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when insufficient coins', () => {
      usePlayerStore.getState().resetPlayer(); // Reset to 0 coins
      const result = useShopStore.getState().canBuy('consumable-hint');
      expect(result.success).toBe(false);
    });

    it('should return error when level requirement not met', () => {
      // cloak-scholar requires level 5, player starts at level 1
      const result = useShopStore.getState().canBuy('cloak-scholar');
      expect(result.success).toBe(false);
    });

    it('should allow purchase when level requirement met', () => {
      // Level up player to 5
      for (let i = 0; i < 10; i++) {
        usePlayerStore.getState().addXP(500);
        usePlayerStore.getState().clearPendingLevelUp();
      }
      expect(usePlayerStore.getState().level).toBeGreaterThanOrEqual(5);

      const result = useShopStore.getState().canBuy('cloak-scholar');
      expect(result.success).toBe(true);
    });
  });

  describe('buyItem', () => {
    beforeEach(() => {
      // Give player 500 coins
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addCoins(0, 'boss'); // 100 each
      }
    });

    it('should successfully purchase affordable item', () => {
      const initialCoins = usePlayerStore.getState().coins;
      const result = useShopStore.getState().buyItem('consumable-hint'); // 25 coins

      expect(result.success).toBe(true);
      expect(usePlayerStore.getState().coins).toBe(initialCoins - 25);
    });

    it('should add item to inventory', () => {
      useShopStore.getState().buyItem('consumable-hint');

      expect(useShopStore.getState().hasItem('consumable-hint')).toBe(true);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(1);
    });

    it('should increment quantity for duplicate purchases', () => {
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');

      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(3);
    });

    it('should record purchase in history', () => {
      useShopStore.getState().buyItem('consumable-hint');

      const history = useShopStore.getState().purchaseHistory;
      expect(history.length).toBe(1);
      expect(history[0].itemId).toBe('consumable-hint');
      expect(history[0].price).toBe(25);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should reject purchase when insufficient coins', () => {
      usePlayerStore.getState().resetPlayer(); // 0 coins
      const result = useShopStore.getState().buyItem('consumable-hint');

      expect(result.success).toBe(false);
      expect(useShopStore.getState().hasItem('consumable-hint')).toBe(false);
    });

    it('should reject purchase when level requirement not met', () => {
      // cloak-scholar requires level 5
      const result = useShopStore.getState().buyItem('cloak-scholar');

      expect(result.success).toBe(false);
    });

    it('should respect maxOwned limit for consumables', () => {
      // consumable-hint has maxOwned: 10
      // Buy 10 items
      for (let i = 0; i < 10; i++) {
        useShopStore.getState().buyItem('consumable-hint');
      }

      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(10);

      // Try to buy 11th
      const result = useShopStore.getState().buyItem('consumable-hint');
      expect(result.success).toBe(false);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(10);
    });

    it('should prevent duplicate cloak purchases', () => {
      // Level up to unlock pet-owl (level 2)
      usePlayerStore.getState().addXP(150);
      usePlayerStore.getState().clearPendingLevelUp();

      // Buy pet-owl
      const result1 = useShopStore.getState().buyItem('pet-owl');
      expect(result1.success).toBe(true);

      // Try to buy same pet again
      const result2 = useShopStore.getState().buyItem('pet-owl');
      expect(result2.success).toBe(false);
    });
  });

  describe('hasItem / getItemQuantity', () => {
    beforeEach(() => {
      usePlayerStore.getState().addCoins(0, 'boss');
    });

    it('should return false/0 for items not owned', () => {
      expect(useShopStore.getState().hasItem('consumable-hint')).toBe(false);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(0);
    });

    it('should return true/count for owned items', () => {
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');

      expect(useShopStore.getState().hasItem('consumable-hint')).toBe(true);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(2);
    });
  });

  describe('equipItem', () => {
    beforeEach(() => {
      // Give player coins and level up for cloak purchases
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addCoins(0, 'boss');
      }
      // Level up to 3 for cloak-focus (unlockLevel: 3)
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addXP(200);
        usePlayerStore.getState().clearPendingLevelUp();
      }
    });

    it('should equip item to correct slot', () => {
      useShopStore.getState().buyItem('cloak-focus');
      const result = useShopStore.getState().equipItem('cloak-focus', 'cloak');

      expect(result).toBe(true);
      expect(useShopStore.getState().equippedItems.cloak).toBe('cloak-focus');
    });

    it('should fail to equip item not in inventory', () => {
      const result = useShopStore.getState().equipItem('cloak-focus', 'cloak');
      expect(result).toBe(false);
    });

    it('should fail to equip item to wrong slot', () => {
      useShopStore.getState().buyItem('cloak-focus');
      const result = useShopStore.getState().equipItem('cloak-focus', 'pet');

      expect(result).toBe(false);
    });

    it('should replace previously equipped item', () => {
      // Add more coins (need 200 + 350 = 550 for both cloaks)
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 = 600 total

      // Level up more to unlock cloak-lucky (level 4)
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addXP(500);
        usePlayerStore.getState().clearPendingLevelUp();
      }
      expect(usePlayerStore.getState().level).toBeGreaterThanOrEqual(4);

      const buyResult1 = useShopStore.getState().buyItem('cloak-focus');
      expect(buyResult1.success).toBe(true);

      const buyResult2 = useShopStore.getState().buyItem('cloak-lucky');
      expect(buyResult2.success).toBe(true);

      useShopStore.getState().equipItem('cloak-focus', 'cloak');
      expect(useShopStore.getState().equippedItems.cloak).toBe('cloak-focus');

      useShopStore.getState().equipItem('cloak-lucky', 'cloak');
      expect(useShopStore.getState().equippedItems.cloak).toBe('cloak-lucky');
    });

    it('should apply permanent effect when equipping', () => {
      useShopStore.getState().buyItem('cloak-focus');
      useShopStore.getState().equipItem('cloak-focus', 'cloak');

      // cloak-focus adds skill_boost for multiplication
      const effects = usePlayerStore.getState().activeEffects;
      const skillBoost = effects.find(e => e.type === 'skill_boost' && e.operator === '×');
      expect(skillBoost).toBeDefined();
      expect(skillBoost?.value).toBe(0.1);
    });
  });

  describe('unequipItem', () => {
    beforeEach(() => {
      // Setup: give coins, level up, buy and equip item
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addCoins(0, 'boss');
      }
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addXP(200);
        usePlayerStore.getState().clearPendingLevelUp();
      }
      useShopStore.getState().buyItem('cloak-focus');
      useShopStore.getState().equipItem('cloak-focus', 'cloak');
    });

    it('should remove item from equipped slot', () => {
      expect(useShopStore.getState().equippedItems.cloak).toBe('cloak-focus');

      useShopStore.getState().unequipItem('cloak');

      expect(useShopStore.getState().equippedItems.cloak).toBeUndefined();
    });

    it('should do nothing when slot is empty', () => {
      useShopStore.getState().unequipItem('pet'); // Nothing equipped in pet slot
      expect(useShopStore.getState().equippedItems.pet).toBeUndefined();
    });
  });

  describe('consumeItem', () => {
    beforeEach(() => {
      // Give player coins
      for (let i = 0; i < 3; i++) {
        usePlayerStore.getState().addCoins(0, 'boss');
      }
    });

    it('should decrement consumable quantity', () => {
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().buyItem('consumable-hint');
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(2);

      const result = useShopStore.getState().consumeItem('consumable-hint');

      expect(result).toBe(true);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(1);
    });

    it('should remove item from inventory when quantity reaches 0', () => {
      useShopStore.getState().buyItem('consumable-hint');
      useShopStore.getState().consumeItem('consumable-hint');

      expect(useShopStore.getState().hasItem('consumable-hint')).toBe(false);
      expect(useShopStore.getState().getItemQuantity('consumable-hint')).toBe(0);
    });

    it('should apply effect to player when consumed', () => {
      useShopStore.getState().buyItem('consumable-double-xp'); // 2x XP for 5 puzzles

      const initialEffects = usePlayerStore.getState().activeEffects.length;
      useShopStore.getState().consumeItem('consumable-double-xp');

      const effects = usePlayerStore.getState().activeEffects;
      expect(effects.length).toBe(initialEffects + 1);

      const xpEffect = effects.find(e => e.type === 'xp_multiplier' && e.duration === 5);
      expect(xpEffect).toBeDefined();
      expect(xpEffect?.value).toBe(2);
    });

    it('should fail to consume non-existent item', () => {
      const result = useShopStore.getState().consumeItem('consumable-hint');
      expect(result).toBe(false);
    });

    it('should fail to consume non-consumable items', () => {
      // Level up for cloak
      for (let i = 0; i < 5; i++) {
        usePlayerStore.getState().addXP(200);
        usePlayerStore.getState().clearPendingLevelUp();
      }
      useShopStore.getState().buyItem('cloak-focus');

      const result = useShopStore.getState().consumeItem('cloak-focus');
      expect(result).toBe(false);
    });

    it('should allow consuming boost items', () => {
      useShopStore.getState().buyItem('boost-addition');
      const result = useShopStore.getState().consumeItem('boost-addition');

      expect(result).toBe(true);
      expect(useShopStore.getState().hasItem('boost-addition')).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all shop state', () => {
      // Setup some state
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-hint');

      // Reset
      useShopStore.getState().resetShop();

      // Verify
      const state = useShopStore.getState();
      expect(state.inventory).toEqual([]);
      expect(state.equippedItems).toEqual({});
      expect(state.purchaseHistory).toEqual([]);
    });
  });

  describe('Cross-store Integration', () => {
    it('should deduct coins from playerStore on purchase', () => {
      usePlayerStore.getState().addCoins(0, 'boss'); // +100 coins
      const initialCoins = usePlayerStore.getState().coins;

      useShopStore.getState().buyItem('consumable-hint'); // 25 coins

      expect(usePlayerStore.getState().coins).toBe(initialCoins - 25);
    });

    it('should add effect to playerStore when consuming item', () => {
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-double-xp');

      // Clear any existing effects
      usePlayerStore.getState().resetPlayer();
      usePlayerStore.getState().addCoins(0, 'boss');
      useShopStore.getState().buyItem('consumable-double-xp');

      useShopStore.getState().consumeItem('consumable-double-xp');

      const effects = usePlayerStore.getState().activeEffects;
      expect(effects.some(e => e.type === 'xp_multiplier' && e.value === 2)).toBe(true);
    });
  });
});
