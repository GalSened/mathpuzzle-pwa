'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Zone } from '@/engine/types';
import { ZONES } from '@/engine/story';
import { playBossVictory } from '@/lib/sounds';

interface ZoneMasteryModalProps {
  zone: Zone;
  onContinue: () => void;
}

/**
 * Modal displayed when a player masters a zone.
 * Shows trophy animation, mastered operators, and next zone reveal.
 */
export function ZoneMasteryModal({ zone, onContinue }: ZoneMasteryModalProps) {
  const [showNextZone, setShowNextZone] = useState(false);

  // Find next zone
  const zoneIndex = ZONES.findIndex(z => z.id === zone.id);
  const nextZone = ZONES[zoneIndex + 1];

  useEffect(() => {
    // Play victory sound
    playBossVictory();

    // Reveal next zone after delay
    const timer = setTimeout(() => setShowNextZone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
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

        {/* Zone mastered title */}
        <motion.h2
          className="text-2xl font-bold text-yellow-300 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          אזור הושלם!
        </motion.h2>

        <motion.p
          className="text-white/80 text-lg mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          השלמת את {zone.nameHe}
        </motion.p>

        {/* Mastered operators */}
        <motion.div
          className="bg-black/30 rounded-xl p-4 mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-white/60 text-sm mb-3">פעולות שנשלטו:</p>
          <div className="flex justify-center gap-3">
            {zone.ops.map((op, index) => (
              <motion.div
                key={op}
                className="w-12 h-12 rounded-xl bg-green-500/40 border border-green-400 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8 + index * 0.1, type: 'spring' }}
              >
                <span className="text-2xl font-bold text-white">{op}</span>
                <motion.span
                  className="absolute -top-1 -right-1 text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  ✓
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next zone reveal */}
        <AnimatePresence>
          {showNextZone && nextZone && (
            <motion.div
              className="mb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`rounded-xl p-4 border-2 border-white/30 bg-gradient-to-br ${nextZone.theme.background}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-white/70 text-sm mb-2">נפתח אזור חדש!</p>
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
                    <h3 className="text-xl font-bold text-white">{nextZone.nameHe}</h3>
                    <p className="text-white/60 text-sm">{nextZone.name}</p>
                  </div>
                </motion.div>
                <div className="flex justify-center gap-2 mt-2">
                  {nextZone.ops.map((op) => (
                    <span
                      key={op}
                      className="inline-flex items-center justify-center w-8 h-8 rounded bg-white/20 text-white font-bold"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No more zones message */}
        {showNextZone && !nextZone && (
          <motion.div
            className="mb-4 p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-3xl">🌟</span>
            <p className="text-white font-bold mt-2">השלמת את כל האזורים!</p>
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
          transition={{ delay: showNextZone ? 2 : 1.2 }}
          onClick={onContinue}
        >
          {nextZone ? 'המשך לאזור הבא!' : 'סיום'}
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
