'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItemCategory } from '@/engine/shopTypes';
import { getShopItemsByCategory } from '@/data/shopItems';
import { useShopStore } from '@/store/shopStore';
import { usePlayerStore } from '@/store/playerStore';
import { ItemCard } from './ItemCard';
import { playPurchase, playWrong, playClick, playCoin } from '@/lib/sounds';

const CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: 'cloak', label: 'גלימות', icon: '🎭' },
  { id: 'pet', label: 'חיות מחמד', icon: '🐾' },
  { id: 'consumable', label: 'פריטים', icon: '📜' },
  { id: 'boost', label: 'חיזוקים', icon: '⚡' },
];

interface ShopPageProps {
  onClose?: () => void;
}

export function ShopPage({ onClose }: ShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('cloak');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const { buyItem, equipItem, equippedItems, hasItem } = useShopStore();
  const playerCoins = usePlayerStore((s) => s.coins);
  const playerLevel = usePlayerStore((s) => s.level);

  const items = getShopItemsByCategory(selectedCategory);

  const handlePurchase = (itemId: string) => {
    const result = buyItem(itemId);
    if (result.success) {
      playPurchase();
      setPurchaseMessage('🎉 רכישה בוצעה בהצלחה!');
    } else {
      playWrong();
      setPurchaseMessage(`❌ ${result.error}`);
    }
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  const handleEquip = (itemId: string, category: ItemCategory) => {
    if (category === 'cloak' || category === 'pet') {
      playClick();
      const currentlyEquipped = equippedItems[category];
      if (currentlyEquipped === itemId) {
        // Unequip
        useShopStore.getState().unequipItem(category);
      } else {
        // Equip
        equipItem(itemId, category);
      }
    }
  };

  const handleUse = (itemId: string) => {
    const success = useShopStore.getState().consumeItem(itemId);
    if (success) {
      playCoin();
      setPurchaseMessage('✨ השתמשת בפריט!');
    } else {
      playWrong();
      setPurchaseMessage('❌ לא ניתן להשתמש בפריט');
    }
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛒</span>
          <h1 className="text-2xl font-bold text-white">חנות</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Coins display */}
          <div className="flex items-center gap-2 bg-yellow-900/30 px-4 py-2 rounded-full border border-yellow-500/50">
            <span className="text-xl">💰</span>
            <span className="text-yellow-400 font-bold">{playerCoins}</span>
          </div>

          {/* Close button */}
          {onClose && (
            <motion.button
              className="text-gray-400 hover:text-white text-2xl"
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              ✕
            </motion.button>
          )}
        </div>
      </div>

      {/* Level indicator */}
      <div className="text-gray-400 text-sm mb-4">
        שלב {playerLevel} - חלק מהפריטים נפתחים בשלבים גבוהים יותר
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Purchase message */}
      <AnimatePresence>
        {purchaseMessage && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-white">{purchaseMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const owned = hasItem(item.id);
          const equipped = equippedItems[item.category as 'cloak' | 'pet'] === item.id;

          return (
            <ItemCard
              key={item.id}
              item={item}
              owned={owned}
              equipped={equipped}
              onPurchase={() => handlePurchase(item.id)}
              onEquip={() => handleEquip(item.id, item.category)}
              onUse={() => handleUse(item.id)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <span className="text-4xl mb-4 block">🏪</span>
          <p>אין פריטים בקטגוריה זו</p>
        </div>
      )}

      {/* Shop tips */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <span>💡</span>
          טיפים
        </h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• גלימות וחיות מחמד נותנות בונוסים קבועים</li>
          <li>• פריטים חד-פעמיים נעלמים לאחר שימוש</li>
          <li>• חיזוקים פעילים למספר חידות מוגבל</li>
          <li>• פתור חידות כדי להרוויח עוד מטבעות!</li>
        </ul>
      </div>
    </div>
  );
}
