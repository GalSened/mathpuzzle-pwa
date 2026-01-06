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
}

export type InsightType =
  | 'basic_arithmetic'
  | 'order_of_operations'
  | 'factoring'
  | 'distribution'
  | 'elimination'
  | 'working_backwards';

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
