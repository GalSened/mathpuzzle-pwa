'use client';

import { motion } from 'framer-motion';
import type { Zone } from '@/engine/types';
import { ZONE_STORIES } from '@/engine/story';

interface BossAnnouncementProps {
  bossInfo: { name: string; nameHe: string; difficulty: number };
  zone: Zone;
  onStart: () => void;
}

// Boss visuals per zone
const BOSS_VISUALS: Record<string, string> = {
  addlands: '🧙‍♂️',
  subcore: '🛡️',
  multforge: '🔥',
  divvoid: '👑',
};

export function BossAnnouncement({ bossInfo, zone, onStart }: BossAnnouncementProps) {
  const storyText = ZONE_STORIES[zone.id]?.bossIntroHe || 'הבוס מופיע!';
  const bossVisual = BOSS_VISUALS[zone.id] || '👹';

  // Get difficulty stars
  const difficultyStars = '⭐'.repeat(bossInfo.difficulty);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative max-w-md w-full rounded-2xl p-8 text-center border-2 border-red-500 bg-gradient-to-b ${zone.theme.background}`}
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

        {/* Boss visual */}
        <motion.div
          className="text-8xl mb-4"
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {bossVisual}
        </motion.div>

        {/* Boss name */}
        <motion.h2
          className="text-3xl font-bold text-white mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {bossInfo.nameHe}
        </motion.h2>

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

        {/* Story text */}
        <motion.p
          className="text-gray-200 text-lg mb-6 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {storyText}
        </motion.p>

        {/* Zone name */}
        <motion.div
          className="text-gray-400 text-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {zone.nameHe}
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
