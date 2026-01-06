import {
  Puzzle,
  PuzzleArchetype,
  DifficultyProfile,
  Operator,
  PuzzleConstraints,
  Expression
} from './types';
import { solver } from './solver';
import { computeSignature } from './signatures';
import { DIFFICULTY_PRESETS } from './difficulty';

const NICE_TARGETS: Record<number, number[]> = {
  1: [5, 6, 7, 8, 9, 10, 11, 12, 15, 20],
  2: [12, 15, 18, 20, 21, 24, 25, 28, 30, 36],
  3: [24, 30, 36, 40, 42, 45, 48, 50, 54, 60],
  4: [48, 50, 60, 72, 80, 84, 90, 96, 100, 120],
  5: [100, 120, 144, 150, 180, 200, 240, 250, 300, 360]
};

const TEMPLATES: Record<PuzzleArchetype, string[]> = {
  decision: [
    '(a○b)○c',
    '(a○b)○(c○d)',
  ],
  order: [
    'a○b○c',
    'a○(b○c)',
    '(a○b)○c',
  ],
  trap: [
    '(a○b)○c',
    'a○(b○c)',
  ],
  chain: [
    '((a○b)○c)○d',
    '(((a○b)○c)○d)○e',
  ],
  constraint: [
    'a○b○c',
    '(a○b)○c',
  ],
  precision: [
    '(a○b)○(c○d)',
    '((a○b)○c)○d',
  ]
};

export class PuzzleGenerator {
  private recentSignatures: string[] = [];
  private recentArchetypes: PuzzleArchetype[] = [];
  private maxRetries = 50;

  generate(
    archetype: PuzzleArchetype,
    difficulty: 1 | 2 | 3 | 4 | 5
  ): Puzzle | null {
    const difficultyProfile = DIFFICULTY_PRESETS[difficulty];

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const puzzle = this.attemptGeneration(archetype, difficultyProfile);

      if (puzzle && this.validatePuzzle(puzzle)) {
        this.recentSignatures.push(puzzle.signature);
        this.recentArchetypes.push(archetype);

        if (this.recentSignatures.length > 20) {
          this.recentSignatures.shift();
        }
        if (this.recentArchetypes.length > 10) {
          this.recentArchetypes.shift();
        }

        return puzzle;
      }
    }

    console.warn(`Failed to generate ${archetype} puzzle after ${this.maxRetries} attempts`);
    return null;
  }

  generateNext(
    preferredDifficulty: 1 | 2 | 3 | 4 | 5,
    excludeArchetypes: PuzzleArchetype[] = []
  ): Puzzle | null {
    const archetype = this.selectArchetype(excludeArchetypes);
    return this.generate(archetype, preferredDifficulty);
  }

  private attemptGeneration(
    archetype: PuzzleArchetype,
    difficulty: DifficultyProfile
  ): Puzzle | null {
    const templates = TEMPLATES[archetype];
    const template = templates[Math.floor(Math.random() * templates.length)];

    const { numbers, target } = this.fillTemplate(
      template,
      archetype,
      difficulty
    );

    if (!numbers || !target) return null;

    const constraints = this.buildConstraints(archetype, difficulty);

    const allSolutions = solver.findAllSolutions(numbers, target, constraints);

    if (!this.validateSolutionCount(allSolutions, archetype)) {
      return null;
    }

    const traps = solver.findNearMisses(numbers, target, constraints);

    if (traps.length < difficulty.trapCount && difficulty.level >= 3) {
      return null;
    }

    const signature = computeSignature(
      archetype,
      template,
      difficulty.level,
      difficulty.insightRequired
    );

    if (this.isRepetitive(signature, archetype)) {
      return null;
    }

    return {
      id: this.generateId(),
      numbers,
      availableOperators: constraints.allowedOperators,
      target,
      constraints,
      archetype,
      difficulty,
      signature,
      solution: allSolutions[0],
      traps,
      alternativeSolutions: allSolutions.slice(1),
      metadata: {
        generatedAt: Date.now(),
        validatedAt: Date.now(),
        estimatedSolveTime: this.estimateSolveTime(difficulty)
      }
    };
  }

  private fillTemplate(
    template: string,
    archetype: PuzzleArchetype,
    difficulty: DifficultyProfile
  ): { numbers: number[] | null; target: number | null; operators: Operator[] } {
    const numCount = (template.match(/[a-e]/g) || []).length;
    const opCount = numCount - 1;

    const targets = NICE_TARGETS[difficulty.level];
    const target = targets[Math.floor(Math.random() * targets.length)];

    const operators = this.selectOperators(archetype, difficulty, opCount);

    const numbers = this.generateNumbersForTarget(
      target,
      operators,
      template,
      difficulty
    );

    return { numbers, target, operators };
  }

  private generateNumbersForTarget(
    target: number,
    operators: Operator[],
    template: string,
    difficulty: DifficultyProfile
  ): number[] | null {
    const [min, max] = difficulty.numberRange;

    for (let attempt = 0; attempt < 20; attempt++) {
      const numbers = this.tryGenerateNumbers(target, operators, min, max);
      if (numbers && this.validateNumbers(numbers, difficulty)) {
        return numbers;
      }
    }

    return null;
  }

  private tryGenerateNumbers(
    target: number,
    operators: Operator[],
    min: number,
    max: number
  ): number[] | null {
    const opCount = operators.length;

    if (opCount === 1) {
      return this.generateForSingleOp(target, operators[0], min, max);
    }

    if (opCount === 2) {
      return this.generateForTwoOps(target, operators, min, max);
    }

    return this.generateRandom(opCount + 1, min, max);
  }

  private generateForSingleOp(
    target: number,
    op: Operator,
    min: number,
    max: number
  ): number[] | null {
    const candidates: number[][] = [];

    for (let a = min; a <= max; a++) {
      for (let b = min; b <= max; b++) {
        let result: number | null = null;

        switch (op) {
          case '+': result = a + b; break;
          case '-': result = a - b; break;
          case '×': result = a * b; break;
          case '÷': result = b !== 0 && a % b === 0 ? a / b : null; break;
        }

        if (result === target && a !== b) {
          candidates.push([a, b]);
        }
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private generateForTwoOps(
    target: number,
    operators: Operator[],
    min: number,
    max: number
  ): number[] | null {
    const [op1, op2] = operators;

    for (let attempts = 0; attempts < 100; attempts++) {
      const a = this.randomInt(min, max);
      const b = this.randomInt(min, max);

      let intermediate: number | null = null;
      switch (op1) {
        case '+': intermediate = a + b; break;
        case '-': intermediate = a - b; break;
        case '×': intermediate = a * b; break;
        case '÷': intermediate = b !== 0 && a % b === 0 ? a / b : null; break;
      }

      if (intermediate === null || intermediate <= 0) continue;

      let c: number | null = null;

      switch (op2) {
        case '+': c = target - intermediate; break;
        case '-': c = intermediate - target; break;
        case '×': c = target % intermediate === 0 ? target / intermediate : null; break;
        case '÷': c = intermediate % target === 0 ? intermediate / target : null; break;
      }

      if (c !== null && c >= min && c <= max && Number.isInteger(c)) {
        if (new Set([a, b, c]).size >= 2) {
          return [a, b, c];
        }
      }
    }

    return null;
  }

  private generateRandom(count: number, min: number, max: number): number[] {
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(this.randomInt(min, max));
    }
    return numbers;
  }

  private selectOperators(
    archetype: PuzzleArchetype,
    difficulty: DifficultyProfile,
    count: number
  ): Operator[] {
    const allOps: Operator[] = ['+', '-', '×', '÷'];

    if (archetype === 'constraint') {
      const limitedOps = allOps.slice(0, 2);
      return Array(count).fill(null).map(() =>
        limitedOps[Math.floor(Math.random() * limitedOps.length)]
      );
    }

    if (archetype === 'order') {
      const ops: Operator[] = [];
      ops.push(Math.random() > 0.5 ? '+' : '-');
      ops.push(Math.random() > 0.5 ? '×' : '÷');

      while (ops.length < count) {
        ops.push(allOps[Math.floor(Math.random() * allOps.length)]);
      }

      return this.shuffle(ops).slice(0, count);
    }

    const availableOps = difficulty.level >= 3
      ? allOps
      : ['+', '-', '×'] as Operator[];

    return Array(count).fill(null).map(() =>
      availableOps[Math.floor(Math.random() * availableOps.length)]
    );
  }

  private buildConstraints(
    archetype: PuzzleArchetype,
    difficulty: DifficultyProfile
  ): PuzzleConstraints {
    return {
      mustUseAllNumbers: archetype !== 'decision',
      allowParentheses: difficulty.requiresParentheses,
      allowedOperators: archetype === 'constraint'
        ? ['+', '-'] as Operator[]
        : ['+', '-', '×', '÷'] as Operator[],
      maxSteps: difficulty.numberCount,
      allowNegativeIntermediates: difficulty.level >= 4,
      allowFractions: false
    };
  }

  private validatePuzzle(puzzle: Puzzle): boolean {
    if (!puzzle.solution) return false;
    if (puzzle.solution.result !== puzzle.target) return false;
    if (!this.validateNumbers(puzzle.numbers, puzzle.difficulty)) return false;
    return true;
  }

  private validateNumbers(numbers: number[], difficulty: DifficultyProfile): boolean {
    const [min, max] = difficulty.numberRange;

    if (!numbers.every(n => n >= min && n <= max)) return false;
    if (new Set(numbers).size === 1) return false;
    if (numbers.every(n => n <= 1)) return false;

    return true;
  }

  private validateSolutionCount(
    solutions: Expression[],
    archetype: PuzzleArchetype
  ): boolean {
    if (archetype === 'decision') {
      return solutions.length >= 1 && solutions.length <= 3;
    }
    return solutions.length >= 1 && solutions.length <= 3;
  }

  private isRepetitive(signature: string, archetype: PuzzleArchetype): boolean {
    if (this.recentSignatures.includes(signature)) {
      return true;
    }

    const last3 = this.recentArchetypes.slice(-3);
    if (last3.length === 3 && last3.every(a => a === archetype)) {
      return true;
    }

    return false;
  }

  private selectArchetype(exclude: PuzzleArchetype[]): PuzzleArchetype {
    const all: PuzzleArchetype[] = [
      'decision', 'order', 'trap', 'chain', 'constraint', 'precision'
    ];

    const available = all.filter(a => !exclude.includes(a));

    const lastArchetype = this.recentArchetypes[this.recentArchetypes.length - 1];
    const filtered = available.filter(a => a !== lastArchetype);

    const pool = filtered.length > 0 ? filtered : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private generateId(): string {
    return `pzl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private estimateSolveTime(difficulty: DifficultyProfile): number {
    const baseTimes = { 1: 15, 2: 25, 3: 45, 4: 75, 5: 120 };
    return baseTimes[difficulty.level];
  }

  clearHistory(): void {
    this.recentSignatures = [];
    this.recentArchetypes = [];
  }
}

export const generator = new PuzzleGenerator();
