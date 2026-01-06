import {
  Operator,
  Expression,
  ExpressionNode,
  EvaluationStep,
  PuzzleConstraints
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
}

export const solver = new PuzzleSolver();
