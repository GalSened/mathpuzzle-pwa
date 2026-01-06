'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingXP {
  id: number;
  amount: number;
  x: number;
}

interface XPGainNotificationProps {
  xpGained: number | null;
  onComplete?: () => void;
}

// Component for showing floating XP when puzzle is solved
export function XPGainNotification({ xpGained, onComplete }: XPGainNotificationProps) {
  const [floatingXP, setFloatingXP] = useState<FloatingXP[]>([]);

  const removeFloating = useCallback((id: number) => {
    setFloatingXP((prev) => prev.filter((f) => f.id !== id));
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (xpGained && xpGained > 0) {
      const newFloating: FloatingXP = {
        id: Date.now(),
        amount: xpGained,
        x: Math.random() * 40 - 20,
      };
      // Intentionally update state in response to prop change (notification pattern)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFloatingXP((prev) => [...prev, newFloating]);

      // Remove after animation
      setTimeout(() => removeFloating(newFloating.id), 2000);
    }
  }, [xpGained, removeFloating]);

  return (
    <AnimatePresence>
      {floatingXP.map((xp) => (
        <motion.div
          key={xp.id}
          className="fixed top-1/3 left-1/2 pointer-events-none z-50"
          initial={{ opacity: 1, y: 0, x: xp.x, scale: 0.5 }}
          animate={{
            opacity: [1, 1, 0],
            y: -100,
            scale: [0.5, 1.2, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2 bg-blue-600/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
            >
              ✨
            </motion.span>
            <span className="text-white font-bold text-xl">+{xp.amount} XP</span>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// Hook for managing XP notifications
export function useXPNotification() {
  const [xpGained, setXPGained] = useState<number | null>(null);

  const showXPGain = useCallback((amount: number) => {
    setXPGained(amount);
  }, []);

  const clearXPGain = useCallback(() => {
    setXPGained(null);
  }, []);

  return {
    xpGained,
    showXPGain,
    clearXPGain,
  };
}

// Coin gain notification (similar to XP)
interface CoinGainNotificationProps {
  coinsGained: number | null;
  onComplete?: () => void;
}

export function CoinGainNotification({ coinsGained, onComplete }: CoinGainNotificationProps) {
  const [floatingCoins, setFloatingCoins] = useState<FloatingXP[]>([]);

  const removeFloating = useCallback((id: number) => {
    setFloatingCoins((prev) => prev.filter((f) => f.id !== id));
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (coinsGained && coinsGained > 0) {
      const newFloating: FloatingXP = {
        id: Date.now(),
        amount: coinsGained,
        x: Math.random() * 40 - 20,
      };
      // Intentionally update state in response to prop change (notification pattern)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFloatingCoins((prev) => [...prev, newFloating]);

      // Remove after animation
      setTimeout(() => removeFloating(newFloating.id), 2000);
    }
  }, [coinsGained, removeFloating]);

  return (
    <AnimatePresence>
      {floatingCoins.map((coin) => (
        <motion.div
          key={coin.id}
          className="fixed top-1/3 left-1/2 pointer-events-none z-50"
          style={{ marginTop: '40px' }} // Offset from XP notification
          initial={{ opacity: 1, y: 0, x: coin.x, scale: 0.5 }}
          animate={{
            opacity: [1, 1, 0],
            y: -100,
            scale: [0.5, 1.2, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
        >
          <div className="flex items-center gap-2 bg-yellow-600/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.3, repeat: 2 }}
            >
              💰
            </motion.span>
            <span className="text-white font-bold text-xl">+{coin.amount}</span>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// Combined rewards notification for puzzle completion
interface RewardsNotificationProps {
  xp: number | null;
  coins: number | null;
  onComplete?: () => void;
}

export function RewardsNotification({ xp, coins, onComplete }: RewardsNotificationProps) {
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if ((xp && xp > 0) || (coins && coins > 0)) {
      // Intentionally update state in response to prop change (notification pattern)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowing(true);
      const timer = setTimeout(() => {
        setShowing(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [xp, coins, onComplete]);

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="bg-gray-900/95 border border-gray-600 rounded-xl p-4 shadow-2xl backdrop-blur-md">
            <motion.div
              className="text-center text-2xl mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              🎉
            </motion.div>
            <div className="space-y-2">
              {xp && xp > 0 && (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-xl">✨</span>
                  <span className="text-blue-400 font-bold text-lg">+{xp} XP</span>
                </motion.div>
              )}
              {coins && coins > 0 && (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xl">💰</span>
                  <span className="text-yellow-400 font-bold text-lg">+{coins}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
