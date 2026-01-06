'use client';

import { motion } from 'framer-motion';
import { useEquippedCloak, useEquippedPet } from '@/store/shopStore';
import { usePlayerStore } from '@/store/playerStore';
import type { ItemEffect } from '@/engine/types';

interface AvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showPet?: boolean;
  showEffects?: boolean;
  className?: string;
}

export function AvatarDisplay({
  size = 'md',
  showPet = true,
  showEffects = false,
  className = '',
}: AvatarDisplayProps) {
  const equippedCloak = useEquippedCloak();
  const equippedPet = useEquippedPet();
  const activeEffects = usePlayerStore((s) => s.activeEffects);

  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      character: 'text-3xl',
      cloak: 'text-sm -top-0.5 -right-0.5',
      pet: 'text-lg -bottom-1 -right-2',
      effectsBadge: 'text-xs -top-1 -left-1',
    },
    md: {
      container: 'w-20 h-20',
      character: 'text-5xl',
      cloak: 'text-lg -top-1 -right-1',
      pet: 'text-2xl -bottom-1 -right-3',
      effectsBadge: 'text-sm -top-1 -left-1',
    },
    lg: {
      container: 'w-32 h-32',
      character: 'text-7xl',
      cloak: 'text-2xl -top-1 -right-1',
      pet: 'text-4xl -bottom-2 -right-4',
      effectsBadge: 'text-base -top-2 -left-2',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Base Character */}
      <div className={`relative ${config.container} flex items-center justify-center`}>
        <motion.span
          className={config.character}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          🧙‍♂️
        </motion.span>

        {/* Cloak Overlay */}
        {equippedCloak && (
          <motion.div
            className={`absolute ${config.cloak}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <span>{equippedCloak.visual}</span>
          </motion.div>
        )}
      </div>

      {/* Pet Companion */}
      {showPet && equippedPet && (
        <motion.div
          className={`absolute ${config.pet}`}
          initial={{ x: 10, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
            y: [0, -3, 0],
          }}
          transition={{
            x: { type: 'spring', delay: 0.2 },
            opacity: { delay: 0.2 },
            y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
          }}
        >
          <span>{equippedPet.visual}</span>
        </motion.div>
      )}

      {/* Active Effects Badge */}
      {showEffects && activeEffects.length > 0 && (
        <motion.div
          className={`absolute ${config.effectsBadge} bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {activeEffects.length}
        </motion.div>
      )}

      {/* Glow effect when equipped items */}
      {(equippedCloak || equippedPet) && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 10px rgba(147, 51, 234, 0.2)',
              '0 0 20px rgba(147, 51, 234, 0.4)',
              '0 0 10px rgba(147, 51, 234, 0.2)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </div>
  );
}

// Effects tooltip component (optional - for profile view)
interface EffectsTooltipProps {
  className?: string;
}

export function EffectsTooltip({ className = '' }: EffectsTooltipProps) {
  const activeEffects = usePlayerStore((s) => s.activeEffects);

  if (activeEffects.length === 0) return null;

  return (
    <div className={`bg-gray-800/90 rounded-lg p-3 border border-purple-500/50 ${className}`}>
      <h4 className="text-purple-300 text-sm font-bold mb-2">אפקטים פעילים</h4>
      <div className="space-y-1">
        {activeEffects.map((effect: ItemEffect, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
            <span className="text-purple-400">⚡</span>
            <span>
              {effect.type === 'xp_multiplier' && `XP ×${effect.value}`}
              {effect.type === 'coin_multiplier' && `מטבעות ×${effect.value}`}
              {effect.type === 'hint_boost' && `+${effect.value} רמזים`}
              {effect.type === 'skill_boost' && `+${Math.round(effect.value * 100)}% מיומנות`}
            </span>
            {effect.duration && (
              <span className="text-gray-500">({effect.duration} חידות)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
