'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RotateCcw, Check, Sparkles } from 'lucide-react';
import { NumberTile } from '@/components/ui/NumberTile';
import { OperatorPad } from './OperatorPad';
import { cn } from '@/lib/utils';
import { he } from '@/lib/i18n';
import { useUserStore } from '@/store/userStore';
import { playCorrect, playWrong } from '@/lib/sounds';
import type { Puzzle, Operator, Expression, EvaluationStep, ExpressionNode } from '@/engine/types';
import { evaluateAttempt } from '@/engine/hints';

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolve: (expression: Expression) => void;
  onSkip?: () => void;  // Optional - not shown in boss mode
}

type NumberState = 'unused' | 'selected' | 'used';

interface BuildState {
  numbers: { value: number; state: NumberState; originalIndex: number }[];
  selectedNumber: number | null;
  selectedIndex: number | null;
  pendingOperator: Operator | null;
  steps: EvaluationStep[];
  currentResult: number | null;
}

function createExpression(steps: EvaluationStep[], result: number): Expression {
  const tree: ExpressionNode = { type: 'number', value: result };
  return {
    notation: steps.map(s => s.notation).join(' → '),
    tree,
    result,
    steps,
    complexity: steps.length,
  };
}

function initState(p: Puzzle): BuildState {
  return {
    numbers: p.numbers.map((v, i) => ({ value: v, state: 'unused' as NumberState, originalIndex: i })),
    selectedNumber: null,
    selectedIndex: null,
    pendingOperator: null,
    steps: [],
    currentResult: null,
  };
}

export function PuzzleBoard({ puzzle, onSolve, onSkip }: PuzzleBoardProps) {
  const [buildState, setBuildState] = useState<BuildState>(() => initState(puzzle));
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);

  const name = useUserStore((s) => s.name);
  const gender = useUserStore((s) => s.gender);


  const handleNumberClick = useCallback((index: number) => {
    setBuildState(prev => {
      const num = prev.numbers[index];
      if (num.state === 'used') return prev;

      if (prev.selectedNumber === null) {
        const newNumbers = prev.numbers.map((n, i) =>
          i === index ? { ...n, state: 'selected' as NumberState } : n
        );
        return {
          ...prev,
          numbers: newNumbers,
          selectedNumber: num.value,
          selectedIndex: index,
        };
      }

      if (prev.pendingOperator && prev.selectedIndex !== null) {
        const left = prev.selectedNumber;
        const right = num.value;
        const op = prev.pendingOperator;

        let result: number | null = null;
        switch (op) {
          case '+': result = left + right; break;
          case '-': result = left - right; break;
          case '×': result = left * right; break;
          case '÷': result = right !== 0 && left % right === 0 ? left / right : null; break;
        }

        if (result === null) {
          playWrong();
          setFeedback(he.invalidOperation);
          setTimeout(() => setFeedback(null), 1500);
          return prev;
        }

        const newNumbers = prev.numbers.map((n, i) => {
          if (i === prev.selectedIndex || i === index) {
            return { ...n, state: 'used' as NumberState };
          }
          return n;
        });

        newNumbers.push({
          value: result,
          state: 'unused' as NumberState,
          originalIndex: -1
        });

        const stepNotation = `${left} ${op} ${right} = ${result}`;
        const newStep: EvaluationStep = {
          left,
          operator: op,
          right,
          result,
          notation: stepNotation
        };
        const newSteps = [...prev.steps, newStep];

        if (result === puzzle.target) {
          playCorrect();
          setIsWin(true);
          setTimeout(() => {
            onSolve(createExpression(newSteps, result));
          }, 1000);
        }

        return {
          numbers: newNumbers,
          selectedNumber: null,
          selectedIndex: null,
          pendingOperator: null,
          steps: newSteps,
          currentResult: result,
        };
      }

      const newNumbers = prev.numbers.map((n, i) => {
        if (i === prev.selectedIndex) return { ...n, state: 'unused' as NumberState };
        if (i === index) return { ...n, state: 'selected' as NumberState };
        return n;
      });

      return {
        ...prev,
        numbers: newNumbers,
        selectedNumber: num.value,
        selectedIndex: index,
      };
    });
  }, [puzzle.target, onSolve]);

  const handleOperatorSelect = useCallback((op: Operator) => {
    setBuildState(prev => {
      if (prev.selectedNumber === null) return prev;
      return { ...prev, pendingOperator: op };
    });
  }, []);

  const handleReset = useCallback(() => {
    setBuildState(initState(puzzle));
    setFeedback(null);
    setIsWin(false);
  }, [puzzle]);

  const handleHint = useCallback(() => {
    if (hintLevel >= 4) return;
    const newLevel = (hintLevel + 1) as 1 | 2 | 3 | 4;
    setHintLevel(newLevel);

    // Generate Hebrew hint based on level
    const userName = name || 'חבר';
    const userGender = gender || 'boy';

    let hintMessage = '';

    if (newLevel === 1) {
      const delta = puzzle.target - (buildState.currentResult || 0);
      if (delta > 0) {
        hintMessage = he.hints.level1.higher(userName, userGender);
      } else if (delta < 0) {
        hintMessage = he.hints.level1.lower(userName, userGender);
      } else {
        hintMessage = he.hints.level1.onTrack(userName, userGender);
      }
    } else if (newLevel === 2) {
      // Suggest operator based on target
      if (puzzle.target > 50) {
        hintMessage = he.hints.level2.useMultiplication;
      } else if (puzzle.target < 10) {
        hintMessage = he.hints.level2.useDivision;
      } else {
        hintMessage = he.hints.level2.orderMatters;
      }
    } else if (newLevel === 3) {
      // Suggest first number from solution
      const firstStep = puzzle.solution.steps[0];
      if (firstStep) {
        hintMessage = he.hints.level3.startWith(firstStep.left);
      }
    } else if (newLevel === 4) {
      // Reveal first step
      const firstStep = puzzle.solution.steps[0];
      if (firstStep) {
        hintMessage = he.hints.level4.firstStep(firstStep.notation);
      }
    }

    setCurrentHint(hintMessage);
  }, [hintLevel, puzzle, buildState.currentResult, name, gender]);

  const handleCheck = useCallback(() => {
    if (buildState.currentResult === null) return;

    const userName = name || 'חבר';
    const userGender = gender || 'boy';

    if (buildState.currentResult === puzzle.target) {
      playCorrect();
      setIsWin(true);
      setTimeout(() => {
        onSolve(createExpression(buildState.steps, buildState.currentResult!));
      }, 1000);
    } else {
      playWrong();
      const attemptFeedback = evaluateAttempt(puzzle, buildState.currentResult);
      const direction = attemptFeedback.direction === 'too_high' ? `📈 ${he.tooHigh}` : `📉 ${he.tooLow}`;
      setFeedback(`${he.encouragement.tryAgain(userName, userGender)} ${direction}`);
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [buildState, puzzle, onSolve, name, gender]);

  const expressionDisplay = buildState.steps.length > 0
    ? buildState.steps.map(s => `${s.left} ${s.operator} ${s.right} = ${s.result}`).join(' ← ')
    : buildState.selectedNumber !== null
      ? `${buildState.selectedNumber}${buildState.pendingOperator ? ` ${buildState.pendingOperator} ?` : ''}`
      : he.selectNumber;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto" dir="rtl">
      {/* Target Display */}
      <motion.div
        className={cn(
          'text-center py-6 rounded-2xl border-2',
          isWin
            ? 'bg-green-900/50 border-green-500'
            : 'bg-slate-800/50 border-slate-600'
        )}
        animate={isWin ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 0.5, repeat: isWin ? 2 : 0 }}
      >
        <div className="text-slate-400 text-sm mb-1">{he.target}</div>
        <div className={cn(
          'text-5xl font-bold',
          isWin ? 'text-green-400' : 'text-white'
        )}>
          {puzzle.target}
        </div>
        {isWin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-2 text-green-400"
          >
            <Sparkles className="w-5 h-5" />
            <span>{he.perfect}</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Expression Display */}
      <div className="bg-slate-900 rounded-xl p-4 min-h-[60px] border border-slate-700">
        <div className="text-slate-300 text-center font-mono" dir="ltr">
          {expressionDisplay}
        </div>
        {buildState.currentResult !== null && (
          <div className="text-center mt-2">
            <span className="text-slate-500">{he.currentResult} </span>
            <span className={cn(
              'font-bold text-xl',
              buildState.currentResult === puzzle.target ? 'text-green-400' : 'text-amber-400'
            )}>
              {buildState.currentResult}
            </span>
          </div>
        )}
      </div>

      {/* Number Tiles */}
      <div className="flex flex-wrap gap-3 justify-center">
        {buildState.numbers.map((num, index) => (
          <NumberTile
            key={`${num.originalIndex}-${index}`}
            value={num.value}
            state={num.state}
            onClick={() => handleNumberClick(index)}
            disabled={isWin}
          />
        ))}
      </div>

      {/* Operator Pad */}
      <OperatorPad
        onSelect={handleOperatorSelect}
        disabled={buildState.selectedNumber === null || isWin}
        allowedOperators={puzzle.availableOperators}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
        >
          <RotateCcw className="w-4 h-4" />
          {he.reset}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHint}
          disabled={hintLevel >= 4}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white',
            hintLevel >= 4 ? 'bg-slate-800 opacity-50' : 'bg-purple-600 hover:bg-purple-500'
          )}
        >
          <Lightbulb className="w-4 h-4" />
          {he.hint} ({4 - hintLevel})
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheck}
          disabled={buildState.currentResult === null || isWin}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white',
            buildState.currentResult === null || isWin
              ? 'bg-slate-800 opacity-50'
              : 'bg-blue-600 hover:bg-blue-500'
          )}
        >
          <Check className="w-4 h-4" />
          {he.check}
        </motion.button>
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-slate-500 hover:text-slate-400 text-sm underline"
        >
          {he.skip}
        </button>
      </div>

      {/* Feedback Display */}
      <AnimatePresence>
        {(currentHint || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'p-4 rounded-xl text-center',
              feedback ? 'bg-amber-900/50 border border-amber-600' : 'bg-purple-900/50 border border-purple-600'
            )}
          >
            {feedback || currentHint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
