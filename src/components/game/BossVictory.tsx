'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorldConfig, WorldId } from '@/engine/types';
import { WORLD_STORIES, getBossProfile } from '@/engine/story';
import { playBossVictory } from '@/lib/sounds';

interface BossVictoryProps {
  bossInfo: { name: string; nameHe: string; difficulty: number };
  world: WorldConfig;
  coinsEarned: number;
  xpEarned: number;
  onContinue: () => void;
}

export function BossVictory({
  bossInfo,
  world,
  coinsEarned,
  xpEarned,
  onContinue,
}: BossVictoryProps) {
  const [showRewards, setShowRewards] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  const worldId = world.id as WorldId;
  const victoryText = WORLD_STORIES[worldId]?.victoryHe || 'הבוס הובס!';
  const bossProfile = getBossProfile(worldId);
  const bossVisual = bossProfile?.defeatedVisual || '💀';
  const defeatQuote = bossProfile?.defeatQuoteHe || '';

  useEffect(() => {
    // Play victory fanfare when screen appears
    playBossVictory();

    const quoteTimer = setTimeout(() => setShowQuote(true), 600);
    const rewardsTimer = setTimeout(() => setShowRewards(true), 1200);
    return () => {
      clearTimeout(quoteTimer);
      clearTimeout(rewardsTimer);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-hidden modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti particles */}
      <ConfettiParticles />

      <motion.div
        className={`relative max-w-md w-full rounded-2xl p-8 text-center border-2 border-yellow-500 bg-gradient-to-b from-yellow-900/80 to-amber-900/80`}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {/* Victory banner */}
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-2 rounded-full"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-black font-bold text-lg">🏆 ניצחון!</span>
        </motion.div>

        {/* Boss defeated visual - transformed to light */}
        <motion.div
          className="relative text-7xl mb-4"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <motion.div
            className="absolute inset-0 blur-2xl"
            style={{ backgroundColor: bossProfile?.theme.glow }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="relative z-10"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {bossVisual}
          </motion.span>
        </motion.div>

        {/* Boss name - defeated */}
        <motion.h2
          className="text-2xl font-bold text-yellow-400 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {bossInfo.nameHe} שוחרר!
        </motion.h2>

        {/* Boss defeat quote - character redemption */}
        <AnimatePresence>
          {showQuote && defeatQuote && (
            <motion.div
              className="bg-black/40 rounded-lg p-3 mb-4 border border-yellow-500/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <motion.p
                className="text-yellow-200 italic text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {defeatQuote}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story text - what happens next */}
        <motion.p
          className="text-gray-200 mb-4 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {victoryText}
        </motion.p>

        {/* Rewards section */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              className="bg-black/40 rounded-xl p-4 mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-yellow-300 font-bold mb-3">פרסים:</h3>
              <div className="space-y-3">
                {/* Coins reward */}
                <motion.div
                  className="flex items-center justify-center gap-3 text-white"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    💰
                  </motion.span>
                  <span className="text-yellow-400 font-bold text-xl">
                    +{coinsEarned} מטבעות
                  </span>
                </motion.div>

                {/* XP reward */}
                <motion.div
                  className="flex items-center justify-center gap-3 text-white"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    ✨
                  </motion.span>
                  <span className="text-blue-400 font-bold text-xl">
                    +{xpEarned} XP
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <motion.button
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-black font-bold text-xl shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={onContinue}
        >
          המשך לאתגר הבא!
        </motion.button>

        {/* Golden glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 179, 8, 0.3)',
              '0 0 50px rgba(234, 179, 8, 0.5)',
              '0 0 20px rgba(234, 179, 8, 0.3)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Confetti particles component
function ConfettiParticles() {
  // Use lazy initializer to generate random values only once on mount
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      xDrift: (Math.random() - 0.5) * 100,
      emoji: ['🎉', '⭐', '✨', '🏆', '💫', '💚', '💙', '🧡', '💜'][Math.floor(Math.random() * 9)],
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
