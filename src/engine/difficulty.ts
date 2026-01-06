import { DifficultyProfile, InsightType } from './types';

export const DIFFICULTY_PRESETS: Record<1 | 2 | 3 | 4 | 5, DifficultyProfile> = {
  1: {
    level: 1,
    numberCount: 2,
    numberRange: [1, 10],
    targetRange: [5, 20],
    requiresParentheses: false,
    operatorVariety: 2,
    trapCount: 0,
    insightRequired: 'basic_arithmetic'
  },
  2: {
    level: 2,
    numberCount: 3,
    numberRange: [1, 12],
    targetRange: [10, 36],
    requiresParentheses: false,
    operatorVariety: 3,
    trapCount: 1,
    insightRequired: 'basic_arithmetic'
  },
  3: {
    level: 3,
    numberCount: 3,
    numberRange: [2, 15],
    targetRange: [15, 60],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 2,
    insightRequired: 'order_of_operations'
  },
  4: {
    level: 4,
    numberCount: 4,
    numberRange: [2, 20],
    targetRange: [30, 120],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 3,
    insightRequired: 'factoring'
  },
  5: {
    level: 5,
    numberCount: 5,
    numberRange: [2, 25],
    targetRange: [50, 300],
    requiresParentheses: true,
    operatorVariety: 4,
    trapCount: 4,
    insightRequired: 'working_backwards'
  }
};

export const DIFFICULTY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Tutorial',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert'
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
