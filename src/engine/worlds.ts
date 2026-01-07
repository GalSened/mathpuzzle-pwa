/**
 * World and Level Configuration
 *
 * 5 Worlds × 6 Levels = 30 Total Levels
 *
 * Key Design Principles:
 * - All operators available from start
 * - 3→4 numbers is the progression axis (5 for bosses only)
 * - Difficulty via tiers (T1-T5), not operator unlocking
 * - No skipping worlds, no buying progress
 */

import type { WorldConfig, WorldId, LevelConfig } from './types';

// ============== World 1: Training Grounds ==============
const TRAINING_LEVELS: LevelConfig[] = [
  {
    level: 1,
    worldLevel: 1,
    worldId: 'training',
    tier: 'T1',
    numbers: 3,
    name: 'First Steps',
    nameHe: 'צעדים ראשונים',
    puzzlesRequired: 8,
    isBoss: false,
  },
  {
    level: 2,
    worldLevel: 2,
    worldId: 'training',
    tier: 'T1',
    numbers: 3,
    name: 'Building Blocks',
    nameHe: 'אבני בניין',
    puzzlesRequired: 8,
    isBoss: false,
  },
  {
    level: 3,
    worldLevel: 3,
    worldId: 'training',
    tier: 'T1',
    numbers: 3,
    name: 'Mix It Up',
    nameHe: 'לערבב הכל',
    puzzlesRequired: 8,
    isBoss: false,
  },
  {
    level: 4,
    worldLevel: 4,
    worldId: 'training',
    tier: 'T2',
    numbers: 3,
    name: 'Choices Matter',
    nameHe: 'הבחירות חשובות',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 5,
    worldLevel: 5,
    worldId: 'training',
    tier: 'T2',
    numbers: 3,
    name: 'Watch Your Step',
    nameHe: 'זהירות במעבר',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 6,
    worldLevel: 6,
    worldId: 'training',
    tier: 'Boss',
    numbers: 3,
    name: 'Training Master',
    nameHe: 'אדון האימונים',
    puzzlesRequired: 5,
    isBoss: true,
  },
];

// ============== World 2: The Factory ==============
const FACTORY_LEVELS: LevelConfig[] = [
  {
    level: 7,
    worldLevel: 1,
    worldId: 'factory',
    tier: 'T2',
    numbers: 3,
    name: 'Assembly Line',
    nameHe: 'קו ההרכבה',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 8,
    worldLevel: 2,
    worldId: 'factory',
    tier: 'T2',
    numbers: 3,
    name: 'Precision Work',
    nameHe: 'עבודה מדויקת',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 9,
    worldLevel: 3,
    worldId: 'factory',
    tier: 'T3',
    numbers: 3,
    name: 'Order Matters',
    nameHe: 'הסדר קובע',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 10,
    worldLevel: 4,
    worldId: 'factory',
    tier: 'T3',
    numbers: 3,
    name: 'No Going Back',
    nameHe: 'אין דרך חזרה',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 11,
    worldLevel: 5,
    worldId: 'factory',
    tier: 'T3',
    numbers: 3,
    name: 'Thin Margin',
    nameHe: 'שולי בטחון דקים',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 12,
    worldLevel: 6,
    worldId: 'factory',
    tier: 'Boss',
    numbers: 4,
    name: 'Factory Foreman',
    nameHe: 'מנהל המפעל',
    puzzlesRequired: 5,
    isBoss: true,
  },
];

// ============== World 3: The Lab ==============
const LAB_LEVELS: LevelConfig[] = [
  {
    level: 13,
    worldLevel: 1,
    worldId: 'lab',
    tier: 'T3',
    numbers: 3,
    name: 'Full Dependency',
    nameHe: 'תלות מלאה',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 14,
    worldLevel: 2,
    worldId: 'lab',
    tier: 'T3',
    numbers: 3,
    name: 'Low Margin',
    nameHe: 'שוליים צרים',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 15,
    worldLevel: 3,
    worldId: 'lab',
    tier: 'T3',
    numbers: 3,
    name: 'Division Focus',
    nameHe: 'מיקוד בחילוק',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 16,
    worldLevel: 4,
    worldId: 'lab',
    tier: 'T4',
    numbers: 4,
    name: 'Four Elements',
    nameHe: 'ארבעה יסודות',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 17,
    worldLevel: 5,
    worldId: 'lab',
    tier: 'T4',
    numbers: 4,
    name: 'Flow State',
    nameHe: 'זרימה מושלמת',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 18,
    worldLevel: 6,
    worldId: 'lab',
    tier: 'Boss',
    numbers: 4,
    name: 'Lab Director',
    nameHe: 'מנהל המעבדה',
    puzzlesRequired: 5,
    isBoss: true,
  },
];

// ============== World 4: The City ==============
const CITY_LEVELS: LevelConfig[] = [
  {
    level: 19,
    worldLevel: 1,
    worldId: 'city',
    tier: 'T4',
    numbers: 4,
    name: 'Natural Path',
    nameHe: 'מסלול טבעי',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 20,
    worldLevel: 2,
    worldId: 'city',
    tier: 'T4',
    numbers: 4,
    name: 'Deep Dive',
    nameHe: 'צלילה לעומק',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 21,
    worldLevel: 3,
    worldId: 'city',
    tier: 'T4',
    numbers: 4,
    name: 'Critical Order',
    nameHe: 'סדר קריטי',
    puzzlesRequired: 10,
    isBoss: false,
  },
  {
    level: 22,
    worldLevel: 4,
    worldId: 'city',
    tier: 'T5',
    numbers: 4,
    name: 'Thin Solution',
    nameHe: 'פתרון יחיד',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 23,
    worldLevel: 5,
    worldId: 'city',
    tier: 'T5',
    numbers: 4,
    name: 'Hidden Path',
    nameHe: 'הדרך הנסתרת',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 24,
    worldLevel: 6,
    worldId: 'city',
    tier: 'Boss',
    numbers: 5,
    name: 'City Mayor',
    nameHe: 'ראש העיר',
    puzzlesRequired: 5,
    isBoss: true,
  },
];

// ============== World 5: The Core ==============
const CORE_LEVELS: LevelConfig[] = [
  {
    level: 25,
    worldLevel: 1,
    worldId: 'core',
    tier: 'T5',
    numbers: 4,
    name: 'High Depth',
    nameHe: 'עומק מקסימלי',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 26,
    worldLevel: 2,
    worldId: 'core',
    tier: 'T5',
    numbers: 4,
    name: 'Critical Chain',
    nameHe: 'שרשרת קריטית',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 27,
    worldLevel: 3,
    worldId: 'core',
    tier: 'T5',
    numbers: 4,
    name: 'No Margin',
    nameHe: 'בלי טעויות',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 28,
    worldLevel: 4,
    worldId: 'core',
    tier: 'T5',
    numbers: 4,
    name: 'Pure Logic',
    nameHe: 'לוגיקה טהורה',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 29,
    worldLevel: 5,
    worldId: 'core',
    tier: 'T5',
    numbers: 4,
    name: 'Edge of Mastery',
    nameHe: 'גבול השליטה',
    puzzlesRequired: 12,
    isBoss: false,
  },
  {
    level: 30,
    worldLevel: 6,
    worldId: 'core',
    tier: 'Boss',
    numbers: 5,
    name: 'The Architect',
    nameHe: 'האדריכל',
    puzzlesRequired: 5,
    isBoss: true,
  },
];

// ============== World Configurations ==============

export const WORLDS: WorldConfig[] = [
  {
    id: 'training',
    name: 'Training Grounds',
    nameHe: 'מגרש האימונים',
    theme: {
      background: 'from-emerald-900 to-green-800',
      accent: 'emerald',
      glow: 'rgba(16, 185, 129, 0.5)',
      icon: '🌿',
    },
    levels: TRAINING_LEVELS,
    unlockCondition: 'start',
    bossName: 'Training Master',
    bossNameHe: 'אדון האימונים',
  },
  {
    id: 'factory',
    name: 'The Factory',
    nameHe: 'המפעל',
    theme: {
      background: 'from-orange-900 to-amber-800',
      accent: 'orange',
      glow: 'rgba(249, 115, 22, 0.5)',
      icon: '🏭',
    },
    levels: FACTORY_LEVELS,
    unlockCondition: 'training',
    bossName: 'Factory Foreman',
    bossNameHe: 'מנהל המפעל',
  },
  {
    id: 'lab',
    name: 'The Lab',
    nameHe: 'המעבדה',
    theme: {
      background: 'from-purple-900 to-violet-800',
      accent: 'purple',
      glow: 'rgba(168, 85, 247, 0.5)',
      icon: '🔬',
    },
    levels: LAB_LEVELS,
    unlockCondition: 'factory',
    bossName: 'Lab Director',
    bossNameHe: 'מנהל המעבדה',
  },
  {
    id: 'city',
    name: 'The City',
    nameHe: 'העיר',
    theme: {
      background: 'from-blue-900 to-cyan-800',
      accent: 'blue',
      glow: 'rgba(59, 130, 246, 0.5)',
      icon: '🏙️',
    },
    levels: CITY_LEVELS,
    unlockCondition: 'lab',
    bossName: 'City Mayor',
    bossNameHe: 'ראש העיר',
  },
  {
    id: 'core',
    name: 'The Core',
    nameHe: 'הליבה',
    theme: {
      background: 'from-red-900 to-rose-800',
      accent: 'red',
      glow: 'rgba(239, 68, 68, 0.5)',
      icon: '💎',
    },
    levels: CORE_LEVELS,
    unlockCondition: 'city',
    bossName: 'The Architect',
    bossNameHe: 'האדריכל',
  },
];

// ============== Utility Functions ==============

/**
 * Get world by ID
 */
export function getWorld(worldId: WorldId): WorldConfig {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) throw new Error(`World not found: ${worldId}`);
  return world;
}

/**
 * Get level by global level number (1-30)
 */
export function getLevel(levelNumber: number): LevelConfig {
  for (const world of WORLDS) {
    const level = world.levels.find((l) => l.level === levelNumber);
    if (level) return level;
  }
  throw new Error(`Level not found: ${levelNumber}`);
}

/**
 * Get all levels for a world
 */
export function getWorldLevels(worldId: WorldId): LevelConfig[] {
  return getWorld(worldId).levels;
}

/**
 * Get the world that a level belongs to
 */
export function getLevelWorld(levelNumber: number): WorldConfig {
  const level = getLevel(levelNumber);
  return getWorld(level.worldId);
}

/**
 * Get next world (or null if last)
 */
export function getNextWorld(worldId: WorldId): WorldConfig | null {
  const index = WORLDS.findIndex((w) => w.id === worldId);
  if (index === -1 || index === WORLDS.length - 1) return null;
  return WORLDS[index + 1];
}

/**
 * Get previous world (or null if first)
 */
export function getPreviousWorld(worldId: WorldId): WorldConfig | null {
  const index = WORLDS.findIndex((w) => w.id === worldId);
  if (index <= 0) return null;
  return WORLDS[index - 1];
}

/**
 * Check if a world can be unlocked based on previous world completion
 */
export function canUnlockWorld(worldId: WorldId, completedWorlds: WorldId[]): boolean {
  const world = getWorld(worldId);
  if (world.unlockCondition === 'start') return true;
  return completedWorlds.includes(world.unlockCondition);
}

/**
 * Get total number of levels
 */
export const TOTAL_LEVELS = WORLDS.reduce((sum, world) => sum + world.levels.length, 0);

/**
 * Get total number of worlds
 */
export const TOTAL_WORLDS = WORLDS.length;
