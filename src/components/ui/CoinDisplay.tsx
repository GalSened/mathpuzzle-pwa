'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';

interface FloatingCoin {
  id: number;
  amount: number;
  x: number;
  y: number;
}

interface CoinDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function CoinDisplay({ size = 'md', showLabel = false, className = '' }: CoinDisplayProps) {
  const coins = usePlayerStore((s) => s.coins);
  const [displayedCoins, setDisplayedCoins] = useState(coins);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const prevCoinsRef = useRef(coins);
  const spinControls = useAnimationControls();

  // Memoize callbacks for setTimeout to satisfy ESLint
  const addFloatingCoin = useCallback((coin: FloatingCoin) => {
    setFloatingCoins((prev) => [...prev, coin]);
  }, []);

  const removeFloatingCoin = useCallback((coinId: number) => {
    setFloatingCoins((prev) => prev.filter((c) => c.id !== coinId));
  }, []);

  // Animate coin count changes
  useEffect(() => {
    const prevCoins = prevCoinsRef.current;
    const diff = coins - prevCoins;
    const startValue = displayedCoins;
    prevCoinsRef.current = coins;

    if (diff === 0) return;

    // Trigger spin animation using animation controls (not setState)
    spinControls.start({
      rotateY: [0, 180, 360],
      transition: { duration: 0.5 }
    });

    // Add floating coin notification via setTimeout (async, not sync in effect)
    let floatTimeout: NodeJS.Timeout | undefined;
    let removeTimeout: NodeJS.Timeout | undefined;
    if (diff > 0) {
      const newFloatingCoin: FloatingCoin = {
        id: Date.now(),
        amount: diff,
        x: Math.random() * 20 - 10,
        y: 0,
      };
      // Use setTimeout to make the setState async
      floatTimeout = setTimeout(() => addFloatingCoin(newFloatingCoin), 0);

      // Remove after animation
      removeTimeout = setTimeout(() => removeFloatingCoin(newFloatingCoin.id), 1500);
    }

    // Animate count
    const duration = 500;
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (coins - startValue) * eased);

      setDisplayedCoins(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (floatTimeout) clearTimeout(floatTimeout);
      if (removeTimeout) clearTimeout(removeTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [coins, spinControls, addFloatingCoin, removeFloatingCoin, displayedCoins]);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        className={`flex items-center gap-1.5 bg-gradient-to-r from-yellow-900/60 to-amber-900/60 rounded-full border border-yellow-500/50 ${sizeClasses[size]}`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={iconSizes[size]}
          animate={spinControls}
        >
          💰
        </motion.span>
        <motion.span
          className="text-yellow-400 font-bold tabular-nums"
          key={displayedCoins}
        >
          {displayedCoins.toLocaleString()}
        </motion.span>
        {showLabel && <span className="text-yellow-200/70 text-xs">מטבעות</span>}
      </motion.div>

      {/* Floating coins animation */}
      <AnimatePresence>
        {floatingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute top-0 left-1/2 pointer-events-none z-10"
            initial={{ opacity: 1, y: 0, x: coin.x }}
            animate={{ opacity: 0, y: -50, x: coin.x }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <span className="text-green-400 font-bold text-sm whitespace-nowrap">
              +{coin.amount}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// XP Display component
interface XPDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function XPDisplay({ size = 'md', showProgress = true, className = '' }: XPDisplayProps) {
  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const xpToNextLevel = usePlayerStore((s) => s.xpToNextLevel);
  const progress = (xp / xpToNextLevel) * 100;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
        <span className="text-blue-400 font-bold">Lv.{level}</span>
      </div>

      {showProgress && (
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {showProgress && (
        <span className="text-gray-400 text-xs whitespace-nowrap">
          {xp}/{xpToNextLevel}
        </span>
      )}
    </div>
  );
}

// Level Up Celebration Modal
interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRewards(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get rewards for this level
  const rewards = getLevelRewards(newLevel);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-sm w-full text-center border-2 border-yellow-500"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti effect */}
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0],
          }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          🎉
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-yellow-400 mb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          שלב {newLevel}!
        </motion.h2>

        <motion.p
          className="text-white text-lg mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          כל הכבוד! עלית לשלב חדש
        </motion.p>

        {/* Rewards */}
        <AnimatePresence>
          {showRewards && rewards.length > 0 && (
            <motion.div
              className="bg-black/30 rounded-xl p-4 mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <h3 className="text-yellow-300 font-bold mb-3">פרסים:</h3>
              <div className="space-y-2">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-center gap-2 text-white"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <span>{reward.icon}</span>
                    <span>{reward.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          המשך
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Helper function to get rewards for a level
function getLevelRewards(level: number): { icon: string; text: string }[] {
  const rewards: { icon: string; text: string }[] = [];

  // Coin bonus every level
  rewards.push({ icon: '💰', text: `${50 + level * 10} מטבעות` });

  // Zone unlocks
  if (level === 3) {
    rewards.push({ icon: '🌍', text: 'נפתח: ליבת החיסור' });
  } else if (level === 6) {
    rewards.push({ icon: '🔥', text: 'נפתח: נפחיית הכפל' });
  } else if (level === 10) {
    rewards.push({ icon: '🌀', text: 'נפתח: תהום החילוק' });
  }

  // Special items unlock
  if (level === 5) {
    rewards.push({ icon: '📚', text: 'פריט חדש בחנות!' });
  }

  return rewards;
}
