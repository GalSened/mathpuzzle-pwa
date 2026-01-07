/**
 * Tier Difficulty Presets
 *
 * Tiers define difficulty through depth and dependency, not chaos.
 * All operators (+, -, ×, ÷) are available in ALL tiers.
 *
 * Progression is through:
 * - Number count: 3 → 4 (5 for bosses only)
 * - Solution depth: How many dependent steps
 * - Error margin: How close traps are to target
 * - Intuitiveness: How obvious the right path is
 */

import type { Tier, TierPreset, Operator } from './types';

// All operators available in every tier
export const ALL_OPERATORS: Operator[] = ['+', '-', '×', '÷'];

// Tier difficulty presets
export const TIER_PRESETS: Record<Tier, TierPreset> = {
  // T1: Clear solution, onboarding - player learns mechanics
  T1: {
    numbers: 3,
    minDepth: 1,
    maxDepth: 1,
    traps: 0,           // No traps - focus on learning
    errorMarginMin: 3,
    errorMarginMax: 10, // Far from target - easy to avoid mistakes
    intuitiveness: 0.8, // Very intuitive - obvious solutions
  },

  // T2: Right choice matters - player must think
  T2: {
    numbers: 3,
    minDepth: 1,
    maxDepth: 2,
    traps: 1,           // One trap to watch out for
    errorMarginMin: 2,
    errorMarginMax: 5,  // Closer to target
    intuitiveness: 0.6, // Less obvious
  },

  // T3: Order matters - player must plan
  T3: {
    numbers: 3,
    minDepth: 2,
    maxDepth: 2,
    traps: 2,           // Multiple traps
    errorMarginMin: 1,
    errorMarginMax: 3,  // Near-misses more common
    intuitiveness: 0.5, // Requires thought
  },

  // T4: 4-number introduction - more possibilities
  T4: {
    numbers: 4,
    minDepth: 2,
    maxDepth: 2,
    traps: 2,
    errorMarginMin: 2,
    errorMarginMax: 5,  // Slightly relaxed for 4 numbers
    intuitiveness: 0.7, // More intuitive to ease 4-number transition
  },

  // T5: Full challenge - mastery required
  T5: {
    numbers: 4,
    minDepth: 2,
    maxDepth: 3,
    traps: 3,
    errorMarginMin: 1,
    errorMarginMax: 3,
    intuitiveness: 0.5, // Requires real skill
  },

  // Boss: Ultimate challenge - prove mastery
  Boss: {
    numbers: 5,
    minDepth: 2,
    maxDepth: 3,
    traps: 4,
    errorMarginMin: 1,
    errorMarginMax: 2,
    intuitiveness: 0.4, // Hard but fair
  },
};

/**
 * Get the tier preset for a given tier
 */
export function getTierPreset(tier: Tier): TierPreset {
  return TIER_PRESETS[tier];
}

/**
 * Get the number count for a tier (with optional boss override)
 */
export function getTierNumbers(tier: Tier, isBoss: boolean = false): 3 | 4 | 5 {
  if (isBoss && tier !== 'Boss') {
    // Boss levels can use +1 number as challenge
    const base = TIER_PRESETS[tier].numbers;
    return Math.min(base + 1, 5) as 3 | 4 | 5;
  }
  return TIER_PRESETS[tier].numbers;
}

/**
 * Number ranges per tier for puzzle generation
 */
export const TIER_NUMBER_RANGES: Record<Tier, [number, number]> = {
  T1: [1, 12],   // Simple numbers
  T2: [1, 15],   // Slightly larger
  T3: [2, 20],   // More variety
  T4: [2, 25],   // 4 numbers need more range
  T5: [3, 30],   // Full range
  Boss: [3, 50], // Boss can have big numbers
};

/**
 * Target ranges per tier
 */
export const TIER_TARGET_RANGES: Record<Tier, [number, number]> = {
  T1: [5, 30],    // Small targets
  T2: [10, 50],   // Medium
  T3: [15, 75],   // Larger
  T4: [20, 100],  // 4 numbers = bigger targets
  T5: [30, 150],  // Challenge
  Boss: [50, 200], // Boss targets
};

/**
 * Calculate stars earned based on performance
 * @param puzzlesSolved - puzzles solved without mistakes
 * @param totalAttempts - total attempts made
 * @param hintsUsed - hints consumed
 */
export function calculateStars(
  puzzlesSolved: number,
  totalAttempts: number,
  hintsUsed: number
): 0 | 1 | 2 | 3 {
  const accuracy = puzzlesSolved / totalAttempts;

  // 3 stars: >90% accuracy, no hints
  if (accuracy >= 0.9 && hintsUsed === 0) return 3;

  // 2 stars: >75% accuracy, ≤2 hints
  if (accuracy >= 0.75 && hintsUsed <= 2) return 2;

  // 1 star: completed
  if (puzzlesSolved > 0) return 1;

  return 0;
}
