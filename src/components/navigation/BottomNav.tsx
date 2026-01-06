'use client';

import { motion } from 'framer-motion';

export type NavTab = 'home' | 'play' | 'shop' | 'inventory' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'בית' },
  { id: 'play', icon: '🎮', label: 'שחק' },
  { id: 'shop', icon: '🛒', label: 'חנות' },
  { id: 'inventory', icon: '🎒', label: 'ציוד' },
  { id: 'profile', icon: '👤', label: 'פרופיל' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
            >
              <motion.span
                className="text-xl mb-0.5"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.span>
              <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
