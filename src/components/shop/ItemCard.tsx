'use client';

import { motion } from 'framer-motion';
import type { ShopItem } from '@/engine/shopTypes';
import { useShopStore } from '@/store/shopStore';
import { usePlayerStore } from '@/store/playerStore';

interface ItemCardProps {
  item: ShopItem;
  onPurchase?: () => void;
  onEquip?: () => void;
  onUse?: () => void;
  showActions?: boolean;
  owned?: boolean;
  equipped?: boolean;
  quantity?: number;
}

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-800/50',
  rare: 'border-blue-500 bg-blue-900/30',
  epic: 'border-purple-500 bg-purple-900/30',
  legendary: 'border-yellow-500 bg-yellow-900/30',
};

const RARITY_LABELS = {
  common: 'נפוץ',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי',
};

export function ItemCard({
  item,
  onPurchase,
  onEquip,
  onUse,
  showActions = true,
  owned = false,
  equipped = false,
  quantity,
}: ItemCardProps) {
  const { hasItem, getItemQuantity } = useShopStore();
  const playerCoins = usePlayerStore((s) => s.coins);
  const playerLevel = usePlayerStore((s) => s.level);

  const isOwned = owned || hasItem(item.id);
  const ownedQty = quantity ?? getItemQuantity(item.id);
  const canAfford = playerCoins >= item.price;
  const meetsLevel = !item.unlockLevel || playerLevel >= item.unlockLevel;
  const isEquippable = item.category === 'cloak' || item.category === 'pet';
  const isUsable = item.category === 'consumable' || item.category === 'boost';

  return (
    <motion.div
      className={`relative rounded-xl border-2 p-4 ${RARITY_COLORS[item.rarity]} transition-all`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Equipped badge */}
      {equipped && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
          מצויד
        </div>
      )}

      {/* Quantity badge */}
      {ownedQty > 1 && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
          {ownedQty}
        </div>
      )}

      {/* Lock overlay */}
      {!meetsLevel && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center z-10">
          <span className="text-3xl">🔒</span>
          <span className="text-white text-sm mt-1">שלב {item.unlockLevel}</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Visual/Emoji */}
        <span className="text-4xl mb-2">{item.visual}</span>

        {/* Name */}
        <h3 className="text-white font-bold text-sm">{item.nameHe}</h3>
        <p className="text-gray-400 text-xs">{item.name}</p>

        {/* Rarity */}
        <span className={`text-xs mt-1 ${
          item.rarity === 'legendary' ? 'text-yellow-400' :
          item.rarity === 'epic' ? 'text-purple-400' :
          item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
        }`}>
          {RARITY_LABELS[item.rarity]}
        </span>

        {/* Description */}
        <p className="text-gray-300 text-xs mt-2 line-clamp-2">
          {item.descriptionHe}
        </p>

        {/* Price / Owned status */}
        {!isOwned && showActions ? (
          <div className={`flex items-center gap-1 mt-3 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
            <span>💰</span>
            <span className="font-bold">{item.price}</span>
          </div>
        ) : isOwned && !isEquippable ? (
          <div className="text-green-400 text-xs mt-3">
            יש לך: {ownedQty}
          </div>
        ) : isOwned ? (
          <div className="text-green-400 text-xs mt-3">
            ✓ ברשותך
          </div>
        ) : null}

        {/* Action buttons */}
        {showActions && (
          <div className="mt-3 w-full">
            {!isOwned && meetsLevel && (
              <motion.button
                className={`w-full py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                  canAfford
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                onClick={() => canAfford && onPurchase?.()}
                disabled={!canAfford}
              >
                קנה
              </motion.button>
            )}

            {isOwned && isEquippable && !equipped && (
              <motion.button
                className="w-full py-2 px-4 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white"
                whileTap={{ scale: 0.95 }}
                onClick={() => onEquip?.()}
              >
                צייד
              </motion.button>
            )}

            {equipped && (
              <motion.button
                className="w-full py-2 px-4 rounded-lg text-sm font-bold bg-red-500/50 hover:bg-red-500 text-white"
                whileTap={{ scale: 0.95 }}
                onClick={() => onEquip?.()}
              >
                הסר
              </motion.button>
            )}

            {isOwned && isUsable && ownedQty > 0 && (
              <motion.button
                className="w-full py-2 px-4 rounded-lg text-sm font-bold bg-green-500 hover:bg-green-400 text-white"
                whileTap={{ scale: 0.95 }}
                onClick={() => onUse?.()}
              >
                השתמש
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
