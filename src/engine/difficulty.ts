import { DifficultyProfile, InsightType, Tier } from './types';
import { TIER_PRESETS, TIER_NUMBER_RANGES, TIER_TARGET_RANGES } from './tiers';

/**
 * Multi-Axis Difficulty System
 *
 * Core Principle: Difficulty ≠ Number Count
 * Real difficulty comes from:
 * - Solution depth (operation dependencies)
 * - Error margin (near-miss traps)
 * - Intuitiveness (human-readable solutions)
 * - Number count (used sparingly, 5 only for bosses)
 *
 * Level Philosophy:
 * 1. כניסה חלקה (Smooth Entry) - Clear path, high intuitiveness
 * 2. בחירה נכונה (Right Choice) - Multiple options, one works
 * 3. תלות בין פעולות (Operation Dependency) - Order matters!
 * 4. מעבר רך (Soft Transition) - 4 numbers, natural chain
 * 5. 4 אמיתיים (Real 4s) - Full 4-number challenge
 */

export const DIFFICULTY_PRESETS: Record<1 | 2 | 3 | 4 | 5, DifficultyProfile> = {
  // Level 1: כניסה חלקה - "I get it"
  // 3 numbers, shallow depth, forgiving (high error margin), highly intuitive
  1: {
    level: 1,
    numberCount: 3,
    numberRange: [1, 10],
    targetRange: [5, 30],
    requiresParentheses: false,
    operatorVariety: 2,
    trapCount: 0,
    insightRequired: 'basic_arithmetic',
    targets: {
      minDepth: 1,
      maxDepth: 1,
      minErrorMargin: 3,      // Forgiving - many near-misses OK
      maxErrorMargin: 10,
      minIntuitiveness: 0.8   // Must be obvious
    }
  },
  // Level 2: בחירה נכונה - "Let me think"
  // 3 numbers, can have depth 2, medium error margin, still intuitive
  2: {
    level: 2,
    numberCount: 3,
    numberRange: [1, 12],
    targetRange: [10, 36],
    requiresParentheses: false,
    operatorVariety: 3,
    trapCount: 1,
    insightRequired: 'basic_arithmetic',
    targets: {
      minDepth: 1,
      maxDepth: 2,
      minErrorMargin: 2,      // Some traps
      maxErrorMargin: 5,
      minIntuitiveness: 0.6   // Reasonably clear
    }
  },
  // Level 3: תלות בין פעולות - "Order matters!"
  // 3 numbers, must have depth 2, low error margin (tricky), medium intuitive
  3: {
    level: 3,
    numberCount: 3,
    numberRange: [2, 15],
    targetRange: [15, 60],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 2,
    insightRequired: 'order_of_operations',
    targets: {
      minDepth: 2,
      maxDepth: 2,
      minErrorMargin: 1,      // Tight - fewer easy outs
      maxErrorMargin: 3,
      minIntuitiveness: 0.5   // Can be less obvious
    }
  },
  // Level 4: מעבר רך - "More steps, same vibe"
  // 4 numbers, depth 2, medium error margin, HIGH intuitiveness (gentle 4-number intro)
  4: {
    level: 4,
    numberCount: 4,
    numberRange: [2, 20],
    targetRange: [20, 100],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 2,
    insightRequired: 'factoring',
    targets: {
      minDepth: 2,
      maxDepth: 2,
      minErrorMargin: 2,      // Some breathing room
      maxErrorMargin: 5,
      minIntuitiveness: 0.7   // Must still feel natural!
    }
  },
  // Level 5: 4 אמיתיים - "Real challenge"
  // 4 numbers, can reach depth 3, low error margin, medium intuitive
  5: {
    level: 5,
    numberCount: 4,           // Still 4! No 5-number in normal play
    numberRange: [2, 25],
    targetRange: [30, 150],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 3,
    insightRequired: 'working_backwards',
    targets: {
      minDepth: 2,
      maxDepth: 3,
      minErrorMargin: 1,      // Tight margins
      maxErrorMargin: 3,
      minIntuitiveness: 0.5   // Can require insight
    }
  }
};

/**
 * Boss Mode Preset - 5 numbers, reserved for boss battles only
 * This should NEVER be used in normal progression
 */
export const BOSS_DIFFICULTY_PRESET: DifficultyProfile = {
  level: 5,
  numberCount: 5,            // 5 numbers ONLY for bosses
  numberRange: [2, 25],
  targetRange: [50, 200],
  requiresParentheses: true,
  operatorVariety: 4,
  trapCount: 4,
  insightRequired: 'working_backwards',
  targets: {
    minDepth: 2,
    maxDepth: 3,
    minErrorMargin: 1,
    maxErrorMargin: 2,
    minIntuitiveness: 0.4    // Can be tricky
  }
};

export const INSIGHT_LABELS: Record<InsightType, string> = {
  'basic_arithmetic': 'Basic Math',
  'order_of_operations': 'Order of Operations',
  'factoring': 'Finding Factors',
  'distribution': 'Distribution',
  'elimination': 'Process of Elimination',
  'working_backwards': 'Working Backwards'
};

export interface PerformanceMetrics {
  recentSolveRate: number;
  averageSolveTime: number;
  averageHintsUsed: number;
  recentStreak: number;
}

export function adjustDifficulty(
  currentLevel: 1 | 2 | 3 | 4 | 5,
  metrics: PerformanceMetrics
): 1 | 2 | 3 | 4 | 5 {
  if (
    metrics.recentSolveRate > 0.85 &&
    metrics.averageSolveTime < 20 &&
    metrics.averageHintsUsed < 0.5 &&
    metrics.recentStreak >= 3
  ) {
    return Math.min(5, currentLevel + 1) as 1 | 2 | 3 | 4 | 5;
  }

  if (
    metrics.recentSolveRate < 0.4 ||
    metrics.averageHintsUsed > 2
  ) {
    return Math.max(1, currentLevel - 1) as 1 | 2 | 3 | 4 | 5;
  }

  return currentLevel;
}

export function getExpectedSolveTime(level: 1 | 2 | 3 | 4 | 5): {
  fast: number;
  average: number;
  slow: number;
} {
  const times = {
    1: { fast: 5, average: 15, slow: 30 },
    2: { fast: 10, average: 25, slow: 45 },
    3: { fast: 20, average: 45, slow: 90 },
    4: { fast: 30, average: 75, slow: 150 },
    5: { fast: 45, average: 120, slow: 240 }
  };

  return times[level];
}

// ============== V3: Tier-Based Difficulty ==============

/**
 * Maps a Tier to a DifficultyProfile
 * Used by the V3 World/Level system where all operators are always available
 * and difficulty is controlled by Tier presets
 */
export function getTierDifficultyProfile(tier: Tier): DifficultyProfile {
  const preset = TIER_PRESETS[tier];
  const numberRange = TIER_NUMBER_RANGES[tier];
  const targetRange = TIER_TARGET_RANGES[tier];

  // Map tier to difficulty level (1-5)
  const levelMap: Record<Tier, 1 | 2 | 3 | 4 | 5> = {
    T1: 1,
    T2: 2,
    T3: 3,
    T4: 4,
    T5: 5,
    Boss: 5,
  };

  // Map tier to insight required
  const insightMap: Record<Tier, InsightType> = {
    T1: 'basic_arithmetic',
    T2: 'basic_arithmetic',
    T3: 'order_of_operations',
    T4: 'factoring',
    T5: 'working_backwards',
    Boss: 'working_backwards',
  };

  return {
    level: levelMap[tier],
    numberCount: preset.numbers,
    numberRange,
    targetRange,
    requiresParentheses: preset.maxDepth > 1,
    operatorVariety: 4, // All 4 operators always available in V3
    trapCount: preset.traps,
    insightRequired: insightMap[tier],
    targets: {
      minDepth: preset.minDepth,
      maxDepth: preset.maxDepth,
      minErrorMargin: preset.errorMarginMin,
      maxErrorMargin: preset.errorMarginMax,
      minIntuitiveness: preset.intuitiveness,
    },
  };
}
