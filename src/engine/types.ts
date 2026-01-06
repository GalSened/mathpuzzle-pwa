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

// Zone definition for story mode
export interface ZoneTheme {
  background: string; // Tailwind gradient classes
  accent: string; // Tailwind color class
  pattern: string; // CSS pattern identifier
}

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

// Zone progression tracking
export interface ZoneProgress {
  solved: number;
  total: number;
  bossDefeated: boolean;
}

// Adaptive config for puzzle generation
export interface AdaptiveConfig {
  maxNumber: number;
  allowedOps: Operator[];
  depth: number;
  operatorWeights: Record<Operator, number>;
}
