'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItemCategory } from '@/engine/shopTypes';
import { useShopStore, useOwnedItems, useEquippedCloak, useEquippedPet } from '@/store/shopStore';
import { usePlayerStore } from '@/store/playerStore';
import { ItemCard } from './ItemCard';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

const TABS: { id: 'equipped' | 'all' | 'consumables'; label: string; icon: string }[] = [
  { id: 'equipped', label: 'מצויד', icon: '⚔️' },
  { id: 'all', label: 'הכל', icon: '📦' },
  { id: 'consumables', label: 'פריטים', icon: '🧪' },
];

interface InventoryViewProps {
  onClose?: () => void;
}

export function InventoryView({ onClose }: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<'equipped' | 'all' | 'consumables'>('equipped');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { equipItem, unequipItem, consumeItem, equippedItems } = useShopStore();
  const equippedCloak = useEquippedCloak();
  const equippedPet = useEquippedPet();
  const ownedItems = useOwnedItems();
  const activeEffects = usePlayerStore((s) => s.activeEffects);

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleEquip = (itemId: string, category: ItemCategory) => {
    if (category === 'cloak' || category === 'pet') {
      const currentlyEquipped = equippedItems[category];
      if (currentlyEquipped === itemId) {
        unequipItem(category);
        showMessage('הפריט הוסר');
      } else {
        equipItem(itemId, category);
        showMessage('הפריט צויד!');
      }
    }
  };

  const handleUse = (itemId: string) => {
    const success = consumeItem(itemId);
    if (success) {
      showMessage('✨ השתמשת בפריט!');
    } else {
      showMessage('❌ לא ניתן להשתמש בפריט');
    }
  };

  // Filter items based on tab
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'equipped':
        return ownedItems.filter(
          (i) => i.item?.category === 'cloak' || i.item?.category === 'pet'
        );
      case 'consumables':
        return ownedItems.filter(
          (i) => i.item?.category === 'consumable' || i.item?.category === 'boost'
        );
      case 'all':
      default:
        return ownedItems;
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎒</span>
          <h1 className="text-2xl font-bold text-white">תיק הציוד</h1>
        </div>

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

      {/* Avatar preview */}
      <div className="flex justify-center mb-6">
        <AvatarDisplay size="lg" showPet={true} showEffects={true} />
      </div>

      {/* Equipped items summary */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
        <h3 className="text-white font-bold mb-3">פריטים מצוידים</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Cloak slot */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
            <div className="text-gray-400 text-xs mb-1">גלימה</div>
            {equippedCloak ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{equippedCloak.visual}</span>
                <div>
                  <div className="text-white text-sm font-medium">{equippedCloak.nameHe}</div>
                  <div className="text-gray-400 text-xs">{equippedCloak.descriptionHe}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <span className="text-2xl opacity-30">🎭</span>
                <span>לא מצויד</span>
              </div>
            )}
          </div>

          {/* Pet slot */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
            <div className="text-gray-400 text-xs mb-1">חיית מחמד</div>
            {equippedPet ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{equippedPet.visual}</span>
                <div>
                  <div className="text-white text-sm font-medium">{equippedPet.nameHe}</div>
                  <div className="text-gray-400 text-xs">{equippedPet.descriptionHe}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <span className="text-2xl opacity-30">🐾</span>
                <span>לא מצויד</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active effects */}
      {activeEffects.length > 0 && (
        <div className="bg-purple-900/30 rounded-xl p-4 mb-6 border border-purple-500/50">
          <h3 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
            <span>✨</span>
            אפקטים פעילים
          </h3>
          <div className="space-y-2">
            {activeEffects.map((effect, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white">
                  {effect.type === 'xp_multiplier' && `×${effect.value} XP`}
                  {effect.type === 'coin_multiplier' && `×${effect.value} מטבעות`}
                  {effect.type === 'skill_boost' && `+${Math.round(effect.value * 100)}% כישור`}
                  {effect.type === 'hint_boost' && `${effect.value} רמזים חינם`}
                  {effect.type === 'undo_error' && `${effect.value} ביטולים`}
                  {effect.type === 'time_bonus' && `+${effect.value}s זמן`}
                </span>
                {effect.duration !== undefined && (
                  <span className="text-purple-400">
                    {effect.duration} חידות
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Action message */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-white">{actionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(({ itemId, quantity, item }) => {
          if (!item) return null;
          const equipped = equippedItems[item.category as 'cloak' | 'pet'] === itemId;

          return (
            <ItemCard
              key={itemId}
              item={item}
              owned={true}
              equipped={equipped}
              quantity={quantity}
              showActions={true}
              onEquip={() => handleEquip(itemId, item.category)}
              onUse={() => handleUse(itemId)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <span className="text-4xl mb-4 block">📦</span>
          <p>אין פריטים בקטגוריה זו</p>
          <p className="text-sm mt-2">בקר בחנות כדי לרכוש פריטים</p>
        </div>
      )}

      {/* Stats summary */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <span>📊</span>
          סטטיסטיקות
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">סה״כ פריטים: </span>
            <span className="text-white">{ownedItems.length}</span>
          </div>
          <div>
            <span className="text-gray-400">פריטים מצוידים: </span>
            <span className="text-white">
              {Object.keys(equippedItems).length}/2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
