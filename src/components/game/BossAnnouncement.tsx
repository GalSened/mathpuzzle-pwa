'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { WorldConfig, WorldId } from '@/engine/types';
import { WORLD_STORIES, getBossProfile } from '@/engine/story';
import { playBossAppear } from '@/lib/sounds';

interface BossAnnouncementProps {
  bossInfo: { name: string; nameHe: string; difficulty: number };
  world: WorldConfig;
  onStart: () => void;
}

export function BossAnnouncement({ bossInfo, world, onStart }: BossAnnouncementProps) {
  const worldId = world.id as WorldId;
  const storyText = WORLD_STORIES[worldId]?.bossIntroHe || 'הבוס מופיע!';
  const bossProfile = getBossProfile(worldId);
  const bossVisual = bossProfile?.visual || '👹';
  const bossTitle = bossProfile?.titleHe || '';
  const bossTaunt = bossProfile?.tauntHe || '';

  // Play boss appear sound when component mounts
  useEffect(() => {
    playBossAppear();
  }, []);

  // Get difficulty stars
  const difficultyStars = '⭐'.repeat(bossInfo.difficulty);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative max-w-md w-full rounded-2xl p-8 text-center border-2 border-red-500 bg-gradient-to-b ${world.theme.background}`}
        initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: 'spring', damping: 15, duration: 0.6 }}
      >
        {/* Warning banner */}
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 px-6 py-1 rounded-full"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white font-bold text-sm">⚔️ קרב בוס!</span>
        </motion.div>

        {/* Boss visual with pulsing glow */}
        <motion.div
          className="text-8xl mb-2 relative"
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 blur-xl opacity-50"
            style={{ backgroundColor: bossProfile?.theme.glow }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="relative z-10">{bossVisual}</span>
        </motion.div>

        {/* Boss name */}
        <motion.h2
          className="text-3xl font-bold text-white mb-1"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {bossInfo.nameHe}
        </motion.h2>

        {/* Boss title */}
        {bossTitle && (
          <motion.p
            className="text-lg text-gray-300 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {bossTitle}
          </motion.p>
        )}

        {/* Difficulty indicator */}
        <motion.div
          className="text-xl mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-gray-400 text-sm">קושי: </span>
          <span className="text-yellow-400">{difficultyStars}</span>
        </motion.div>

        {/* Story text - dramatic intro */}
        <motion.p
          className="text-gray-200 text-lg mb-3 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {storyText}
        </motion.p>

        {/* Boss taunt - character voice */}
        {bossTaunt && (
          <motion.div
            className="bg-black/40 rounded-lg p-3 mb-4 border border-red-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.p
              className="text-red-300 italic text-base"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {bossTaunt}
            </motion.p>
          </motion.div>
        )}

        {/* World name */}
        <motion.div
          className="text-gray-400 text-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          {world.nameHe}
        </motion.div>

        {/* Start button */}
        <motion.button
          className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold text-xl shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onStart}
        >
          ⚔️ התחל קרב!
        </motion.button>

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.3)',
              '0 0 40px rgba(239, 68, 68, 0.6)',
              '0 0 20px rgba(239, 68, 68, 0.3)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.div>
    </motion.div>
  );
}
