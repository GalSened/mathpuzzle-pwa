import type { Operator, PlayerState, AdaptiveConfig, OperatorSkill } from './types';

// Skill thresholds for unlocking operators
const SKILL_THRESHOLDS: Record<Operator, number> = {
  '+': 0.0,  // Always available
  '-': 0.3,  // Unlock at 30% skill
  '×': 0.4,  // Unlock at 40% skill
  '÷': 0.6,  // Unlock at 60% skill
};

// Calculate weights for operator selection
// Lower skill = higher weight (practice weaker areas more)
function calculateOperatorWeights(skill: OperatorSkill): Record<Operator, number> {
  const weights: Record<Operator, number> = {
    '+': 0,
    '-': 0,
    '×': 0,
    '÷': 0,
  };

  const operators: Operator[] = ['+', '-', '×', '÷'];

  for (const op of operators) {
    // Invert skill to weight: low skill = high weight
    // Use exponential to emphasize weaker skills
    const invertedSkill = 1 - skill[op];
    weights[op] = Math.pow(invertedSkill + 0.5, 2);
  }

  // Normalize weights to sum to 1
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const op of operators) {
    weights[op] = weights[op] / total;
  }

  return weights;
}

// Get allowed operators based on player skill
function getAllowedOperators(skill: OperatorSkill): Operator[] {
  const ops: Operator[] = [];

  if (skill['+'] >= SKILL_THRESHOLDS['+']) ops.push('+');
  if (skill['-'] >= SKILL_THRESHOLDS['-']) ops.push('-');
  if (skill['×'] >= SKILL_THRESHOLDS['×']) ops.push('×');
  if (skill['÷'] >= SKILL_THRESHOLDS['÷']) ops.push('÷');

  // Always allow at least addition
  if (ops.length === 0) ops.push('+');

  return ops;
}

// Calculate puzzle depth (number of operations) based on level
function calculateDepth(level: number): number {
  // Start with 2 operations, max out at 5
  return Math.min(5, 2 + Math.floor(level / 3));
}

// Calculate max number based on level and skills
function calculateMaxNumber(level: number, skill: OperatorSkill): number {
  const baseMax = 10 + level * 5;

  // If division skill is high, allow larger numbers
  const divisionBonus = skill['÷'] > 0.7 ? 20 : 0;

  return Math.min(200, baseMax + divisionBonus);
}

// Main adaptive config generator
export function adaptiveConfig(player: PlayerState): AdaptiveConfig {
  const allowedOps = getAllowedOperators(player.skill);
  const operatorWeights = calculateOperatorWeights(player.skill);

  return {
    maxNumber: calculateMaxNumber(player.level, player.skill),
    allowedOps,
    depth: calculateDepth(player.level),
    operatorWeights,
  };
}

// Select an operator based on weights (for puzzle generation)
export function selectWeightedOperator(weights: Record<Operator, number>, allowedOps: Operator[]): Operator {
  // Filter weights to only allowed operators
  const filteredWeights: [Operator, number][] = allowedOps.map(op => [op, weights[op]]);

  // Normalize
  const total = filteredWeights.reduce((acc, [, w]) => acc + w, 0);
  const normalized = filteredWeights.map(([op, w]) => [op, w / total] as [Operator, number]);

  // Random selection based on weights
  const random = Math.random();
  let cumulative = 0;

  for (const [op, weight] of normalized) {
    cumulative += weight;
    if (random <= cumulative) {
      return op;
    }
  }

  // Fallback
  return allowedOps[0];
}

// Calculate XP reward based on puzzle difficulty and player performance
export function calculateXPReward(
  difficulty: number,
  hintsUsed: number,
  timeSpent: number,
  estimatedTime: number
): number {
  const baseXP = 10 + difficulty * 5;

  // Bonus multipliers
  const noHintsBonus = hintsUsed === 0 ? 1.2 : 1.0;
  const fastSolveBonus = timeSpent < estimatedTime * 0.5 ? 1.3 : 1.0;

  // Penalty for too many hints
  const hintPenalty = Math.max(0.5, 1 - hintsUsed * 0.1);

  return Math.floor(baseXP * noHintsBonus * fastSolveBonus * hintPenalty);
}

// Calculate coin reward based on performance
export function calculateCoinReward(
  difficulty: number,
  hintsUsed: number,
  streak: number
): number {
  const baseCoins = 5 + difficulty * 2;

  // Bonus for no hints
  const noHintsBonus = hintsUsed === 0 ? 5 : 0;

  // Streak bonus (every 5 puzzles)
  const streakBonus = streak > 0 && streak % 5 === 0 ? 15 : 0;

  return baseCoins + noHintsBonus + streakBonus;
}

// Determine which operators were used in a puzzle solution
export function extractUsedOperators(notation: string): Operator[] {
  const ops: Operator[] = [];

  if (notation.includes('+')) ops.push('+');
  if (notation.includes('-') || notation.includes('−')) ops.push('-');
  if (notation.includes('×') || notation.includes('*')) ops.push('×');
  if (notation.includes('÷') || notation.includes('/')) ops.push('÷');

  return ops;
}
