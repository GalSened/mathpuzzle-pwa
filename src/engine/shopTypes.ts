import type { Operator } from './types';

// Item categories
export type ItemCategory = 'cloak' | 'pet' | 'consumable' | 'boost';

// Item effect types
export type ItemEffectType =
  | 'skill_boost'      // Boost specific operator skill
  | 'hint_boost'       // Free hints
  | 'xp_multiplier'    // XP boost
  | 'coin_multiplier'  // Coin boost
  | 'undo_error'       // Undo mistakes
  | 'time_bonus';      // Extra time

// Item rarity
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Shop item interface
export interface ShopItem {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  price: number;
  category: ItemCategory;
  rarity: ItemRarity;
  visual: string;           // Emoji or icon name
  effect: ShopItemEffect;
  unlockLevel?: number;     // Minimum level to purchase
  maxOwned?: number;        // Max copies in inventory (for consumables)
}

// Item effect with duration and value
export interface ShopItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number;        // Number of puzzles (undefined = permanent)
  operator?: Operator;      // For operator-specific effects
}

// Inventory item (owned item instance)
export interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasedAt: number;
}

// Equipment slots
export type EquipmentSlot = 'cloak' | 'pet';

// Equipped items state
export type EquippedItems = Partial<Record<EquipmentSlot, string>>;

// Purchase result
export interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: number;
}
