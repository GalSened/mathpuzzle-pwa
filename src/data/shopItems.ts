import type { ShopItem } from '@/engine/shopTypes';

export const SHOP_ITEMS: ShopItem[] = [
  // ======================================
  // 🎽 CLOAKS (permanent equippable items)
  // ======================================
  {
    id: 'cloak-focus',
    name: 'Focus Cloak',
    nameHe: 'גלימת הריכוז',
    description: '+10% multiplication skill boost',
    descriptionHe: '+10% לכישורי כפל',
    price: 200,
    category: 'cloak',
    rarity: 'rare',
    visual: '🎭',
    effect: {
      type: 'skill_boost',
      value: 0.1,
      operator: '×',
    },
    unlockLevel: 3,
  },
  {
    id: 'cloak-scholar',
    name: "Scholar's Robe",
    nameHe: 'גלימת החכם',
    description: '+15% XP from all puzzles',
    descriptionHe: '+15% נקודות ניסיון',
    price: 300,
    category: 'cloak',
    rarity: 'epic',
    visual: '📚',
    effect: {
      type: 'xp_multiplier',
      value: 1.15,
    },
    unlockLevel: 5,
  },
  {
    id: 'cloak-lucky',
    name: 'Lucky Cape',
    nameHe: 'גלימת המזל',
    description: '+20% coins from puzzles',
    descriptionHe: '+20% מטבעות',
    price: 350,
    category: 'cloak',
    rarity: 'epic',
    visual: '🍀',
    effect: {
      type: 'coin_multiplier',
      value: 1.2,
    },
    unlockLevel: 4,
  },
  {
    id: 'cloak-division',
    name: 'Void Master Cloak',
    nameHe: 'גלימת אדון התהום',
    description: '+15% division skill boost',
    descriptionHe: '+15% לכישורי חילוק',
    price: 500,
    category: 'cloak',
    rarity: 'legendary',
    visual: '🌀',
    effect: {
      type: 'skill_boost',
      value: 0.15,
      operator: '÷',
    },
    unlockLevel: 10,
  },

  // ======================================
  // 🐾 PETS (passive helper companions)
  // ======================================
  {
    id: 'pet-owl',
    name: 'Wise Owl',
    nameHe: 'ינשוף חכם',
    description: 'Shows which operator to try first',
    descriptionHe: 'מראה איזו פעולה לנסות קודם',
    price: 250,
    category: 'pet',
    rarity: 'rare',
    visual: '🦉',
    effect: {
      type: 'hint_boost',
      value: 1, // 1 free hint per puzzle
    },
    unlockLevel: 2,
  },
  {
    id: 'pet-fox',
    name: 'Time Fox',
    nameHe: 'שועל הזמן',
    description: '+5 seconds per puzzle bonus',
    descriptionHe: '+5 שניות בונוס לכל חידה',
    price: 300,
    category: 'pet',
    rarity: 'rare',
    visual: '🦊',
    effect: {
      type: 'time_bonus',
      value: 5,
    },
    unlockLevel: 3,
  },
  {
    id: 'pet-bear',
    name: 'Shield Bear',
    nameHe: 'דוב המגן',
    description: 'One free undo per puzzle',
    descriptionHe: 'ביטול חינם אחד לכל חידה',
    price: 350,
    category: 'pet',
    rarity: 'epic',
    visual: '🐻',
    effect: {
      type: 'undo_error',
      value: 1,
    },
    unlockLevel: 4,
  },
  {
    id: 'pet-dragon',
    name: 'Math Dragon',
    nameHe: 'דרקון המספרים',
    description: '+10% all skills boost',
    descriptionHe: '+10% לכל הכישורים',
    price: 750,
    category: 'pet',
    rarity: 'legendary',
    visual: '🐉',
    effect: {
      type: 'skill_boost',
      value: 0.1,
    },
    unlockLevel: 8,
  },

  // ======================================
  // ⚡ CONSUMABLES (single use items)
  // ======================================
  {
    id: 'consumable-hint',
    name: 'Hint Scroll',
    nameHe: 'מגילת רמז',
    description: 'Get one free hint',
    descriptionHe: 'קבל רמז חינם אחד',
    price: 25,
    category: 'consumable',
    rarity: 'common',
    visual: '📜',
    effect: {
      type: 'hint_boost',
      value: 1,
      duration: 1,
    },
    maxOwned: 10,
  },
  {
    id: 'consumable-skip',
    name: 'Skip Token',
    nameHe: 'אסימון דילוג',
    description: 'Skip puzzle without penalty',
    descriptionHe: 'דלג על חידה בלי עונש',
    price: 30,
    category: 'consumable',
    rarity: 'common',
    visual: '⏭️',
    effect: {
      type: 'undo_error',
      value: 1, // Represents skip capability
      duration: 1,
    },
    maxOwned: 5,
  },
  {
    id: 'consumable-double-xp',
    name: 'Double XP Potion',
    nameHe: 'שיקוי כפל ניסיון',
    description: '2x XP for 5 puzzles',
    descriptionHe: 'כפל ניסיון ל-5 חידות',
    price: 75,
    category: 'consumable',
    rarity: 'rare',
    visual: '🧪',
    effect: {
      type: 'xp_multiplier',
      value: 2,
      duration: 5,
    },
    maxOwned: 3,
  },
  {
    id: 'consumable-double-coins',
    name: 'Gold Rush Potion',
    nameHe: 'שיקוי קרן הזהב',
    description: '2x coins for 5 puzzles',
    descriptionHe: 'כפל מטבעות ל-5 חידות',
    price: 75,
    category: 'consumable',
    rarity: 'rare',
    visual: '💰',
    effect: {
      type: 'coin_multiplier',
      value: 2,
      duration: 5,
    },
    maxOwned: 3,
  },

  // ======================================
  // 🚀 BOOSTS (temporary power-ups)
  // ======================================
  {
    id: 'boost-addition',
    name: 'Addition Mastery',
    nameHe: 'שליטה בחיבור',
    description: '+25% addition skill for 10 puzzles',
    descriptionHe: '+25% לחיבור ל-10 חידות',
    price: 50,
    category: 'boost',
    rarity: 'common',
    visual: '➕',
    effect: {
      type: 'skill_boost',
      value: 0.25,
      operator: '+',
      duration: 10,
    },
    maxOwned: 5,
  },
  {
    id: 'boost-subtraction',
    name: 'Subtraction Mastery',
    nameHe: 'שליטה בחיסור',
    description: '+25% subtraction skill for 10 puzzles',
    descriptionHe: '+25% לחיסור ל-10 חידות',
    price: 50,
    category: 'boost',
    rarity: 'common',
    visual: '➖',
    effect: {
      type: 'skill_boost',
      value: 0.25,
      operator: '-',
      duration: 10,
    },
    maxOwned: 5,
  },
  {
    id: 'boost-multiplication',
    name: 'Multiplication Mastery',
    nameHe: 'שליטה בכפל',
    description: '+25% multiplication skill for 10 puzzles',
    descriptionHe: '+25% לכפל ל-10 חידות',
    price: 60,
    category: 'boost',
    rarity: 'common',
    visual: '✖️',
    effect: {
      type: 'skill_boost',
      value: 0.25,
      operator: '×',
      duration: 10,
    },
    maxOwned: 5,
    unlockLevel: 6,
  },
  {
    id: 'boost-division',
    name: 'Division Mastery',
    nameHe: 'שליטה בחילוק',
    description: '+25% division skill for 10 puzzles',
    descriptionHe: '+25% לחילוק ל-10 חידות',
    price: 70,
    category: 'boost',
    rarity: 'rare',
    visual: '➗',
    effect: {
      type: 'skill_boost',
      value: 0.25,
      operator: '÷',
      duration: 10,
    },
    maxOwned: 5,
    unlockLevel: 10,
  },
];

// Helper functions
export function getShopItemById(itemId: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === itemId);
}

export function getShopItemsByCategory(category: string): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category);
}

export function getAvailableItems(playerLevel: number): ShopItem[] {
  return SHOP_ITEMS.filter(item => !item.unlockLevel || playerLevel >= item.unlockLevel);
}

export function getCloaks(): ShopItem[] {
  return getShopItemsByCategory('cloak');
}

export function getPets(): ShopItem[] {
  return getShopItemsByCategory('pet');
}

export function getConsumables(): ShopItem[] {
  return getShopItemsByCategory('consumable');
}

export function getBoosts(): ShopItem[] {
  return getShopItemsByCategory('boost');
}
