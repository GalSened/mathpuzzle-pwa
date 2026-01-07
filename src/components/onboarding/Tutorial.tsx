'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Check, Lightbulb } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { he } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: he.tutorialStep1Title,
    description: he.tutorialStep1Desc,
    icon: <span className="text-4xl">1️⃣</span>,
    highlight: 'numbers',
  },
  {
    title: he.tutorialStep2Title,
    description: he.tutorialStep2Desc,
    icon: <span className="text-4xl">➕</span>,
    highlight: 'operators',
  },
  {
    title: he.tutorialStep3Title,
    description: he.tutorialStep3Desc,
    icon: <span className="text-4xl">2️⃣</span>,
    highlight: 'numbers',
  },
  {
    title: he.tutorialStep4Title,
    description: he.tutorialStep4Desc,
    icon: <span className="text-4xl">🎯</span>,
    highlight: 'target',
  },
  {
    title: '⚠️ כלל חשוב',
    description: he.tutorialTip,
    icon: <span className="text-4xl">⚠️</span>,
    highlight: 'mustUseAll',
  },
];

export function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [exampleStep, setExampleStep] = useState(0);
  const completeTutorial = useUserStore((s) => s.completeTutorial);
  const name = useUserStore((s) => s.name);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowExample(true);
    }
  };

  const handlePrev = () => {
    if (showExample) {
      setShowExample(false);
      setExampleStep(0);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExampleNext = () => {
    if (exampleStep < 2) {
      setExampleStep(exampleStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl mb-4">
            <Lightbulb className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {name ? `${name}, ` : ''}{he.tutorialTitle}
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 min-h-[300px]">
          <AnimatePresence mode="wait">
            {!showExample ? (
              /* Tutorial Steps */
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mb-6">{tutorialSteps[currentStep].icon}</div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  {tutorialSteps[currentStep].title}
                </h2>
                <p className="text-slate-300 mb-6">
                  {tutorialSteps[currentStep].description}
                </p>

                {/* Visual demonstration */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  {tutorialSteps[currentStep].highlight === 'numbers' && (
                    <div className="flex justify-center gap-3">
                      {[3, 5, 2].map((num, i) => (
                        <motion.div
                          key={num}
                          animate={currentStep === 0 && i === 0 ? { scale: [1, 1.1, 1] } : undefined}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold',
                            currentStep === 0 && i === 0
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          )}
                        >
                          {num}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {tutorialSteps[currentStep].highlight === 'operators' && (
                    <div className="flex justify-center gap-3">
                      {['+', '−', '×', '÷'].map((op, i) => (
                        <motion.div
                          key={op}
                          animate={i === 0 ? { scale: [1, 1.1, 1] } : undefined}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                            i === 0
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          )}
                        >
                          {op}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {tutorialSteps[currentStep].highlight === 'target' && (
                    <div className="text-center">
                      <div className="text-slate-400 text-sm mb-1">{he.target}</div>
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl font-bold text-green-400"
                      >
                        10
                      </motion.div>
                    </div>
                  )}
                  {tutorialSteps[currentStep].highlight === 'mustUseAll' && (
                    <div className="text-center">
                      <div className="flex justify-center gap-2 mb-3">
                        {[3, 5, 2].map((num) => (
                          <motion.div
                            key={num}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold bg-green-600 text-white"
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-slate-300 text-sm">
                        כל המספרים צריכים להיות בשימוש בסוף החידה ✓
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {tutorialSteps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        i === currentStep ? 'bg-purple-500 w-6' : 'bg-slate-600'
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Interactive Example */
              <motion.div
                key="example"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  {he.tutorialExample} 🎮
                </h2>
                <p className="text-slate-300 mb-4">{he.tutorialExampleDesc}</p>

                {/* Target */}
                <div className="bg-slate-900/50 rounded-xl p-3 mb-4">
                  <div className="text-slate-400 text-sm">{he.target}</div>
                  <div className="text-3xl font-bold text-amber-400">10</div>
                </div>

                {/* Example steps */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: exampleStep >= 0 ? 1 : 0.5 }}
                    className={cn(
                      'py-3 px-4 rounded-xl text-lg font-mono',
                      exampleStep >= 0 ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-800'
                    )}
                  >
                    {he.tutorialExampleStep1}
                    {exampleStep >= 0 && <Check className="inline-block w-5 h-5 mr-2 text-green-400" />}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: exampleStep >= 1 ? 1 : 0.3 }}
                    className={cn(
                      'py-3 px-4 rounded-xl text-lg font-mono',
                      exampleStep >= 1 ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-800 text-slate-600'
                    )}
                  >
                    {he.tutorialExampleStep2}
                    {exampleStep >= 1 && <Check className="inline-block w-5 h-5 mr-2 text-green-400" />}
                  </motion.div>

                  {exampleStep >= 2 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="py-3 px-4 rounded-xl bg-green-900/50 text-green-300 text-lg font-bold"
                    >
                      ✨ {he.tutorialExampleSuccess} ✨
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentStep === 0 && !showExample}
            className={cn(
              'flex items-center gap-2 py-2 px-4 rounded-xl',
              currentStep === 0 && !showExample
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
            )}
          >
            <ChevronRight className="w-5 h-5" />
            הקודם
          </motion.button>

          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            {he.skipTutorial}
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showExample ? handleExampleNext : handleNext}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
          >
            {showExample && exampleStep >= 2 ? (
              <>
                {he.gotIt}
                <Play className="w-5 h-5" />
              </>
            ) : (
              <>
                הבא
                <ChevronLeft className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
