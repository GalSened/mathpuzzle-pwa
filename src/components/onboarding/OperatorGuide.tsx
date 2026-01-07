'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Lightbulb } from 'lucide-react';
import type { Operator } from '@/engine/types';
import { he } from '@/lib/i18n';

interface OperatorGuideProps {
  operator: Operator;
  zoneNameHe: string;
  onComplete: () => void;
}

const operatorColors: Record<Operator, { bg: string; border: string; text: string; glow: string }> = {
  '+': { bg: 'from-green-600 to-emerald-600', border: 'border-green-400', text: 'text-green-300', glow: 'shadow-green-500/50' },
  '-': { bg: 'from-blue-600 to-cyan-600', border: 'border-blue-400', text: 'text-blue-300', glow: 'shadow-blue-500/50' },
  '×': { bg: 'from-orange-600 to-amber-600', border: 'border-orange-400', text: 'text-orange-300', glow: 'shadow-orange-500/50' },
  '÷': { bg: 'from-purple-600 to-violet-600', border: 'border-purple-400', text: 'text-purple-300', glow: 'shadow-purple-500/50' },
};

const operatorContent: Record<Exclude<Operator, '+'>, {
  title: string;
  symbol: string;
  description: string;
  example: string;
  tip: string;
}> = {
  '-': he.operatorGuide.subtract,
  '×': he.operatorGuide.multiply,
  '÷': he.operatorGuide.divide,
};

export function OperatorGuide({ operator, zoneNameHe, onComplete }: OperatorGuideProps) {
  // Addition doesn't need a guide (it's the first operator)
  if (operator === '+') {
    onComplete();
    return null;
  }

  const content = operatorContent[operator];
  const colors = operatorColors[operator];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/50 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-bold">{he.operatorGuide.newAbility}</span>
          </div>
          <p className="text-gray-400 text-sm">{zoneNameHe}</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-2 ${colors.border} shadow-lg ${colors.glow}`}
        >
          {/* Operator Symbol */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl backdrop-blur-sm">
              <span className="text-6xl font-bold text-white">{content.symbol}</span>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            {content.title}
          </h2>

          {/* Description */}
          <p className="text-white/90 text-center text-lg mb-6">
            {content.description}
          </p>

          {/* Example */}
          <div className="bg-black/20 rounded-xl p-4 mb-4">
            <p className="text-white font-mono text-xl text-center">
              {content.example}
            </p>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
            <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <p className="text-white/80 text-sm">
              {content.tip}
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all"
        >
          <span>{he.operatorGuide.gotIt}</span>
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Zone introduction modal - shows when entering a new zone
interface ZoneIntroProps {
  zoneNameHe: string;
  zoneDescription: string;
  newOperators: Operator[];
  onContinue: () => void;
}

export function ZoneIntro({ zoneNameHe, zoneDescription, newOperators, onContinue }: ZoneIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Header Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/50">
            <span className="text-2xl">🗺️</span>
            <span className="text-purple-300 font-bold">{he.zoneUnlock.newZone}</span>
          </div>
        </motion.div>

        {/* Zone Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {he.zoneUnlock.welcome}
          </h2>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-center mb-4">
            {zoneNameHe}
          </h1>

          <p className="text-gray-300 text-center mb-6 whitespace-pre-line">
            {zoneDescription}
          </p>

          {/* New Operators */}
          {newOperators.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm text-center mb-3">
                {he.zoneUnlock.newOperators}
              </p>
              <div className="flex justify-center gap-3">
                {newOperators.map((op) => {
                  const colors = operatorColors[op];
                  return (
                    <motion.div
                      key={op}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border}`}
                    >
                      <span className="text-2xl font-bold text-white">{op}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-green-400 text-center font-medium">
            {he.zoneUnlock.goodLuck}
          </p>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2"
        >
          <span>{he.operatorGuide.tryIt}</span>
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
