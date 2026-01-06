import { Puzzle, Hint, AttemptFeedback } from './types';

const DIRECTIONAL_HINTS = [
  "Think about order of operations",
  "Try grouping numbers differently",
  "Consider which operations will get you closer",
  "Sometimes subtraction helps more than addition"
];

const STRUCTURAL_HINTS = [
  "Parentheses might help here",
  "Look for numbers that multiply nicely",
  "Try building up to the target step by step",
  "Division can sometimes simplify things"
];

const ENCOURAGEMENTS = [
  "Getting closer!",
  "Good thinking!",
  "You're on the right track!",
  "Nice try, keep going!",
  "Almost there!",
  "That's a great attempt!"
];

export function generateHint(
  puzzle: Puzzle,
  currentResult: number | null,
  level: 1 | 2 | 3 | 4
): Hint {
  switch (level) {
    case 1:
      return {
        level: 1,
        type: 'directional',
        message: DIRECTIONAL_HINTS[Math.floor(Math.random() * DIRECTIONAL_HINTS.length)],
        cost: 5
      };

    case 2:
      return {
        level: 2,
        type: 'structural',
        message: STRUCTURAL_HINTS[Math.floor(Math.random() * STRUCTURAL_HINTS.length)],
        cost: 15
      };

    case 3: {
      const ops = puzzle.solution.steps.map(s => s.operator);
      const uniqueOps = [...new Set(ops)];
      return {
        level: 3,
        type: 'specific',
        message: `Try using: ${uniqueOps.join(', ')}`,
        cost: 25
      };
    }

    case 4: {
      const firstStep = puzzle.solution.steps[0];
      if (firstStep) {
        return {
          level: 4,
          type: 'partial_reveal',
          message: `Start with: ${firstStep.left} ${firstStep.operator} ${firstStep.right}`,
          cost: 40
        };
      }
      return {
        level: 4,
        type: 'partial_reveal',
        message: `The answer involves: ${puzzle.solution.notation.slice(0, 10)}...`,
        cost: 40
      };
    }

    default:
      return {
        level: 1,
        type: 'directional',
        message: "Keep trying!",
        cost: 0
      };
  }
}

export function evaluateAttempt(
  puzzle: Puzzle,
  attemptResult: number
): AttemptFeedback {
  const delta = attemptResult - puzzle.target;
  const absDelta = Math.abs(delta);

  let direction: 'too_high' | 'too_low' | 'correct';
  if (delta === 0) {
    direction = 'correct';
  } else if (delta > 0) {
    direction = 'too_high';
  } else {
    direction = 'too_low';
  }

  const partialInsights: string[] = [];
  if (absDelta <= 1) {
    partialInsights.push("So close! Just off by 1");
  } else if (absDelta <= 5) {
    partialInsights.push("Very close to the target!");
  } else if (absDelta <= 10) {
    partialInsights.push("Getting warmer...");
  }

  const structureMatch = direction === 'correct' ? 1 : Math.max(0, 1 - absDelta / 100);
  const operatorMatch = direction === 'correct' ? 1 : Math.max(0, 1 - absDelta / 50);

  return {
    resultDelta: delta,
    direction,
    structureMatch,
    operatorMatch,
    partialInsights,
    encouragement: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  };
}
