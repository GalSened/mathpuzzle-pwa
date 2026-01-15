export type Operator = '+' | '-' | '×' | '÷';

export type PuzzleArchetype =
  | 'decision' | 'order' | 'trap' | 'chain' | 'constraint' | 'precision';

export interface ExpressionNode {
  type: 'number' | 'operator';
  value: number | Operator;
  left?: ExpressionNode;
  right?: ExpressionNode;
}

export interface EvaluationStep {
  left: number;
  operator: Operator;
  right: number;
  result: number;
  notation: string;
}

export interface Expression {
  notation: string;
  tree: ExpressionNode;
  result: number;
  steps: EvaluationStep[];
  complexity: number;
}

export interface Puzzle {
  id: string;
  numbers: number[];
  availableOperators: Operator[];
  target: number;
  constraints: PuzzleConstraints;
  archetype: PuzzleArchetype;
  difficulty: DifficultyProfile;
  signature: string;
  solution: Expression;
  traps: Expression[];
  alternativeSolutions: Expression[];
  metadata: {
    generatedAt: number;
    validatedAt: number;
    estimatedSolveTime: number;
  };
}

export interface PuzzleConstraints {
  mustUseAllNumbers: boolean;
  allowParentheses: boolean;
  allowedOperators: Operator[];
  maxSteps: number;
  allowNegativeIntermediates: boolean;
  allowFractions: boolean;
}

export interface DifficultyProfile {
  level: 1 | 2 | 3 | 4 | 5;
  numberCount: number;
  numberRange: [number, number];
  targetRange: [number, number];
  requiresParentheses: boolean;
  operatorVariety: number;
  trapCount: number;
  insightRequired: InsightType;
  // Multi-axis target metrics for sophisticated difficulty tuning
  targets?: DifficultyTargets;
}

export type InsightType =
  | 'basic_arithmetic'
  | 'order_of_operations'
  | 'factoring'
  | 'distribution'
  | 'elimination'
  | 'working_backwards';

// Multi-axis difficulty metrics for sophisticated puzzle evaluation
export interface DifficultyMetrics {
  solutionDepth: number;      // 1-3: How deep is the expression tree dependency chain
  errorMargin: number;        // 0-5: Count of near-miss solutions (within ±3 of target)
  intuitiveness: number;      // 0.0-1.0: Pattern readability score (round numbers, clean factors)
}

// Target ranges for each difficulty level
export interface DifficultyTargets {
  minDepth: number;
  maxDepth: number;
  minErrorMargin: number;
  maxErrorMargin: number;
  minIntuitiveness: number;
}

export interface PuzzleAttempt {
  expression: string;
  result: number;
  timestamp: number;
  isCorrect: boolean;
}

export interface PuzzleResult {
  puzzleId: string;
  solved: boolean;
  timeSpent: number;
  attempts: PuzzleAttempt[];
  hintsUsed: number;
  finalExpression?: string;
}

export interface Hint {
  level: 1 | 2 | 3 | 4;
  type: 'directional' | 'structural' | 'specific' | 'partial_reveal';
  message: string;
  cost: number;
}

export interface AttemptFeedback {
  resultDelta: number;
  direction: 'too_high' | 'too_low' | 'correct';
  structureMatch: number;
  operatorMatch: number;
  partialInsights: string[];
  encouragement: string;
}

// ============== Phase 2: RPG Game Types ==============

// Per-operator skill tracking (0.0 to 1.0)
export interface OperatorSkill {
  '+': number;
  '-': number;
  '×': number;
  '÷': number;
}

// Coin earning events
export type CoinSource = 'puzzle' | 'streak' | 'daily' | 'boss' | 'achievement';

// Item effect types
export type ItemEffectType =
  | 'skill_boost'
  | 'hint_boost'
  | 'xp_multiplier'
  | 'coin_multiplier'
  | 'undo_error'
  | 'time_bonus';

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number; // Number of puzzles, undefined = permanent
  operator?: Operator; // For operator-specific effects
}

export type ItemCategory = 'cloak' | 'pet' | 'consumable' | 'boost';

export interface ShopItem {
  id: string;
  name: string;
  nameHe: string;
  price: number;
  category: ItemCategory;
  visual: string; // Emoji or image path
  effect: ItemEffect;
  description: string;
  descriptionHe: string;
  unlockLevel?: number;
}

// Extended player state
export interface PlayerState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  skill: OperatorSkill;
  coins: number;
  inventory: string[];
  equippedItems: {
    cloak?: string;
    pet?: string;
  };
  activeEffects: ItemEffect[];
  dailyStreak: number;
  lastPlayedDate: string | null;
  totalPuzzlesSolved: number;
}

/** @deprecated V2 legacy - not used in V3 world system */
export interface ZoneTheme {
  background: string; // Tailwind gradient classes
  accent: string; // Tailwind color class
  pattern: string; // CSS pattern identifier
}

/** @deprecated V2 legacy - use WorldConfig from worlds.ts instead */
export interface Zone {
  id: string;
  name: string;
  nameHe: string;
  ops: Operator[];
  unlockLevel: number;
  theme: ZoneTheme;
  bossEvery: number;
  description: string;
  descriptionHe: string;
}

/** @deprecated V1 legacy - use progressStore instead */
export interface ZoneProgress {
  solved: number;
  total: number;
  bossDefeated: boolean;
}

// ============== V2 Progress Tracking ==============

// Constants for progress system
export const MASTERY_THRESHOLD = 0.8;   // 80% skill required for mastery
export const PUZZLES_PER_LEVEL = 5;     // 5 puzzles = 1 level (boss cycle)

// Level status within a zone
export type LevelStatus = 'locked' | 'in_progress' | 'completed';

// Zone mastery status
export type ZoneStatus = 'locked' | 'in_progress' | 'mastered';

// Progress tracking for a single level (5 puzzles)
export interface LevelProgress {
  levelNumber: number;           // 1, 2, 3...
  puzzlesSolved: number;         // 0-5 within this level
  status: LevelStatus;
  completedAt?: number;          // Timestamp when level was completed
  bossDefeatedAt?: number;       // Timestamp when boss was defeated
}

/** @deprecated V2 legacy - use progressStore instead */
export interface ZoneProgressV2 {
  zoneId: string;
  status: ZoneStatus;
  currentLevel: number;                    // Currently active level number
  levels: Record<number, LevelProgress>;   // All levels in this zone
  totalPuzzlesSolved: number;              // Cumulative puzzles solved in zone
  totalBossesDefeated: number;             // Cumulative bosses defeated in zone
  masteredAt?: number;                     // Timestamp when zone was mastered
  unlockedAt?: number;                     // Timestamp when zone was unlocked
}

// Adaptive config for puzzle generation
export interface AdaptiveConfig {
  maxNumber: number;
  allowedOps: Operator[];
  depth: number;
  operatorWeights: Record<Operator, number>;
}

// ============== V3: World/Level System ==============

// Difficulty tiers (replaces zone-based progression)
export type Tier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'Boss';

// World identifiers
export type WorldId = 'training' | 'factory' | 'lab' | 'city' | 'core';

// World progress status
export type WorldStatus = 'locked' | 'in_progress' | 'completed';

// Level status (V3)
export type LevelStatusV3 = 'locked' | 'in_progress' | 'completed';

// Theme configuration for a world
export interface WorldTheme {
  background: string;     // Tailwind gradient classes
  accent: string;         // Tailwind color class
  glow: string;           // Glow color for effects
  icon: string;           // World icon emoji
}

// Level configuration (static definition)
export interface LevelConfig {
  level: number;           // 1-30 global level number
  worldLevel: number;      // 1-6 within world
  worldId: WorldId;
  tier: Tier;
  numbers: 3 | 4 | 5;
  nameHe: string;
  name: string;
  puzzlesRequired: number; // 8-12 puzzles to complete
  isBoss: boolean;
}

// World configuration (static definition)
export interface WorldConfig {
  id: WorldId;
  name: string;
  nameHe: string;
  theme: WorldTheme;
  levels: LevelConfig[];
  unlockCondition: 'start' | WorldId; // which world must be completed
  bossName: string;
  bossNameHe: string;
}

// Level progress tracking (V3)
export interface LevelProgressV3 {
  levelId: number;         // Global level number (1-30)
  puzzlesSolved: number;
  puzzlesRequired: number;
  status: LevelStatusV3;
  stars: number;           // 0-3 based on performance
  completedAt?: number;
  bossDefeatedAt?: number;
}

// World progress tracking (V3)
export interface WorldProgressV3 {
  worldId: WorldId;
  status: WorldStatus;
  levels: Record<number, LevelProgressV3>;
  completedAt?: number;
  unlockedAt?: number;
}

// Tier preset configuration
export interface TierPreset {
  numbers: 3 | 4 | 5;
  minDepth: number;
  maxDepth: number;
  traps: number;
  errorMarginMin: number;
  errorMarginMax: number;
  intuitiveness: number;
}
