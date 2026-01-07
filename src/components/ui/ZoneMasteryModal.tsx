'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorldConfig, WorldId } from '@/engine/types';
import { WORLDS, getNextWorld } from '@/engine/worlds';
import { playBossVictory } from '@/lib/sounds';

interface WorldMasteryModalProps {
  world: WorldConfig;
  onContinue: () => void;
}

/**
 * Modal displayed when a player masters a world.
 * Shows trophy animation and next world reveal.
 * In V3, all operators are always available so we don't show "mastered operators".
 */
export function ZoneMasteryModal({ world, onContinue }: WorldMasteryModalProps) {
  const [showNextWorld, setShowNextWorld] = useState(false);

  // Find next world
  const nextWorld = getNextWorld(world.id);

  useEffect(() => {
    // Play victory sound
    playBossVictory();

    // Reveal next world after delay
    const timer = setTimeout(() => setShowNextWorld(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti */}
      <MasteryConfetti />

      <motion.div
        className="relative max-w-md w-full rounded-2xl p-6 text-center border-2 border-yellow-500 bg-gradient-to-b from-yellow-900/80 to-amber-900/80"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
      >
        {/* Trophy animation */}
        <motion.div
          className="text-7xl mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🏆
          </motion.span>
        </motion.div>

        {/* World mastered title */}
        <motion.h2
          className="text-2xl font-bold text-yellow-300 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          עולם הושלם!
        </motion.h2>

        <motion.p
          className="text-white/80 text-lg mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          השלמת את {world.nameHe}
        </motion.p>

        {/* World icon and completion badge */}
        <motion.div
          className="bg-black/30 rounded-xl p-4 mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex justify-center items-center gap-4">
            <motion.span
              className="text-5xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              {world.theme.icon}
            </motion.span>
            <div className="text-right">
              <p className="text-white font-bold text-lg">{world.name}</p>
              <p className="text-green-400 text-sm">6/6 שלבים הושלמו ✓</p>
            </div>
          </div>
        </motion.div>

        {/* Next world reveal */}
        <AnimatePresence>
          {showNextWorld && nextWorld && (
            <motion.div
              className="mb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`rounded-xl p-4 border-2 border-white/30 bg-gradient-to-br ${nextWorld.theme.background}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-white/70 text-sm mb-2">נפתח עולם חדש!</p>
                <motion.div
                  className="flex items-center justify-center gap-3"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    className="text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🔓
                  </motion.span>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-white">{nextWorld.nameHe}</h3>
                    <p className="text-white/60 text-sm">{nextWorld.name}</p>
                  </div>
                  <span className="text-3xl">{nextWorld.theme.icon}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No more worlds message */}
        {showNextWorld && !nextWorld && (
          <motion.div
            className="mb-4 p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-3xl">🌟</span>
            <p className="text-white font-bold mt-2">השלמת את כל העולמות!</p>
            <p className="text-white/70 text-sm">אתה אלוף מתמטיקה אמיתי!</p>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-black font-bold text-lg shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: showNextWorld ? 2 : 1.2 }}
          onClick={onContinue}
        >
          {nextWorld ? 'המשך לעולם הבא!' : 'סיום'}
        </motion.button>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 179, 8, 0.3)',
              '0 0 40px rgba(234, 179, 8, 0.5)',
              '0 0 20px rgba(234, 179, 8, 0.3)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Also export as WorldMasteryModal for clarity
export { ZoneMasteryModal as WorldMasteryModal };

// Confetti particles
function MasteryConfetti() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      xDrift: (Math.random() - 0.5) * 80,
      emoji: ['🎉', '⭐', '✨', '🏆', '💫', '🥇', '🎊'][Math.floor(Math.random() * 7)],
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl"
          style={{ left: `${particle.x}%` }}
          initial={{ y: -50, opacity: 1 }}
          animate={{
            y: ['0%', '120%'],
            x: [0, particle.xDrift],
            rotate: [0, 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}
