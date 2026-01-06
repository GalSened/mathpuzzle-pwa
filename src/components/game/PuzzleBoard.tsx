'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { NumberTile } from '@/components/ui/NumberTile';
import { OperatorPad } from './OperatorPad';
import { cn } from '@/lib/utils';
import type { Puzzle, Operator, Expression } from '@/engine/types';
import { generateHint, evaluateAttempt } from '@/engine/hints';

interface PuzzleBoardProps {
  puzzle: Puzzle;
  onSolve: (expression: Expression) => void;
  onSkip: () => void;
}

type NumberState = 'unused' | 'selected' | 'used';

interface BuildState {
  numbers: { value: number; state: NumberState; originalIndex: number }[];
  selectedNumber: number | null;
  selectedIndex: number | null;
  pendingOperator: Operator | null;
  steps: { left: number; op: Operator; right: number; result: number }[];
  currentResult: number | null;
}

export function PuzzleBoard({ puzzle, onSolve, onSkip }: PuzzleBoardProps) {
  const [buildState, setBuildState] = useState<BuildState>(() => initState(puzzle));
  const [hintLevel, setHintLevel] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);

  useEffect(() => {
    setBuildState(initState(puzzle));
    setHintLevel(0);
    setCurrentHint(null);
    setFeedback(null);
    setIsWin(false);
  }, [puzzle]);

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
          setFeedback('Invalid operation!');
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

        const newSteps = [...prev.steps, { left, op, right, result }];

        if (result === puzzle.target) {
          setIsWin(true);
          setTimeout(() => {
            onSolve({
              steps: newSteps,
              notation: newSteps.map(s => `${s.left}${s.op}${s.right}=${s.result}`).join(' → '),
              result,
            });
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
    const hint = generateHint(puzzle, buildState.currentResult, newLevel);
    setCurrentHint(hint.message);
  }, [hintLevel, puzzle, buildState.currentResult]);

  const handleCheck = useCallback(() => {
    if (buildState.currentResult === null) return;

    if (buildState.currentResult === puzzle.target) {
      setIsWin(true);
      setTimeout(() => {
        onSolve({
          steps: buildState.steps,
          notation: buildState.steps.map(s => `${s.left}${s.op}${s.right}=${s.result}`).join(' → '),
          result: buildState.currentResult!,
        });
      }, 1000);
    } else {
      const attemptFeedback = evaluateAttempt(puzzle, buildState.currentResult);
      setFeedback(`${attemptFeedback.encouragement} ${attemptFeedback.direction === 'too_high' ? '📈 Too high!' : '📉 Too low!'}`);
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [buildState, puzzle, onSolve]);

  const unusedCount = buildState.numbers.filter(n => n.state !== 'used').length;
  const expressionDisplay = buildState.steps.length > 0
    ? buildState.steps.map(s => `${s.left} ${s.op} ${s.right} = ${s.result}`).join(' → ')
    : buildState.selectedNumber !== null
      ? `${buildState.selectedNumber}${buildState.pendingOperator ? ` ${buildState.pendingOperator} ?` : ''}`
      : 'Select a number...';

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto">
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
        <div className="text-slate-400 text-sm mb-1">Target</div>
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
            <span>Perfect!</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Expression Display */}
      <div className="bg-slate-900 rounded-xl p-4 min-h-[60px] border border-slate-700">
        <div className="text-slate-300 text-center font-mono">
          {expressionDisplay}
        </div>
        {buildState.currentResult !== null && (
          <div className="text-center mt-2">
            <span className="text-slate-500">Current: </span>
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
          Reset
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
          Hint ({4 - hintLevel})
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
          Check
        </motion.button>
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-slate-500 hover:text-slate-400 text-sm underline"
        >
          Skip this puzzle
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

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-slate-600 text-center">
          Archetype: {puzzle.archetype} | Difficulty: {puzzle.difficulty.level} | Numbers left: {unusedCount}
        </div>
      )}
    </div>
  );
}
