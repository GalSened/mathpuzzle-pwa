import {
  Operator,
  Expression,
  ExpressionNode,
  EvaluationStep,
  PuzzleConstraints,
  DifficultyMetrics
} from './types';

export class PuzzleSolver {
  /**
   * Find all solutions for given numbers and target
   */
  findAllSolutions(
    numbers: number[],
    target: number,
    constraints: PuzzleConstraints
  ): Expression[] {
    const solutions: Expression[] = [];
    const operators = constraints.allowedOperators;

    const numberPerms = this.permutations(numbers);

    for (const nums of numberPerms) {
      const operatorCombos = this.operatorCombinations(
        operators,
        nums.length - 1
      );

      for (const ops of operatorCombos) {
        const trees = this.generateTrees(nums.length);

        for (const treeStructure of trees) {
          const expr = this.buildExpression(nums, ops, treeStructure);

          if (expr && this.evaluate(expr) === target) {
            if (this.satisfiesConstraints(expr, constraints)) {
              if (!this.isDuplicateSolution(expr, solutions)) {
                solutions.push(expr);
              }
            }
          }
        }
      }
    }

    return solutions;
  }

  /**
   * Check if a specific expression evaluates to target
   */
  checkSolution(expression: Expression, target: number): boolean {
    return this.evaluate(expression) === target;
  }

  /**
   * Find near-miss solutions (traps)
   */
  findNearMisses(
    numbers: number[],
    target: number,
    constraints: PuzzleConstraints,
    threshold: number = 3
  ): Expression[] {
    const nearMisses: Expression[] = [];
    const operators = constraints.allowedOperators;

    const numberPerms = this.permutations(numbers).slice(0, 24);

    for (const nums of numberPerms) {
      const operatorCombos = this.operatorCombinations(operators, nums.length - 1);

      for (const ops of operatorCombos) {
        const leftToRight = this.evaluateLeftToRight(nums, ops);
        if (leftToRight !== null &&
          leftToRight !== target &&
          Math.abs(leftToRight - target) <= threshold) {
          nearMisses.push(this.createSimpleExpression(nums, ops, leftToRight));
        }
      }
    }

    return nearMisses.slice(0, 5);
  }

  private generateTrees(n: number): string[] {
    if (n <= 1) return ['a'];
    if (n === 2) return ['(a○b)'];
    if (n === 3) return ['((a○b)○c)', '(a○(b○c))'];
    if (n === 4) return [
      '(((a○b)○c)○d)',
      '((a○(b○c))○d)',
      '((a○b)○(c○d))',
      '(a○((b○c)○d))',
      '(a○(b○(c○d)))'
    ];
    if (n === 5) return [
      '((((a○b)○c)○d)○e)',
      '(((a○(b○c))○d)○e)',
      '(((a○b)○(c○d))○e)',
      '((a○((b○c)○d))○e)',
      '((a○(b○(c○d)))○e)',
      '(((a○b)○c)○(d○e))',
      '((a○(b○c))○(d○e))',
      '((a○b)○((c○d)○e))',
      '((a○b)○(c○(d○e)))',
      '(a○(((b○c)○d)○e))',
      '(a○((b○(c○d))○e))',
      '(a○((b○c)○(d○e)))',
      '(a○(b○((c○d)○e)))',
      '(a○(b○(c○(d○e))))'
    ];

    return this.generateTreesRecursive(n);
  }

  private generateTreesRecursive(n: number): string[] {
    if (n === 1) return ['a'];

    const trees: string[] = [];

    for (let i = 1; i < n; i++) {
      const leftTrees = this.generateTreesRecursive(i);
      const rightTrees = this.generateTreesRecursive(n - i);

      for (const left of leftTrees) {
        for (const right of rightTrees) {
          trees.push(`(${left}○${right})`);
        }
      }
    }

    return trees;
  }

  private buildExpression(
    numbers: number[],
    operators: Operator[],
    treeStructure: string
  ): Expression | null {
    try {
      const tree = this.buildTree(numbers, operators, treeStructure);
      const result = this.evaluateTree(tree);

      if (result === null) return null;

      const notation = this.treeToNotation(tree);
      const steps = this.getEvaluationSteps(tree);

      return {
        notation,
        tree,
        result,
        steps,
        complexity: operators.length
      };
    } catch {
      return null;
    }
  }

  private buildTree(
    numbers: number[],
    operators: Operator[],
    structure: string
  ): ExpressionNode {
    let numIndex = 0;
    let opIndex = 0;

    const parse = (s: string): ExpressionNode => {
      s = s.trim();

      if (s === 'a' || s === 'b' || s === 'c' || s === 'd' || s === 'e' || s === 'f') {
        return { type: 'number', value: numbers[numIndex++] };
      }

      if (s.startsWith('(') && s.endsWith(')')) {
        s = s.slice(1, -1);
      }

      let depth = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') depth++;
        else if (s[i] === ')') depth--;
        else if (s[i] === '○' && depth === 0) {
          const left = parse(s.slice(0, i));
          const right = parse(s.slice(i + 1));
          return {
            type: 'operator',
            value: operators[opIndex++],
            left,
            right
          };
        }
      }

      throw new Error('Invalid structure');
    };

    return parse(structure);
  }

  private evaluate(expr: Expression): number | null {
    return this.evaluateTree(expr.tree);
  }

  private evaluateTree(node: ExpressionNode): number | null {
    if (node.type === 'number') {
      return node.value as number;
    }

    const left = this.evaluateTree(node.left!);
    const right = this.evaluateTree(node.right!);

    if (left === null || right === null) return null;

    const op = node.value as Operator;

    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '×': return left * right;
      case '÷':
        if (right === 0) return null;
        const result = left / right;
        if (!Number.isInteger(result)) return null;
        return result;
      default: return null;
    }
  }

  private evaluateLeftToRight(numbers: number[], operators: Operator[]): number | null {
    let result = numbers[0];

    for (let i = 0; i < operators.length; i++) {
      const op = operators[i];
      const num = numbers[i + 1];

      switch (op) {
        case '+': result += num; break;
        case '-': result -= num; break;
        case '×': result *= num; break;
        case '÷':
          if (num === 0) return null;
          result = result / num;
          if (!Number.isInteger(result)) return null;
          break;
      }
    }

    return result;
  }

  private treeToNotation(node: ExpressionNode): string {
    if (node.type === 'number') {
      return String(node.value);
    }

    const left = this.treeToNotation(node.left!);
    const right = this.treeToNotation(node.right!);
    const op = node.value;

    return `(${left} ${op} ${right})`;
  }

  private getEvaluationSteps(node: ExpressionNode): EvaluationStep[] {
    const steps: EvaluationStep[] = [];

    const traverse = (n: ExpressionNode): number => {
      if (n.type === 'number') {
        return n.value as number;
      }

      const left = traverse(n.left!);
      const right = traverse(n.right!);
      const op = n.value as Operator;

      let result: number;
      switch (op) {
        case '+': result = left + right; break;
        case '-': result = left - right; break;
        case '×': result = left * right; break;
        case '÷': result = left / right; break;
        default: result = 0;
      }

      steps.push({
        left,
        operator: op,
        right,
        result,
        notation: `${left} ${op} ${right} = ${result}`
      });

      return result;
    };

    traverse(node);
    return steps;
  }

  private permutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];

    const result: T[][] = [];

    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const restPerms = this.permutations(rest);

      for (const perm of restPerms) {
        result.push([arr[i], ...perm]);
      }
    }

    return result;
  }

  private operatorCombinations(operators: Operator[], count: number): Operator[][] {
    if (count === 0) return [[]];

    const result: Operator[][] = [];
    const subCombos = this.operatorCombinations(operators, count - 1);

    for (const op of operators) {
      for (const sub of subCombos) {
        result.push([op, ...sub]);
      }
    }

    return result;
  }

  private satisfiesConstraints(
    expr: Expression,
    constraints: PuzzleConstraints
  ): boolean {
    for (const step of expr.steps) {
      if (!constraints.allowedOperators.includes(step.operator)) {
        return false;
      }

      if (!constraints.allowNegativeIntermediates && step.result < 0) {
        return false;
      }
    }

    if (expr.steps.length > constraints.maxSteps) {
      return false;
    }

    return true;
  }

  private isDuplicateSolution(expr: Expression, existing: Expression[]): boolean {
    const normalized = this.normalizeNotation(expr.notation);
    return existing.some(e => this.normalizeNotation(e.notation) === normalized);
  }

  private normalizeNotation(notation: string): string {
    return notation.replace(/\s/g, '');
  }

  private createSimpleExpression(
    numbers: number[],
    operators: Operator[],
    result: number
  ): Expression {
    const parts = numbers.map((n, i) =>
      i < operators.length ? `${n} ${operators[i]}` : String(n)
    );

    return {
      notation: parts.join(' '),
      tree: { type: 'number', value: result },
      result,
      steps: [],
      complexity: operators.length
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-AXIS DIFFICULTY METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate all difficulty metrics for a puzzle
   */
  calculateMetrics(
    numbers: number[],
    target: number,
    solution: Expression,
    constraints: PuzzleConstraints
  ): DifficultyMetrics {
    return {
      solutionDepth: this.calculateSolutionDepth(solution),
      errorMargin: this.calculateErrorMargin(numbers, target, constraints),
      intuitiveness: this.calculateIntuitiveness(solution, target)
    };
  }

  /**
   * Calculate solution depth - how many sequential dependencies exist
   *
   * Depth 1: All operations are independent (e.g., 3 + 5 + 2)
   * Depth 2: One operation depends on another (e.g., (3 + 5) × 2)
   * Depth 3: Chained dependencies (e.g., ((3 + 5) × 2) - 4)
   */
  calculateSolutionDepth(solution: Expression): number {
    return this.calculateTreeDepth(solution.tree);
  }

  private calculateTreeDepth(node: ExpressionNode): number {
    if (node.type === 'number') {
      return 0; // Leaf node has no depth
    }

    const leftDepth = this.calculateTreeDepth(node.left!);
    const rightDepth = this.calculateTreeDepth(node.right!);

    // The depth is 1 + max of children depths
    // This counts how many operations are chained
    return 1 + Math.max(leftDepth, rightDepth);
  }

  /**
   * Calculate error margin - count of near-miss solutions within ±3 of target
   * Higher error margin = more forgiving (easier to stumble into close answers)
   * Lower error margin = tighter (fewer easy outs)
   */
  calculateErrorMargin(
    numbers: number[],
    target: number,
    constraints: PuzzleConstraints,
    threshold: number = 3
  ): number {
    const nearMisses = this.findNearMisses(numbers, target, constraints, threshold);
    return nearMisses.length;
  }

  /**
   * Calculate intuitiveness - pattern readability score (0.0 to 1.0)
   *
   * Higher scores for:
   * - Round numbers in intermediate results (×10, ×5)
   * - Clean factorizations (24 = 4×6, 8×3)
   * - Familiar patterns (doubling, halving)
   *
   * Lower scores for:
   * - Odd intermediate results
   * - Large primes
   * - Non-obvious number combinations
   */
  calculateIntuitiveness(solution: Expression, target: number): number {
    if (!solution.steps || solution.steps.length === 0) {
      return 1.0; // Simple expressions are intuitive
    }

    let score = 0;
    let factors = 0;

    for (const step of solution.steps) {
      factors++;

      // Check for round intermediate results
      if (this.isRoundNumber(step.result)) {
        score += 0.3;
      }

      // Check for clean operations
      if (this.isCleanOperation(step)) {
        score += 0.3;
      }

      // Check for familiar patterns
      if (this.isFamiliarPattern(step)) {
        score += 0.2;
      }

      // Penalize large primes or awkward numbers
      if (this.isAwkwardResult(step.result)) {
        score -= 0.2;
      }
    }

    // Bonus for clean target
    if (this.isRoundNumber(target)) {
      score += 0.2;
    }

    // Normalize to 0.0-1.0 range
    const maxPossible = factors * 0.8 + 0.2; // Max per step + target bonus
    const normalized = Math.max(0, Math.min(1, score / maxPossible));

    return Math.round(normalized * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check if a number is "round" (divisible by 5 or 10, or small integer)
   */
  private isRoundNumber(n: number): boolean {
    if (n <= 0) return false;
    if (n <= 12) return true;             // Small numbers are intuitive
    if (n % 10 === 0) return true;        // Divisible by 10
    if (n % 5 === 0) return true;         // Divisible by 5
    if (n === 24 || n === 36 || n === 48) return true; // Common products
    return false;
  }

  /**
   * Check if an operation uses clean factors
   */
  private isCleanOperation(step: EvaluationStep): boolean {
    const { left, right, operator } = step;

    // Multiplication/division with small clean numbers
    if (operator === '×' || operator === '÷') {
      if (left <= 12 && right <= 12) return true;
      if (left === 10 || right === 10) return true;
      if (left === 5 || right === 5) return true;
    }

    // Addition/subtraction with round numbers
    if (operator === '+' || operator === '-') {
      if (this.isRoundNumber(left) && this.isRoundNumber(right)) return true;
    }

    return false;
  }

  /**
   * Check for familiar mathematical patterns
   */
  private isFamiliarPattern(step: EvaluationStep): boolean {
    const { left, right, operator, result } = step;

    // Doubling (×2 or adding same number)
    if (operator === '×' && (left === 2 || right === 2)) return true;
    if (operator === '+' && left === right) return true;

    // Halving
    if (operator === '÷' && right === 2) return true;

    // Squaring
    if (operator === '×' && left === right && left <= 10) return true;

    // Common sums (making 10, 20, 100)
    if (operator === '+' && (result === 10 || result === 20 || result === 100)) return true;

    return false;
  }

  /**
   * Check if a result is awkward (large prime, weird number)
   */
  private isAwkwardResult(n: number): boolean {
    if (n <= 20) return false; // Small numbers are fine

    // Check if it's a large prime
    if (n > 30 && this.isPrime(n)) return true;

    // Check if it's an odd multiple of a large prime
    if (n % 7 === 0 && n > 49) return true;
    if (n % 11 === 0 && n > 44) return true;
    if (n % 13 === 0 && n > 39) return true;

    return false;
  }

  /**
   * Simple prime check for awkwardness detection
   */
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }
}

export const solver = new PuzzleSolver();
