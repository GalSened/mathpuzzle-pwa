import { describe, it, expect } from 'vitest';
import { solver } from '@/engine/solver';

describe('PuzzleSolver', () => {
  describe('findAllSolutions', () => {
    it('should find simple addition solution', () => {
      const solutions = solver.findAllSolutions([5, 3], 8, {
        mustUseAllNumbers: true,
        allowParentheses: false,
        allowedOperators: ['+', '-', '×', '÷'],
        maxSteps: 2,
        allowNegativeIntermediates: false,
        allowFractions: false,
      });

      expect(solutions.length).toBeGreaterThan(0);
      expect(solutions[0].result).toBe(8);
    });

    it('should find multiplication solution', () => {
      const solutions = solver.findAllSolutions([4, 3], 12, {
        mustUseAllNumbers: true,
        allowParentheses: false,
        allowedOperators: ['+', '-', '×', '÷'],
        maxSteps: 2,
        allowNegativeIntermediates: false,
        allowFractions: false,
      });

      expect(solutions.length).toBeGreaterThan(0);
      const hasMultiplication = solutions.some(s =>
        s.steps.some(step => step.operator === '×')
      );
      expect(hasMultiplication).toBe(true);
    });

    it('should find solutions with three numbers', () => {
      const solutions = solver.findAllSolutions([2, 3, 4], 14, {
        mustUseAllNumbers: true,
        allowParentheses: true,
        allowedOperators: ['+', '-', '×', '÷'],
        maxSteps: 3,
        allowNegativeIntermediates: false,
        allowFractions: false,
      });

      expect(solutions.length).toBeGreaterThan(0);
      expect(solutions[0].result).toBe(14);
    });

    it('should return empty array when no solution exists', () => {
      const solutions = solver.findAllSolutions([1, 1, 1], 100, {
        mustUseAllNumbers: true,
        allowParentheses: false,
        allowedOperators: ['+', '-'],
        maxSteps: 3,
        allowNegativeIntermediates: false,
        allowFractions: false,
      });

      expect(solutions.length).toBe(0);
    });
  });

  describe('findNearMisses', () => {
    it('should find near miss values', () => {
      const nearMisses = solver.findNearMisses([5, 3], 9, {
        mustUseAllNumbers: true,
        allowParentheses: false,
        allowedOperators: ['+', '-', '×', '÷'],
        maxSteps: 2,
        allowNegativeIntermediates: false,
        allowFractions: false,
      });

      // Should find 8 (5+3) as a near miss to 9
      const has8 = nearMisses.some(nm => nm.result === 8);
      expect(has8).toBe(true);
    });
  });
});
