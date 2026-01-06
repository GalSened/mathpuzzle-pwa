import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InventoryItem,
  EquippedItems,
  PurchaseResult,
  EquipmentSlot,
} from '@/engine/shopTypes';
import { getShopItemById } from '@/data/shopItems';
import { usePlayerStore } from './playerStore';

interface ShopState {
  inventory: InventoryItem[];
  equippedItems: EquippedItems;
  purchaseHistory: Array<{
    itemId: string;
    price: number;
    timestamp: number;
  }>;

  // Actions
  buyItem: (itemId: string) => PurchaseResult;
  equipItem: (itemId: string, slot: EquipmentSlot) => boolean;
  unequipItem: (slot: EquipmentSlot) => void;
  consumeItem: (itemId: string) => boolean;
  hasItem: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  canAfford: (price: number) => boolean;
  canBuy: (itemId: string) => PurchaseResult;
  resetShop: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      inventory: [],
      equippedItems: {},
      purchaseHistory: [],

      buyItem: (itemId: string): PurchaseResult => {
        const item = getShopItemById(itemId);
        if (!item) {
          return { success: false, error: 'פריט לא נמצא' };
        }

        const playerStore = usePlayerStore.getState();

        // Check level requirement
        if (item.unlockLevel && playerStore.level < item.unlockLevel) {
          return { success: false, error: `נדרש שלב ${item.unlockLevel}` };
        }

        // Check if can afford
        if (playerStore.coins < item.price) {
          return { success: false, error: 'אין מספיק מטבעות' };
        }

        // Check max owned for consumables/boosts
        if (item.maxOwned) {
          const currentQty = get().getItemQuantity(itemId);
          if (currentQty >= item.maxOwned) {
            return { success: false, error: `מקסימום ${item.maxOwned} פריטים` };
          }
        }

        // Check if already owns non-stackable item (cloak/pet)
        if (item.category === 'cloak' || item.category === 'pet') {
          if (get().hasItem(itemId)) {
            return { success: false, error: 'כבר יש לך פריט זה' };
          }
        }

        // Process purchase
        const success = playerStore.useCoins(item.price);
        if (!success) {
          return { success: false, error: 'שגיאה בתשלום' };
        }

        // Add to inventory
        set((state) => {
          const existingItem = state.inventory.find(i => i.itemId === itemId);

          if (existingItem) {
            // Increment quantity
            return {
              inventory: state.inventory.map(i =>
                i.itemId === itemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              purchaseHistory: [
                ...state.purchaseHistory,
                { itemId, price: item.price, timestamp: Date.now() }
              ],
            };
          } else {
            // Add new item
            return {
              inventory: [
                ...state.inventory,
                { itemId, quantity: 1, purchasedAt: Date.now() }
              ],
              purchaseHistory: [
                ...state.purchaseHistory,
                { itemId, price: item.price, timestamp: Date.now() }
              ],
            };
          }
        });

        return {
          success: true,
          newBalance: playerStore.coins,
        };
      },

      equipItem: (itemId: string, slot: EquipmentSlot): boolean => {
        const item = getShopItemById(itemId);
        if (!item) return false;

        // Verify item is in inventory
        if (!get().hasItem(itemId)) return false;

        // Verify item matches slot
        if (item.category !== slot) return false;

        // Equip the item
        set((state) => ({
          equippedItems: {
            ...state.equippedItems,
            [slot]: itemId,
          },
        }));

        // Apply permanent effects to player
        const playerStore = usePlayerStore.getState();
        if (item.effect.duration === undefined) {
          playerStore.addActiveEffect(item.effect);
        }

        return true;
      },

      unequipItem: (slot: EquipmentSlot): void => {
        const equippedItemId = get().equippedItems[slot];
        if (!equippedItemId) return;

        // Remove from equipped
        set((state) => {
          const newEquipped = { ...state.equippedItems };
          delete newEquipped[slot];
          return { equippedItems: newEquipped };
        });

        // Note: Effect removal would need to be handled by playerStore
        // based on equipped items check
      },

      consumeItem: (itemId: string): boolean => {
        const item = getShopItemById(itemId);
        if (!item) return false;

        // Only consumables and boosts can be used
        if (item.category !== 'consumable' && item.category !== 'boost') {
          return false;
        }

        // Check if we have the item
        const quantity = get().getItemQuantity(itemId);
        if (quantity <= 0) return false;

        // Decrement quantity
        set((state) => ({
          inventory: state.inventory
            .map(i =>
              i.itemId === itemId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter(i => i.quantity > 0),
        }));

        // Apply effect to player
        const playerStore = usePlayerStore.getState();
        playerStore.addActiveEffect(item.effect);

        return true;
      },

      hasItem: (itemId: string): boolean => {
        return get().inventory.some(i => i.itemId === itemId && i.quantity > 0);
      },

      getItemQuantity: (itemId: string): number => {
        const item = get().inventory.find(i => i.itemId === itemId);
        return item?.quantity || 0;
      },

      canAfford: (price: number): boolean => {
        const playerStore = usePlayerStore.getState();
        return playerStore.coins >= price;
      },

      canBuy: (itemId: string): PurchaseResult => {
        const item = getShopItemById(itemId);
        if (!item) {
          return { success: false, error: 'פריט לא נמצא' };
        }

        const playerStore = usePlayerStore.getState();

        if (item.unlockLevel && playerStore.level < item.unlockLevel) {
          return { success: false, error: `נדרש שלב ${item.unlockLevel}` };
        }

        if (playerStore.coins < item.price) {
          return { success: false, error: 'אין מספיק מטבעות' };
        }

        if (item.maxOwned) {
          const currentQty = get().getItemQuantity(itemId);
          if (currentQty >= item.maxOwned) {
            return { success: false, error: `מקסימום ${item.maxOwned}` };
          }
        }

        if ((item.category === 'cloak' || item.category === 'pet') && get().hasItem(itemId)) {
          return { success: false, error: 'כבר יש לך פריט זה' };
        }

        return { success: true };
      },

      resetShop: () => {
        set({
          inventory: [],
          equippedItems: {},
          purchaseHistory: [],
        });
      },
    }),
    {
      name: 'mathpuzzle-shop',
      partialize: (state) => ({
        inventory: state.inventory,
        equippedItems: state.equippedItems,
        purchaseHistory: state.purchaseHistory,
      }),
    }
  )
);

// Helper hooks
export function useEquippedCloak() {
  const equippedItems = useShopStore((state) => state.equippedItems);
  return equippedItems.cloak ? getShopItemById(equippedItems.cloak) : null;
}

export function useEquippedPet() {
  const equippedItems = useShopStore((state) => state.equippedItems);
  return equippedItems.pet ? getShopItemById(equippedItems.pet) : null;
}

export function useOwnedItems(category?: string) {
  const inventory = useShopStore((state) => state.inventory);
  return inventory
    .filter(i => i.quantity > 0)
    .map(i => ({
      ...i,
      item: getShopItemById(i.itemId),
    }))
    .filter(i => i.item && (!category || i.item.category === category));
}
