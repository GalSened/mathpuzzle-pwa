'use client';

import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { CoinDisplay, XPDisplay } from '@/components/ui/CoinDisplay';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

interface TopBarProps {
  title?: string;
  showStats?: boolean;
  onSettingsClick?: () => void;
}

export function TopBar({ title, showStats = true, onSettingsClick }: TopBarProps) {
  const level = usePlayerStore((s) => s.level);
  const dailyStreak = usePlayerStore((s) => s.dailyStreak);

  return (
    <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center justify-between p-3 max-w-lg mx-auto">
        {/* Left: Avatar, Level & Streak */}
        <div className="flex items-center gap-3">
          <AvatarDisplay size="sm" showPet={false} />
          <motion.div
            className="flex items-center gap-1.5 bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-500/50"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-lg">⭐</span>
            <span className="text-blue-300 font-bold">Lv.{level}</span>
          </motion.div>

          {dailyStreak > 0 && (
            <motion.div
              className="flex items-center gap-1 bg-orange-900/50 px-2.5 py-1 rounded-full border border-orange-500/50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-base">🔥</span>
              <span className="text-orange-300 font-bold text-sm">{dailyStreak}</span>
            </motion.div>
          )}
        </div>

        {/* Center: Title (optional) */}
        {title && (
          <h1 className="text-white font-bold text-lg absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>
        )}

        {/* Right: Coins & Settings */}
        <div className="flex items-center gap-2">
          <CoinDisplay size="sm" />

          {onSettingsClick && (
            <motion.button
              className="text-gray-400 hover:text-white p-2"
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
            >
              ⚙️
            </motion.button>
          )}
        </div>
      </div>

      {/* XP Progress bar */}
      {showStats && (
        <div className="px-3 pb-2 max-w-lg mx-auto">
          <XPDisplay size="sm" showProgress={true} />
        </div>
      )}
    </header>
  );
}
